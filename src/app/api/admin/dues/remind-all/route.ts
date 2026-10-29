import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { remindAllOutstanding } from "@/lib/remind";

/**
 * Send WhatsApp reminders for ALL outstanding dues (requirement 10). Admin only.
 * (The scheduled job uses /api/cron/remind with a shared-secret header instead.)
 */
export async function POST() {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await remindAllOutstanding();
  return NextResponse.json({ ok: true, ...result });
}
