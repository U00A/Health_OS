import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("beds").collect();
  },
});

export const getWardBeds = query({
  args: { ward_id: v.id("wards") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("beds")
      .withIndex("by_ward", (q) => q.eq("ward_id", args.ward_id))
      .collect();
  },
});

export const create = mutation({
  args: {
    betterAuthId: v.string(),
    ward_id: v.id("wards"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "medical_staff"], args.betterAuthId);
    return await ctx.db.insert("beds", {
      ward_id: args.ward_id,
      name: args.name,
      status: "vacant",
    });
  },
});
