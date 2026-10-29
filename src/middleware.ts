import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Initialize NextAuth from the Edge-safe config only — no DB, no bcrypt, so the
// middleware bundle stays within the Edge runtime.
export const { auth: middleware } = NextAuth(authConfig);

// With a custom middleware callback, the `authorized` callback's return value
// does NOT auto-redirect — THIS callback owns the response. So every gate must
// be enforced here explicitly, including anonymous access.
export default middleware((req) => {
  const { pathname, origin } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;
  const isLoggedIn = !!user;

  const isAdminArea = pathname.startsWith("/admin");
  const isProfileArea = pathname.startsWith("/profile");
  const isEventsArea = pathname.startsWith("/events");

  // Already signed in and visiting /login → send to their home.
  if (pathname === "/login" && isLoggedIn) {
    const dest = user?.role === "Admin" ? "/admin/applications" : "/profile";
    return NextResponse.redirect(new URL(dest, origin));
  }

  // Anonymous → login (preserve intended destination).
  if ((isAdminArea || isProfileArea || isEventsArea) && !isLoggedIn) {
    const url = new URL("/login", origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in non-admin hitting /admin → their profile.
  if (isAdminArea && user?.role !== "Admin") {
    return NextResponse.redirect(new URL("/profile", origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/events",
    "/events/:path*",
    "/login",
  ],
};
