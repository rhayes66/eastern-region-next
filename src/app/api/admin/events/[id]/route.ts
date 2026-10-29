import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import { getSessionUser } from "@/lib/session";
import { eventSchema } from "@/lib/validation";

/** Update an event (admin only, requirement 6). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = eventSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { startDate, endDate, ...rest } = parsed.data;
  if (endDate && new Date(endDate) < new Date(startDate)) {
    return NextResponse.json(
      { error: "End date cannot be before the start date." },
      { status: 400 }
    );
  }

  await dbConnect();
  const event = await Event.findByIdAndUpdate(
    id,
    {
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    },
    { new: true }
  );
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/** Delete an event (admin only). */
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
  const res = await Event.findByIdAndDelete(id);
  if (!res) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
