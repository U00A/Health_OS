import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const create = mutation({
  args: {
    betterAuthId: v.string(),
    name: v.string(),
    address: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    const { betterAuthId: _, ...data } = args;
    return await ctx.db.insert("hospitals", data);
  },
});

export const update = mutation({
  args: {
    betterAuthId: v.string(),
    id: v.id("hospitals"),
    name: v.string(),
    address: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);
    const { id, betterAuthId: _, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const list = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "medecin_etat", "medical_staff"], args.betterAuthId); 
    // Certain staff might need to see hospital lists
    return await ctx.db.query("hospitals").order("asc").collect();
  },
});

export const get = query({
  args: { id: v.id("hospitals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
