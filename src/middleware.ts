import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;
  const isLoggedIn = !!req.auth;

  const isAdminArea = pathname.startsWith("/admin");
  const isProfileArea = pathname.startsWith("/profile");

  if ((isAdminArea || isProfileArea) && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminArea && user?.role !== "Admin") {
    return NextResponse.redirect(new URL("/profile", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
