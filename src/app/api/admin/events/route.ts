import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import { getSessionUser } from "@/lib/session";
import { eventSchema } from "@/lib/validation";

/** List events (any signed-in user). Optional ?when=upcoming|past. */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const when = new URL(req.url).searchParams.get("when");
  await dbConnect();
  const now = new Date();
  const query =
    when === "upcoming"
      ? { startDate: { $gte: now } }
      : when === "past"
        ? { startDate: { $lt: now } }
        : {};
  const events = await Event.find(query).sort({ startDate: 1 }).lean();
  return NextResponse.json({ events });
}

/** Create an event (admin only, requirement 6). */
export async function POST(req: NextRequest) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = eventSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { startDate, endDate, ...rest } = parsed.data;
  // Reject an end date that precedes the start.
  if (endDate && new Date(endDate) < new Date(startDate)) {
    return NextResponse.json(
      { error: "End date cannot be before the start date." },
      { status: 400 }
    );
  }

  await dbConnect();
  const event = await Event.create({
    ...rest,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : undefined,
    createdBy: admin.id,
  });
  return NextResponse.json({ id: event._id.toString() }, { status: 201 });
}
