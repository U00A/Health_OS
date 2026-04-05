import { NextRequest, NextResponse } from "next/server";
import { handleSignup, setAuthCookie, getRoleRedirect } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name required" }, { status: 400 });
    }

    const { user, error } = await handleSignup(email, password, name, role || "patient");
    
    if (error || !user) {
      return NextResponse.json({ error: error || "Signup failed" }, { status: 400 });
    }

    await setAuthCookie(user);
    
    return NextResponse.json({ 
      user,
      redirect: getRoleRedirect(user.role)
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}