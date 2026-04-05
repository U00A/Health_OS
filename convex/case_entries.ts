import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const createEntry = mutation({
  args: {
    betterAuthId: v.string(),
    ward_id: v.id("wards"),
    entry_type: v.union(
      v.literal("observation"),
      v.literal("nursing_note"),
      v.literal("escalation"),
      v.literal("procedure"),
      v.literal("general")
    ),
    notes: v.optional(v.string()),
    patient_id: v.optional(v.id("patients")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medical_staff"], args.betterAuthId);

    return await ctx.db.insert("case_entries", {
      ward_id: args.ward_id,
      actor_id: user._id,
      timestamp: Date.now(),
      entry_type: args.entry_type,
      notes: args.notes,
      patient_id: args.patient_id,
    });
  },
});

export const getWardLog = query({
  args: {
    betterAuthId: v.string(),
    ward_id: v.id("wards"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["medical_staff", "medecin_etat", "admin"], args.betterAuthId);
    return await ctx.db
      .query("case_entries")
      .withIndex("by_ward", (q) => q.eq("ward_id", args.ward_id))
      .order("desc")
      .take(50);
  },
});
