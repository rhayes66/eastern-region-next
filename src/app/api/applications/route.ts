import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { MemberApplication } from "@/models/MemberApplication";
import { User } from "@/models/User";
import { applicationSchema } from "@/lib/validation";

/**
 * Public endpoint (requirement 7): anyone can submit a membership application.
 * The applicant chooses their login email + password here; the password is
 * hashed immediately and copied to their User account when an admin accepts
 * (requirement 2). Stored with status "Pending".
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Separate credentials from the applicant detail fields.
  const { password, confirmPassword, ...details } = parsed.data;
  void confirmPassword;
  const email = details.email.toLowerCase();
  details.email = email;

  await dbConnect();

  // Reject if an account with this email already exists (member or applicant).
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in instead." },
      { status: 409 }
    );
  }

  // Guard against duplicate pending submissions by the same email.
  const existingApp = await MemberApplication.findOne({
    "yourDetails.email": email,
    status: "Pending",
  });
  if (existingApp) {
    return NextResponse.json(
      { error: "An application with this email is already pending review." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const application = await MemberApplication.create({
    yourDetails: details,
    passwordHash,
    status: "Pending",
    applicationDate: new Date(),
  });

  return NextResponse.json(
    { id: application._id.toString(), status: application.status },
    { status: 201 }
  );
}
