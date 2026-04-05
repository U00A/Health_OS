import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function hashPassword(password: string): string {
  let hash = 0;
  const salted = password + "health_os_dev_salt_2024";
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36) + "_" + salted.length;
}

function comparePasswords(plain: string, hashed: string): boolean {
  return hashPassword(plain) === hashed;
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Email already exists");
    }

    // Generate a deterministic betterAuthId so existing Convex queries work
    const betterAuthId = "local_" + args.email.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: args.role as any || "patient",
      passwordHash: hashPassword(args.password),
      betterAuthId,
    });

    return { userId };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.passwordHash || !comparePasswords(args.password, user.passwordHash)) {
      throw new Error("Invalid password");
    }

    return {
      id: user._id,
      email: user.email ?? "",
      name: user.name ?? "",
      role: user.role ?? "patient",
      betterAuthId: user.betterAuthId ?? "",
    };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) return null;
    return { id: user._id, email: user.email ?? "", name: user.name ?? "", role: user.role ?? "patient", betterAuthId: user.betterAuthId ?? "" };
  },
});