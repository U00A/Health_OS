/* eslint-disable @typescript-eslint/no-require-imports */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

const COOKIE_NAME = "health_os_session";

// Simple password hashing (for dev only)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "dev-salt-123");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  return hashed === await hashPassword(plain);
}

// Default dev users for initial setup
const DEFAULT_USERS: Omit<StoredUser, "passwordHash">[] = [
  {
    id: "admin_001",
    email: "admin@test.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "doctor_001", 
    email: "doctor@test.com",
    name: "Test Doctor",
    role: "medecin_etat",
  },
  {
    id: "patient_001",
    email: "patient@test.com", 
    name: "Test Patient",
    role: "patient",
  }
];

async function readUsers(): Promise<StoredUser[]> {
  const { default: fs } = await import("fs/promises");
  const { default: path } = await import("path");
  const filePath = path.join(process.cwd(), "dev_users.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  const { default: fs } = await import("fs/promises");
  const { default: path } = await import("path");
  const filePath = path.join(process.cwd(), "dev_users.json");
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
}

async function initDefaultUsers(): Promise<void> {
  const users = await readUsers();
  if (users.length === 0) {
    const defaultWithPasswords: StoredUser[] = [];
    for (const u of DEFAULT_USERS) {
      const pwd = u.email === "admin@test.com" ? "admin123" : 
                  u.email === "doctor@test.com" ? "doctor123" : "patient123";
      defaultWithPasswords.push({ ...u, passwordHash: await hashPassword(pwd) });
    }
    await writeUsers(defaultWithPasswords);
  }
}

// Cookie functions (server-side only)
export async function setAuthCookie(user: User): Promise<void> {
  const { cookies } = await import("next/headers");
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

export async function getAuthUser(): Promise<User | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) return null;
    return JSON.parse(Buffer.from(session.value, "base64").toString());
  } catch {
    return null;
  }
}

export async function clearAuthCookie(): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function handleLogin(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  await initDefaultUsers();
  const users = await readUsers();

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { user: null, error: "User not found" };
  }
  
  if (!await comparePasswords(password, user.passwordHash)) {
    return { user: null, error: "Invalid password" };
  }
  
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, error: null };
}

export async function handleSignup(email: string, password: string, name: string, role: string): Promise<{ user: User | null; error: string | null }> {
  await initDefaultUsers();
  const users = await readUsers();
  
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { user: null, error: "Email already exists" };
  }
  
  const newUser: StoredUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    email,
    name,
    role,
    passwordHash: await hashPassword(password),
  };
  
  users.push(newUser);
  await writeUsers(users);
  
  const { passwordHash: _, ...safeUser } = newUser;
  return { user: safeUser, error: null };
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