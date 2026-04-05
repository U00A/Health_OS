import { NextRequest, NextResponse } from "next/server";
import { handleLogin, setAuthCookie, getRoleRedirect } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const { user, error } = await handleLogin(email, password);
    
    if (error || !user) {
      return NextResponse.json({ error: error || "Login failed" }, { status: 401 });
    }

    await setAuthCookie(user);
    
    return NextResponse.json({ 
      user,
      redirect: getRoleRedirect(user.role)
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}