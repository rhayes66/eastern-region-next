import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Benefit } from "@/models/Benefit";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { benefitSchema } from "@/lib/validation";

/** List benefits (admin). Optional ?member= filter. */
export async function GET(req: Request) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const member = new URL(req.url).searchParams.get("member");
  await dbConnect();
  const query = member ? { member } : {};
  const benefits = await Benefit.find(query).sort({ requestedDate: -1 }).lean();
  return NextResponse.json({ benefits });
}

/** Grant/record a benefit for a member (requirement 5, admin only). */
export async function POST(req: NextRequest) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = benefitSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  await dbConnect();

  // Reject a well-formed-but-nonexistent member id so we never create an orphan
  // financial record.
  if (!isValidObjectId(parsed.data.member)) {
    return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
  }
  const memberExists = await User.exists({ _id: parsed.data.member });
  if (!memberExists) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const benefit = await Benefit.create({
    ...parsed.data,
    status: "Approved", // admin recording a granted benefit
    requestedDate: new Date(),
    approvedDate: new Date(),
    approvedBy: admin.id,
    addedBy: admin.id,
  });
  return NextResponse.json({ id: benefit._id.toString() }, { status: 201 });
}
