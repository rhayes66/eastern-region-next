import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User, PasswordReset } from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { adminSetPasswordSchema } from "@/lib/validation";

/**
 * Admin sets a new password for a member (support / recovery, requirement 11).
 * Body: { password: string }  — plaintext; the User pre-save hook hashes it.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = adminSetPasswordSchema.safeParse(
    await req.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Password must be 6+ chars with upper, lower, number and symbol." },
      { status: 422 }
    );
  }

  await dbConnect();
  const member = await User.findById(id).select("+password");
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Assigning plaintext marks the field modified → pre-save hook hashes it.
  member.password = parsed.data.password;
  await member.save();

  // Invalidate any outstanding reset tokens, so a previously-issued reset link
  // cannot be used to overwrite this administrator-set password.
  await PasswordReset.deleteMany({ user: member._id });

  return NextResponse.json({ ok: true });
}
