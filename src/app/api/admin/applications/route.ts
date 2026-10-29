import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { MemberApplication } from "@/models/MemberApplication";
import { getSessionUser } from "@/lib/session";

/** List applications (admin only, requirement 2). Optional ?status= filter. */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (user?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await dbConnect();
  const query = status ? { status } : {};
  const applications = await MemberApplication.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ applications });
}
