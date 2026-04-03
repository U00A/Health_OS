import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const getWardBeds = query({
  args: { ward_id: v.id("wards") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("beds")
      .withIndex("by_ward", (q) => q.eq("ward_id", args.ward_id))
      .collect();
  }
});

export const updateBedStatus = mutation({
  args: {
    betterAuthId: v.string(),
    bed_id: v.id("beds"),
    status: v.union(v.literal("vacant"), v.literal("occupied"), v.literal("pending_discharge"))
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["medical_staff", "admin", "medecin_etat"], args.betterAuthId);
    await ctx.db.patch(args.bed_id, { status: args.status });
  }
});
