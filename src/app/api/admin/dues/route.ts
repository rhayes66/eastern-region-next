import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Dues } from "@/models/Dues";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { duesSchema } from "@/lib/validation";

/** List dues (admin). Optional ?member= filter. */
export async function GET(req: Request) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const member = new URL(req.url).searchParams.get("member");
  await dbConnect();
  const query = member ? { member } : {};
  const dues = await Dues.find(query).sort({ year: -1, addedDate: -1 }).lean();
  return NextResponse.json({ dues });
}

/** Record a monthly due for a member (requirement 3, admin only). */
export async function POST(req: NextRequest) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = duesSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  await dbConnect();

  // Reject a well-formed-but-nonexistent member id so we never create an orphan
  // financial record (the Mongoose ref alone does not verify existence).
  if (!isValidObjectId(parsed.data.member)) {
    return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
  }
  const memberExists = await User.exists({ _id: parsed.data.member });
  if (!memberExists) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  try {
    const dues = await Dues.create({
      ...parsed.data,
      addedBy: admin.id,
      addedDate: new Date(),
      paidDate: parsed.data.paid ? new Date() : undefined,
    });
    return NextResponse.json({ id: dues._id.toString() }, { status: 201 });
  } catch (err: unknown) {
    // Unique index on (month, year, member) — duplicate dues for that period.
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "A dues record for this member, month and year already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}
