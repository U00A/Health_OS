import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const assignPatient = mutation({
  args: {
    betterAuthId: v.string(),
    doctor_id: v.id("users"),
    patient_id: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "medical_staff"], args.betterAuthId);
    
    // Check if assignment exists
    const existing = await ctx.db
      .query("doctor_patients")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
      .filter((q) => q.eq(q.field("patient_id"), args.patient_id))
      .first();

    if (existing) {
      if (!existing.active) {
        await ctx.db.patch(existing._id, { active: true });
      }
      return existing._id;
    }

    return await ctx.db.insert("doctor_patients", {
      doctor_id: args.doctor_id,
      patient_id: args.patient_id,
      active: true,
    });
  },
});

export const unassignPatient = mutation({
  args: {
    betterAuthId: v.string(),
    doctor_id: v.id("users"),
    patient_id: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "medical_staff", "medecin_etat", "private_doctor"], args.betterAuthId);
    
    const existing = await ctx.db
      .query("doctor_patients")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
      .filter((q) => q.eq(q.field("patient_id"), args.patient_id))
      .first();

    if (existing && existing.active) {
      await ctx.db.patch(existing._id, { active: false });
    }
  },
});

export const listDoctorsForPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("doctor_patients")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
      
    // Populate doctors
    const doctors = await Promise.all(
      assignments.map((a) => ctx.db.get(a.doctor_id))
    );
    return doctors.filter(Boolean);
  },
});

export const listPatientsForDoctor = query({
  args: { doctor_id: v.id("users") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("doctor_patients")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
      
    // Populate patients
    const patients = await Promise.all(
      assignments.map((a) => ctx.db.get(a.patient_id))
    );
    return patients.filter(Boolean);
  },
});
