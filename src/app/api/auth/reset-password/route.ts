import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { dbConnect } from "@/lib/db";
import { User, PasswordReset } from "@/models/User";
import { resetPasswordSchema } from "@/lib/validation";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Complete a password reset (requirement 11). Consumes a one-time, time-limited
 * token and sets the new password (hashed by the User pre-save hook).
 */
export async function POST(req: NextRequest) {
  const parsed = resetPasswordSchema.safeParse(
    await req.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Invalid request. Password must be 6+ chars with upper, lower, number and symbol, and match the confirmation.",
      },
      { status: 422 }
    );
  }

  const { token, password } = parsed.data;
  await dbConnect();

  // Atomically CLAIM the token: find an unexpired record by hash and delete it
  // in one operation, so two concurrent requests cannot both succeed (the link
  // is genuinely single-use). An expired or unknown token matches nothing.
  const record = await PasswordReset.findOneAndDelete({
    hash: hashToken(token),
    expiryTimestamp: { $gt: new Date() },
  });
  if (!record) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const user = await User.findById(record.user).select("+password");
  if (!user) {
    return NextResponse.json({ error: "Account no longer exists." }, { status: 404 });
  }

  user.password = password; // plaintext → pre-save hook hashes it
  await user.save();

  // Belt-and-braces: drop any other outstanding tokens for this user.
  await PasswordReset.deleteMany({ user: user._id });

  return NextResponse.json({ ok: true });
}
