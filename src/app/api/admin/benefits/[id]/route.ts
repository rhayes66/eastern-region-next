import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Benefit } from "@/models/Benefit";
import { getSessionUser } from "@/lib/session";
import { BENEFIT_STATUSES } from "@/lib/constants";

/** Update a benefit's status (admin only, requirement 5). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !BENEFIT_STATUSES.includes(body.status as (typeof BENEFIT_STATUSES)[number])) {
    return NextResponse.json(
      { error: `status must be one of: ${BENEFIT_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  await dbConnect();
  const benefit = await Benefit.findById(id);
  if (!benefit) {
    return NextResponse.json({ error: "Benefit not found" }, { status: 404 });
  }

  benefit.status = body.status;
  if (body.status === "Approved") {
    benefit.approvedDate = new Date();
    benefit.approvedBy = admin.id as unknown as typeof benefit.approvedBy;
  }
  if (body.status === "Disbursed") benefit.disbursedDate = new Date();
  if (body.status === "Rejected") benefit.rejectedDate = new Date();
  await benefit.save();

  return NextResponse.json({ ok: true, status: benefit.status });
}

/** Delete a benefit record (admin only). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await dbConnect();
  const res = await Benefit.findByIdAndDelete(id);
  if (!res) {
    return NextResponse.json({ error: "Benefit not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
