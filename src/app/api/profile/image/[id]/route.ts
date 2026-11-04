import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { ProfileImage } from "@/models/ProfileImage";
import { getSessionUser } from "@/lib/session";

/** Serve a member's uploaded photo. Signed-in users only (member privacy). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getSessionUser();
  if (!me?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await dbConnect();
  const img = await ProfileImage.findOne({ user: id });
  if (!img) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.contentType,
      "X-Content-Type-Options": "nosniff",
      // URL carries ?v=<timestamp>, so a new upload busts the cache.
      "Cache-Control": "private, max-age=86400",
    },
  });
}
