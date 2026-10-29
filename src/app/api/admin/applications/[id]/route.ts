import { NextRequest, NextResponse } from "next/server";
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
  // passwordHash is select:false — ask for it explicitly, we need it on accept.
  const application = await MemberApplication.findById(id).select("+passwordHash");
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
  const email = details.email?.toLowerCase();
  const existing = email ? await User.findOne({ email }) : null;
  let member = existing;

  if (!member) {
    // New account: create it, then install the password the applicant chose.
    // The stored value is ALREADY a bcrypt hash, so write it with updateOne to
    // bypass the pre-save hook (which would otherwise double-hash it).
    member = await User.create({
      email,
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
    if (application.passwordHash) {
      await User.updateOne(
        { _id: member._id },
        { $set: { password: application.passwordHash } }
      );
    }
  } else {
    // SECURITY: an account with this email already exists (e.g. a Google
    // sign-in). Promote it to Member but NEVER overwrite its credentials
    // (password/google/email) — doing so would let an attacker who submitted an
    // application under someone else's email take over that account.
    // DO copy the approved non-credential application details onto the record,
    // so the promoted member isn't missing address / home town / contact etc.
    // Only fill fields the application actually provided (don't blank existing).
    const detailFields = {
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
    } as const;
    for (const [key, value] of Object.entries(detailFields)) {
      if (value !== undefined && value !== null && value !== "") {
        (member as unknown as Record<string, unknown>)[key] = value;
      }
    }
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
