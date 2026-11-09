import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

export type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  picture?: string | null;
};

/**
 * Current signed-in user (or null), with the role read LIVE from the database.
 *
 * The session token carries a role too, but it is a snapshot taken at sign-in
 * and stays valid until the token expires. Trusting it would let a demoted or
 * deleted admin keep admin access. So the token only identifies WHO the user
 * is; what they may do comes from the database on every call.
 *
 * Returns null when there is no session or the account no longer exists.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const tokenUser = session?.user as SessionUser | undefined;
  if (!tokenUser) return null;

  await dbConnect();
  let dbUser: { role?: string } | null = null;
  if (tokenUser.id && mongoose.isValidObjectId(tokenUser.id)) {
    dbUser = await User.findById(tokenUser.id).select("role").lean<{ role?: string }>();
  } else if (tokenUser.email) {
    dbUser = await User.findOne({ email: tokenUser.email })
      .select("role")
      .lean<{ role?: string }>();
  }
  if (!dbUser) return null; // account was deleted → treat as signed out

  return { ...tokenUser, role: dbUser.role };
}

/**
 * Guard for admin PAGES (server components). Call it next to the data access,
 * not in a layout: layouts do not re-render on navigation, so a layout-only
 * check would not run on every request. Redirects instead of rendering.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "Admin") redirect("/profile");
  return user;
}
