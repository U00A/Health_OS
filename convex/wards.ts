import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const create = mutation({
  args: {
    betterAuthId: v.string(),
    hospital_id: v.id("hospitals"),
    name: v.string(),
    floor: v.optional(v.string()),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    return await ctx.db.insert("wards", { hospital_id: args.hospital_id, name: args.name, floor: args.floor, capacity: args.capacity });
  },
});

export const update = mutation({
  args: {
    betterAuthId: v.string(),
    id: v.id("wards"),
    name: v.string(),
    floor: v.optional(v.string()),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    const { id, betterAuthId: _ba, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const listByHospital = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wards")
      .withIndex("by_hospital", (q) => q.eq("hospital_id", args.hospital_id))
      .collect();
  },
});
