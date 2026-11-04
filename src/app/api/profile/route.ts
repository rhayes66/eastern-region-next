import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { profileSchema } from "@/lib/validation";

/** A signed-in member updates their own profile details. */
export async function PATCH(req: NextRequest) {
  const me = await getSessionUser();
  if (!me?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Empty optional values are removed rather than stored as "".
  const $set: Record<string, string> = {};
  const $unset: Record<string, ""> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === "") $unset[k] = "";
    else $set[k] = v;
  }

  await dbConnect();
  const res = await User.findByIdAndUpdate(
    me.id,
    { $set, ...(Object.keys($unset).length ? { $unset } : {}) },
    { runValidators: true }
  );
  if (!res) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
