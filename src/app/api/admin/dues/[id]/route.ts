import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Dues } from "@/models/Dues";
import { getSessionUser } from "@/lib/session";

/** Mark a dues record paid/unpaid (admin only, requirement 3). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { paid?: boolean };
  if (typeof body.paid !== "boolean") {
    return NextResponse.json({ error: "paid (boolean) is required" }, { status: 400 });
  }

  await dbConnect();
  const dues = await Dues.findById(id);
  if (!dues) {
    return NextResponse.json({ error: "Dues record not found" }, { status: 404 });
  }

  dues.paid = body.paid;
  dues.paidDate = body.paid ? new Date() : undefined;
  await dues.save();

  return NextResponse.json({ ok: true, paid: dues.paid });
}

/** Delete a dues record (admin only). */
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
  const res = await Dues.findByIdAndDelete(id);
  if (!res) {
    return NextResponse.json({ error: "Dues record not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
