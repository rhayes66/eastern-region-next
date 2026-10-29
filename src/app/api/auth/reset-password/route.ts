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

  const record = await PasswordReset.findOne({ hash: hashToken(token) });
  if (!record || record.expiryTimestamp.getTime() < Date.now()) {
    if (record) await PasswordReset.deleteOne({ _id: record._id }); // clean expired
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const user = await User.findById(record.user).select("+password");
  if (!user) {
    await PasswordReset.deleteOne({ _id: record._id });
    return NextResponse.json({ error: "Account no longer exists." }, { status: 404 });
  }

  user.password = password; // plaintext → pre-save hook hashes it
  await user.save();

  // Consume the token so the link cannot be reused.
  await PasswordReset.deleteMany({ user: user._id });

  return NextResponse.json({ ok: true });
}
