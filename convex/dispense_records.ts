import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser } from "./security";

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

export const partialDispense = mutation({
  args: {
    betterAuthId: v.string(),
    prescription_id: v.id("prescriptions"),
    dispensed_medications: v.array(v.object({
      name: v.string(),
      dose: v.string(),
      frequency: v.string(),
      duration: v.string(),
    })),
    out_of_stock: v.array(v.object({
      name: v.string(),
      dose: v.string(),
      expected_restock_date: v.optional(v.number()),
    })),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["pharmacy"], args.betterAuthId);
    
    const prescription = await ctx.db.get(args.prescription_id);
    if (!prescription || prescription.status !== "active") {
      throw new Error("Valid active prescription not found");
    }

    // Append dispense record with partial info
    const resultId = await ctx.db.insert("dispense_records", {
      prescription_id: args.prescription_id,
      pharmacist_id: user._id,
      dispensed_at: Date.now(),
      notes: args.notes,
    });

    // Mark prescription as partially dispensed
    await ctx.db.patch(args.prescription_id, { 
      status: "partially_dispensed",
      partially_dispensed_items: args.out_of_stock.map((item) => ({
        ...item,
        dispensed_at: Date.now(),
      })),
    });
    
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

export const listByPharmacist = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) return [];
    if (user.role !== "pharmacy" && user.role !== "admin") return [];
    const records = await ctx.db
      .query("dispense_records")
      .withIndex("by_pharmacist", (q) => q.eq("pharmacist_id", user._id))
      .order("desc")
      .take(50);

    // Enrich with patient and prescription data
    const enriched = await Promise.all(
      records.map(async (r) => {
        const prescription = await ctx.db.get(r.prescription_id);
        let patientName = "Unknown";
        if (prescription) {
          const patient = await ctx.db.get(prescription.patient_id);
          if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
          }
        }
        return { ...r, patientName };
      })
    );
    return enriched;
  }
});
