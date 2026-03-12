import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnPlatform = req.nextUrl.pathname.startsWith("/(platform)") ||
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/campaigns") ||
    req.nextUrl.pathname.startsWith("/influencers") ||
    req.nextUrl.pathname.startsWith("/messages") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/applications") ||
    req.nextUrl.pathname.startsWith("/payments") ||
    req.nextUrl.pathname.startsWith("/notifications");

  if (isOnPlatform && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/campaigns/:path*",
    "/influencers/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/applications/:path*",
    "/payments/:path*",
    "/notifications/:path*",
  ],
};
