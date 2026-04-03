import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./security";

// Admin-only user management
export const listAll = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    return await ctx.db.query("users").collect();
  },
});

export const updateRoleAndHospital = mutation({
  args: {
    betterAuthId: v.string(),
    user_id: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("medecin_etat"),
      v.literal("private_doctor"),
      v.literal("medical_staff"),
      v.literal("pharmacy"),
      v.literal("laboratory"),
      v.literal("patient")
    ),
    hospital_id: v.optional(v.id("hospitals")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    await ctx.db.patch(args.user_id, {
      role: args.role,
      hospital_id: args.hospital_id,
    });
  },
});
