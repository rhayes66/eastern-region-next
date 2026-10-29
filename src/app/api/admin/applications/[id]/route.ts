import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { dbConnect } from "@/lib/db";
import { MemberApplication } from "@/models/MemberApplication";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { sendEmail, applicationStatusEmail } from "@/lib/email";

/**
 * Accept or reject an application (admin only, requirement 2).
 * Body: { action: "accept" | "reject" }
 * Accepting provisions a User with role "Member" and links it to the application.
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
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const action = body.action;
  if (action !== "accept" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be 'accept' or 'reject'" },
      { status: 400 }
    );
  }

  await dbConnect();
  const application = await MemberApplication.findById(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  if (application.status !== "Pending") {
    return NextResponse.json(
      { error: `Application already ${application.status.toLowerCase()}` },
      { status: 409 }
    );
  }

  const details = application.yourDetails;

  if (action === "reject") {
    application.status = "Rejected";
    application.rejectedDate = new Date();
    application.rejectedBy = admin.id as unknown as typeof application.rejectedBy;
    await application.save();

    if (details.email) {
      const name = details.firstname ?? "applicant";
      await sendEmail(
        details.email,
        "GERAF application update",
        applicationStatusEmail(name, false)
      );
    }
    return NextResponse.json({ status: "Rejected" });
  }

  // ---- Accept: provision the member account ----
  let member = details.email
    ? await User.findOne({ email: details.email.toLowerCase() })
    : null;

  // Temporary password; the member resets it via the account-reset flow (req 11).
  const tempPassword = randomBytes(12).toString("base64url") + "A1!";

  if (!member) {
    member = await User.create({
      email: details.email?.toLowerCase(),
      password: details.email ? tempPassword : undefined,
      title: details.title,
      firstname: details.firstname,
      lastname: details.lastname,
      gender: details.gender,
      dateOfBirth: details.dateOfBirth,
      children: details.children,
      fathersname: details.fathersname,
      mothersname: details.mothersname,
      spousename: details.spousename,
      occupation: details.occupation,
      address: details.address,
      postalCode: details.postalCode,
      city: details.city,
      ghanacity: details.ghanacity,
      finlandContact: details.finlandContact,
      role: "Member",
    });
  } else {
    member.role = "Member";
    await member.save();
  }

  application.status = "Accepted";
  application.acceptedDate = new Date();
  application.acceptedBy = admin.id as unknown as typeof application.acceptedBy;
  application.member = member._id;
  await application.save();

  if (details.email) {
    const name = details.firstname ?? "member";
    await sendEmail(
      details.email,
      "Welcome to GERAF",
      applicationStatusEmail(name, true)
    );
  }

  return NextResponse.json({ status: "Accepted", memberId: member._id.toString() });
}
