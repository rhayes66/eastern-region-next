import { auth } from "@/auth";

export type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  picture?: string | null;
};

/** Current signed-in user (or null) for use in server components. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser | undefined) ?? null;
}
