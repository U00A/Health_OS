import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./security";

export const current = query({
  args: { betterAuthId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.betterAuthId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) return null;
    return { ...user, role: user.role || "patient" };
  },
});

// Find user by email
export const findByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.find((u) => u.email === args.email) || null;
  },
});

// Delete user by email (admin only)
export const deleteUserByEmail = mutation({
  args: {
    betterAuthId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);

    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.email === args.email);

    if (!user) {
      throw new Error(`User with email ${args.email} not found.`);
    }

    // Delete associated patient record first
    const patients = await ctx.db.query("patients").collect();
    const patient = patients.find((p) => p.user_id === user._id);
    if (patient) {
      await ctx.db.delete(patient._id);
    }

    // Delete the user
    await ctx.db.delete(user._id);

    return { success: true, email: args.email };
  },
});

// List all users (for debugging/cleanup)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Delete all users with patient role (admin only)
export const deleteAllPatientUsers = mutation({
  args: {
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);

    const users = await ctx.db.query("users").collect();
    const patientUsers = users.filter((u) => u.role === "patient" || !u.role);

    let deletedCount = 0;
    for (const user of patientUsers) {
      // Delete associated patient record first
      const patients = await ctx.db.query("patients").collect();
      const patient = patients.find((p) => p.user_id === user._id);
      if (patient) {
        await ctx.db.delete(patient._id);
      }
      // Delete the user
      await ctx.db.delete(user._id);
      deletedCount++;
    }

    return { success: true, deletedCount };
  },
});
