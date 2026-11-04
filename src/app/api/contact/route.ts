import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { sendEmail, contactEmail, CONTACT_INBOX } from "@/lib/email";

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

  const sent = await sendEmail(
    CONTACT_INBOX,
    `[GERAF contact] ${subject}`,
    contactEmail(name, email, subject, message)
  );

  // We accept the message either way; email may be unconfigured in dev.
  return NextResponse.json({
    ok: true,
    sent,
    message: sent
      ? "Thanks — your message has been sent."
      : "Thanks — your message was received.",
  });
}
