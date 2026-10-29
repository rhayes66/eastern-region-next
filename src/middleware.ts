import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Initialize NextAuth from the Edge-safe config only — no DB, no bcrypt, so the
// middleware bundle stays within the Edge runtime. Route gating is handled by
// the `authorized` callback in authConfig; unauthorized users are redirected to
// the signIn page automatically.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // When `authorized` returns false for /admin to a non-admin, NextAuth would
  // send them to the signIn page. Prefer sending a logged-in non-admin to their
  // profile instead of the login screen.
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  if (
    pathname.startsWith("/admin") &&
    req.auth?.user &&
    role !== "Admin"
  ) {
    return Response.redirect(new URL("/profile", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
