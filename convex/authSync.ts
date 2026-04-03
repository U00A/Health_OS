import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sync a Better Auth user into the Convex users table.
 * Called from the frontend after successful sign-in/sign-up.
 */
export const syncUser = mutation({
  args: {
    betterAuthId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by Better Auth ID
    const existing = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (existing) {
      // Update if needed
      const updates: Record<string, unknown> = {};
      if (args.name && args.name !== existing.name) updates.name = args.name;
      if (args.email && args.email !== existing.email) updates.email = args.email;
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
      return existing._id;
    }

    // Check if user exists by email (from old seeds)
    const byEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (byEmail) {
      // Link existing email user to Better Auth
      await ctx.db.patch(byEmail._id, { betterAuthId: args.betterAuthId });
      return byEmail._id;
    }

    // Create new Convex user
    const role = (args.role as "admin" | "medecin_etat" | "private_doctor" | "medical_staff" | "pharmacy" | "laboratory" | "patient") || "patient";
    const userId = await ctx.db.insert("users", {
      betterAuthId: args.betterAuthId,
      email: args.email,
      name: args.name,
      role,
    });

    return userId;
  },
});

/**
 * Get the current Convex user by their Better Auth ID.
 */
export const getByBetterAuthId = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();
    if (!user) return null;
    return { ...user, role: user.role || "patient" };
  },
});
