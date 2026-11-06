import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { ProfileImage } from "@/models/ProfileImage";
import { getSessionUser } from "@/lib/session";
import { detectImageType, MAX_PROFILE_IMAGE_BYTES } from "@/lib/image-sniff";

/** Upload (replace) the signed-in member's profile photo. */
export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (max 400 KB)." },
      { status: 413 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) {
    return NextResponse.json(
      { error: "Only JPEG, PNG or WebP images are allowed." },
      { status: 415 }
    );
  }

  await dbConnect();
  await ProfileImage.findOneAndUpdate(
    { user: me.id },
    { user: me.id, contentType: type, data: bytes },
    { upsert: true }
  );
  const picture = `/api/profile/image/${me.id}?v=${Date.now()}`;
  await User.findByIdAndUpdate(me.id, { $set: { picture } });
  return NextResponse.json({ ok: true, picture });
}

/** Remove the signed-in member's uploaded photo. */
export async function DELETE() {
  const me = await getSessionUser();
  if (!me?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  await dbConnect();
  await ProfileImage.deleteOne({ user: me.id });
  await User.findByIdAndUpdate(me.id, { $unset: { picture: "" } });
  return NextResponse.json({ ok: true });
}
