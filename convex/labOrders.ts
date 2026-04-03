import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const createOrder = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    lab_id: v.optional(v.id("users")), // Routed to specific lab tech/facility
    analysis_type: v.string(),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);
    
    return await ctx.db.insert("lab_orders", {
      patient_id: args.patient_id,
      doctor_id: user._id,
      lab_id: args.lab_id,
      ordered_at: Date.now(),
      analysis_type: args.analysis_type,
      urgency: args.urgency,
      status: "pending",
    });
  }
});

export const listPendingOrders = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["laboratory"], args.betterAuthId);
    // Lab tech only sees their assigned orders, or unassigned ones.
    return await ctx.db
      .query("lab_orders")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();
  }
});
