import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export interface ConvexUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const COOKIE_NAME = "health_os_session";

// Get Convex client for server-side auth
function getConvexClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not set");
  return new ConvexHttpClient(url);
}

// Cookie functions (server-side only)
export async function setAuthCookie(user: ConvexUser): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(user)).toString("base64");
  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getAuthUser(): Promise<ConvexUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) return null;
    return JSON.parse(Buffer.from(session.value, "base64").toString());
  } catch {
    return null;
  }
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function handleLogin(email: string, password: string): Promise<{ user: ConvexUser | null; error: string | null }> {
  try {
    const convex = getConvexClient();
    const user = await convex.mutation(api.auth.login, { email, password });
    await setAuthCookie(user);
    return { user, error: null };
  } catch (err: any) {
    const error = err.message?.split("Uncaught Error: ")[1] || err.message || "Login failed";
    return { user: null, error };
  }
}

export async function handleSignup(email: string, password: string, name: string, role: string): Promise<{ user: ConvexUser | null; error: string | null }> {
  try {
    const convex = getConvexClient();
    await convex.mutation(api.auth.register, { email, password, name, role: role || "patient" });
    // Login after signup
    return handleLogin(email, password);
  } catch (err: any) {
    const error = err.message?.split("Uncaught Error: ")[1] || err.message || "Signup failed";
    return { user: null, error };
  }
}

export async function getUserByEmail(email: string): Promise<ConvexUser | null> {
  try {
    const convex = getConvexClient();
    return await convex.query(api.auth.getUserByEmail, { email });
  } catch {
    return null;
  }
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case "admin": return "/admin";
    case "medecin_etat": return "/doctor";
    case "private_doctor": return "/private";
    case "medical_staff": return "/staff";
    case "pharmacy": return "/pharmacy";
    case "laboratory": return "/lab";
    case "patient":
    default: return "/patient-portal";
  }
}