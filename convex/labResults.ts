import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const uploadResult = mutation({
  args: {
    betterAuthId: v.string(),
    order_id: v.id("lab_orders"),
    values: v.any(), // JSON payload stringified
    pdf_storage_id: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["laboratory"], args.betterAuthId);
    
    const resultId = await ctx.db.insert("lab_results", {
      order_id: args.order_id,
      uploaded_at: Date.now(),
      lab_tech_id: user._id,
      values: args.values,
      pdf_storage_id: args.pdf_storage_id,
    });

    // Mark the order as completed
    await ctx.db.patch(args.order_id, { status: "completed" });
    
    return resultId;
  }
});

export const getResultForOrder = query({
  args: { order_id: v.id("lab_orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lab_results")
      .withIndex("by_order", (q) => q.eq("order_id", args.order_id))
      .first();
  }
});
