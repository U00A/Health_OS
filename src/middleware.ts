import { NextRequest, NextResponse } from "next/server";

const signInPages = ["/login", "/register"];
const protectedPrefixes = [
  "/admin",
  "/doctor",
  "/private",
  "/staff",
  "/pharmacy",
  "/lab",
  "/patient-portal",
];

const COOKIE_NAME = "health_os_session";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for our session cookie
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

  const isSignInPage = pathname === "/login";
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from sign-in pages
  if (isSignInPage && sessionCookie) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};