import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { sendEmailResult, contactEmail, CONTACT_INBOX } from "@/lib/email";
import { dbConnect } from "@/lib/db";
import { ContactCooldown } from "@/models/ContactCooldown";

// Minimum gap between accepted submissions from the same identity (email+IP).
const COOLDOWN_MS = 60_000;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Public contact form submission → emails the association inbox. */
export async function POST(req: NextRequest) {
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, subject, message } = parsed.data;

  // --- Rate limit (atomic claim before any mail is sent) -------------------
  // Flooding the inbox is the threat, so the throttle must run first. An
  // unauthenticated caller can't bypass it because the claim is a single
  // atomic upsert on a unique key; a second request inside the window loses
  // the claim (duplicate key / stale filter) and gets 429.
  const key = `${email.toLowerCase()}|${clientIp(req)}`;
  try {
    await dbConnect();
    const cutoff = new Date(Date.now() - COOLDOWN_MS);
    const claim = await ContactCooldown.findOneAndUpdate(
      { key, lastSentAt: { $lte: cutoff } },
      { $set: { lastSentAt: new Date(), expiresAt: new Date(Date.now() + COOLDOWN_MS) } },
      { upsert: true, returnDocument: "before" }
    );
    // If a recent doc already existed, the filter didn't match; upsert then
    // throws a duplicate-key error (caught below). If no doc existed, the
    // upsert inserts and `claim` is null — that's the winning first claim.
    void claim;
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 11000) {
      return NextResponse.json(
        { error: "Please wait a moment before sending another message." },
        { status: 429 }
      );
    }
    // DB unreachable — don't block a legitimate visitor on infra trouble, but
    // log it. (The send below may still succeed or fail on its own.)
    console.error("[contact] cooldown check failed:", err);
  }

  // --- Send -----------------------------------------------------------------
  const result = await sendEmailResult(
    CONTACT_INBOX,
    `[GERAF contact] ${subject}`,
    contactEmail(name, email, subject, message)
  );

  // A configured SMTP that FAILS must not be reported as success — otherwise
  // the visitor's message is silently lost. Only treat "not-configured" (dev)
  // as an acceptable non-send.
  if (result === "failed") {
    return NextResponse.json(
      {
        error:
          "Sorry — we couldn't send your message right now. Please try again shortly.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sent: result === "sent",
    message:
      result === "sent"
        ? "Thanks — your message has been sent."
        : "Thanks — your message was received.",
  });
}
