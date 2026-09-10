import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/tasks", "/profile"];
const AUTH_PAGES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAuthPage = AUTH_PAGES.some((prefix) => pathname.startsWith(prefix));
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/tasks/:path*", "/profile/:path*", "/login", "/register"],
};
