import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const admit = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    bed_id: v.id("beds"),
    ward_id: v.id("wards"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medical_staff", "admin"], args.betterAuthId);
    
    // Admit the patient
    const admissionId = await ctx.db.insert("admissions", {
      patient_id: args.patient_id,
      bed_id: args.bed_id,
      admitted_at: Date.now(),
      status: "active",
    });

    // Update bed status
    await ctx.db.patch(args.bed_id, { status: "occupied" });

    // Append to case entries log
    await ctx.db.insert("case_entries", {
      ward_id: args.ward_id,
      actor_id: user._id,
      timestamp: Date.now(),
      entry_type: "admission",
      patient_id: args.patient_id,
      notes: "Patient admitted to bed",
    });

    return admissionId;
  }
});

export const discharge = mutation({
  args: {
    betterAuthId: v.string(),
    admission_id: v.id("admissions"),
    ward_id: v.id("wards"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medical_staff", "medecin_etat", "admin"], args.betterAuthId);
    
    const admission = await ctx.db.get(args.admission_id);
    if (!admission || admission.status !== "active") {
      throw new Error("Active admission not found");
    }

    // Discharge the patient
    await ctx.db.patch(args.admission_id, {
      status: "discharged",
      discharged_at: Date.now(),
    });

    // Free the bed
    await ctx.db.patch(admission.bed_id, { status: "vacant" });

    // Append to case entries log
    await ctx.db.insert("case_entries", {
      ward_id: args.ward_id,
      actor_id: user._id,
      timestamp: Date.now(),
      entry_type: "discharge",
      patient_id: admission.patient_id,
      notes: "Patient discharged",
    });
  }
});
