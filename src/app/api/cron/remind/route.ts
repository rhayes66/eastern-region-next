import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { remindAllOutstanding } from "@/lib/remind";

/**
 * Scheduled debt-reminder endpoint (requirement 10). Called by an unattended
 * cron, so it authenticates with a shared secret instead of an admin session.
 * Send `Authorization: Bearer <CRON_SECRET>` (or `?key=<CRON_SECRET>`).
 * Returns 404 when CRON_SECRET is unset, so the route is inert until enabled.
 */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const provided = bearer || req.nextUrl.searchParams.get("key") || "";
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function run(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    // Don't reveal the route exists until the operator enables it.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await remindAllOutstanding();
  return NextResponse.json({ ok: true, ...result });
}

// POST is preferred; GET is allowed so simple schedulers (e.g. Vercel Cron) work.
export async function POST(req: NextRequest) {
  return run(req);
}
export async function GET(req: NextRequest) {
  return run(req);
}
