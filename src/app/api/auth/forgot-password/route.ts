import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { dbConnect } from "@/lib/db";
import { User, PasswordReset } from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Request a password reset (requirement 11). Always responds 200 regardless of
 * whether the email exists, to avoid account-enumeration. When it does exist a
 * one-time link is emailed; only the token HASH is stored.
 */
export async function POST(req: NextRequest) {
  const parsed = forgotPasswordSchema.safeParse(
    await req.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 422 });
  }

  const email = parsed.data.email.toLowerCase();
  await dbConnect();
  const user = await User.findOne({ email });

  if (user) {
    // Invalidate any prior outstanding tokens for this user.
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

  return NextResponse.json({
    ok: true,
    message: "If that email is registered, a reset link has been sent.",
  });
}
