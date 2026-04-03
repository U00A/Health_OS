import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const dispense = mutation({
  args: {
    betterAuthId: v.string(),
    prescription_id: v.id("prescriptions"),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["pharmacy"], args.betterAuthId);
    
    const prescription = await ctx.db.get(args.prescription_id);
    if (!prescription || prescription.status !== "active") {
      throw new Error("Valid active prescription not found");
    }

    // Append record
    const resultId = await ctx.db.insert("dispense_records", {
      prescription_id: args.prescription_id,
      pharmacist_id: user._id,
      dispensed_at: Date.now(),
      notes: args.notes,
    });

    // Mark prescription dispensed
    await ctx.db.patch(args.prescription_id, { status: "dispensed" });
    
    return resultId;
  }
});

export const listDispenseRecords = query({
  args: { betterAuthId: v.string(), prescription_id: v.id("prescriptions") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["pharmacy", "medecin_etat", "patient"], args.betterAuthId);
    return await ctx.db
      .query("dispense_records")
      .withIndex("by_prescription", (q) => q.eq("prescription_id", args.prescription_id))
      .order("desc")
      .collect();
  }
});
