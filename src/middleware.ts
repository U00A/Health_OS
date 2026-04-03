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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth stores session in this cookie. 
  // In production it might be __Secure-better-auth.session_token
  const sessionToken = 
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isSignIn = signInPages.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from sign-in pages
  if (isSignIn && sessionToken) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)","/" , "/(api|trpc)(.*)"],
};
