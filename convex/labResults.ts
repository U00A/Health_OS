import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const uploadResult = mutation({
  args: {
    betterAuthId: v.string(),
    order_id: v.id("lab_orders"),
    values: v.any(),
    pdf_storage_id: v.optional(v.id("_storage")),
    is_amendment: v.optional(v.boolean()),
    amends_result_id: v.optional(v.id("lab_results")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["laboratory"], args.betterAuthId);

    const order = await ctx.db.get(args.order_id);
    if (!order) throw new Error("Order not found");

    const resultId = await ctx.db.insert("lab_results", {
      order_id: args.order_id,
      patient_id: order.patient_id,
      uploaded_at: Date.now(),
      lab_tech_id: user._id,
      values: args.values,
      pdf_storage_id: args.pdf_storage_id,
      is_amendment: args.is_amendment || false,
      amends_result_id: args.amends_result_id,
    });

    // Mark order as completed
    await ctx.db.patch(args.order_id, { status: "completed" });

    return resultId;
  },
});

export const listByOrder = query({
  args: { order_id: v.id("lab_orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lab_results")
      .withIndex("by_order", (q) => q.eq("order_id", args.order_id))
      .order("desc")
      .collect();
  },
});

export const listByPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("lab_results")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .take(50);

    // Enrich with order info
    const enriched = await Promise.all(
      results.map(async (r) => {
        const order = await ctx.db.get(r.order_id);
        return {
          ...r,
          analysis_type: order?.analysis_type || "Unknown",
          urgency: order?.urgency || "routine",
          ordered_at: order?.ordered_at,
        };
      })
    );
    return enriched;
  },
});
