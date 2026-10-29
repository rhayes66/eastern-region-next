import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/session";

/** List members/users (admin only). Optional ?role= filter. */
export async function GET(req: Request) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  await dbConnect();
  const query = role ? { role } : {};
  // password is select:false, so it is never returned here.
  const users = await User.find(query)
    .select("email firstname lastname role finlandContact google createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ users });
}
