import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { dbConnect } from "@/lib/db";
import { User, PasswordReset } from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes between issued links

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Request a password reset (requirement 11). Always responds 200 regardless of
 * whether the email exists, to avoid account-enumeration. When it does exist a
 * one-time link is emailed; only the token HASH is stored.
 *
 * Per-account cooldown: if a link was issued in the last RESEND_COOLDOWN_MS we
 * do NOT invalidate it or send another. This stops an unauthenticated attacker
 * from flooding a victim's inbox and repeatedly invalidating a link the victim
 * is trying to use. (A per-IP limit additionally needs a shared store such as
 * Redis; add it at the edge/proxy in production.)
 */
export async function POST(req: NextRequest) {
  const parsed = forgotPasswordSchema.safeParse(
    await req.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 422 });
  }

  const nonEnumeratingResponse = () =>
    NextResponse.json({
      ok: true,
      message: "If that email is registered, a reset link has been sent.",
    });

  const email = parsed.data.email.toLowerCase();
  await dbConnect();
  const user = await User.findOne({ email });

  if (user) {
    // Cooldown check BEFORE touching existing tokens or sending mail.
    const recent = await PasswordReset.findOne({
      user: user._id,
      createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    });
    if (recent) {
      return nonEnumeratingResponse(); // issued very recently; do nothing
    }

    // Invalidate any prior (older) outstanding tokens for this user.
    await PasswordReset.deleteMany({ user: user._id });

    const token = randomBytes(32).toString("base64url");
    await PasswordReset.create({
      hash: hashToken(token),
      expiryTimestamp: new Date(Date.now() + TOKEN_TTL_MS),
      user: user._id,
    });

    const base = process.env.AUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${token}`;
    await sendEmail(email, "Reset your GERAF password", passwordResetEmail(resetUrl));
  }

  return nonEnumeratingResponse();
}
