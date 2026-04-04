import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const admit = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    bed_id: v.id("beds"),
    ward_id: v.id("wards"),
    doctor_id: v.optional(v.id("users")),
    admission_type: v.optional(v.union(
      v.literal("emergency"),
      v.literal("scheduled"),
      v.literal("transfer")
    )),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medical_staff", "admin"], args.betterAuthId);

    // Verify bed is vacant
    const bed = await ctx.db.get(args.bed_id);
    if (!bed || bed.status !== "vacant") {
      throw new Error("Selected bed is not available.");
    }

    const admissionId = await ctx.db.insert("admissions", {
      patient_id: args.patient_id,
      bed_id: args.bed_id,
      ward_id: args.ward_id,
      doctor_id: args.doctor_id,
      admitted_at: Date.now(),
      admission_type: args.admission_type || "scheduled",
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
      notes: `Patient admitted (${args.admission_type || "scheduled"})`,
    });

    return admissionId;
  },
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

    await ctx.db.patch(args.admission_id, {
      status: "discharged",
      discharged_at: Date.now(),
    });

    await ctx.db.patch(admission.bed_id, { status: "vacant" });

    await ctx.db.insert("case_entries", {
      ward_id: args.ward_id,
      actor_id: user._id,
      timestamp: Date.now(),
      entry_type: "discharge",
      patient_id: admission.patient_id,
      notes: "Patient discharged",
    });
  },
});

export const listActiveByWard = query({
  args: { ward_id: v.id("wards") },
  handler: async (ctx, args) => {
    const admissions = await ctx.db
      .query("admissions")
      .withIndex("by_ward", (q) => q.eq("ward_id", args.ward_id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const enriched = await Promise.all(
      admissions.map(async (a) => {
        const patient = await ctx.db.get(a.patient_id);
        const bed = await ctx.db.get(a.bed_id);
        const doctor = a.doctor_id ? await ctx.db.get(a.doctor_id) : null;
        return {
          ...a,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          patientAllergies: patient?.allergies || [],
          bedName: bed?.name || "Unknown",
          doctorName: doctor?.name || "Unassigned",
        };
      })
    );
    return enriched;
  },
});

export const listByPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admissions")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();
  },
});

export const listAllActive = query({
  args: {},
  handler: async (ctx) => {
    const admissions = await ctx.db
      .query("admissions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const enriched = await Promise.all(
      admissions.map(async (a) => {
        const patient = await ctx.db.get(a.patient_id);
        const bed = await ctx.db.get(a.bed_id);
        const doctor = a.doctor_id ? await ctx.db.get(a.doctor_id) : null;
        return {
          ...a,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          patientAllergies: patient?.allergies || [],
          bedName: bed?.name || "Unknown",
          doctorName: doctor?.name || "Unassigned",
        };
      })
    );
    return enriched;
  },
});
