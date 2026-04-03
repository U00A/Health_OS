import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const logEvent = mutation({
  args: {
    betterAuthId: v.string(),
    ward_id: v.id("wards"),
    entry_type: v.union(v.literal("shift_start"), v.literal("shift_end"), v.literal("escalation")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medical_staff", "medecin_etat", "admin"], args.betterAuthId);
    
    // Append-only operations
    return await ctx.db.insert("case_entries", {
      ward_id: args.ward_id,
      actor_id: user._id,
      timestamp: Date.now(),
      entry_type: args.entry_type,
      notes: args.notes,
    });
  }
});

export const getWardLog = query({
  args: { betterAuthId: v.string(), ward_id: v.id("wards") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["medical_staff", "medecin_etat", "admin"], args.betterAuthId);
    
    return await ctx.db
      .query("case_entries")
      .withIndex("by_ward", (q) => q.eq("ward_id", args.ward_id))
      .order("desc") // newest first
      .take(50); // limit for performance in UI
  }
});
