import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const create = mutation({
  args: {
    betterAuthId: v.string(),
    hospital_id: v.id("hospitals"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    return await ctx.db.insert("specialities", { hospital_id: args.hospital_id, name: args.name });
  },
});

export const remove = mutation({
  args: { betterAuthId: v.string(), id: v.id("specialities") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    await ctx.db.delete(args.id);
  },
});

export const listByHospital = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("specialities")
      .withIndex("by_hospital", (q) => q.eq("hospital_id", args.hospital_id))
      .collect();
  },
});
