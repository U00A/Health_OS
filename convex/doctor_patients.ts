import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser } from "./security";

export const assignPatient = mutation({
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

export const selfAssignPatient = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);

    const existing = await ctx.db
      .query("doctor_patients")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", user._id))
      .filter((q) => q.eq(q.field("patient_id"), args.patient_id))
      .first();

    if (existing) {
      if (!existing.active) {
        await ctx.db.patch(existing._id, { active: true });
      }
      return existing._id;
    }

    return await ctx.db.insert("doctor_patients", {
      doctor_id: user._id,
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

    const patients = await Promise.all(
      assignments.map((a) => ctx.db.get(a.patient_id))
    );
    return patients.filter(Boolean);
  },
});

export const listMyPatients = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) return [];
    if (user.role !== "medecin_etat" && user.role !== "private_doctor" && user.role !== "admin") return [];

    const assignments = await ctx.db
      .query("doctor_patients")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", user._id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const patients = await Promise.all(
      assignments.map(async (a) => {
        const patient = await ctx.db.get(a.patient_id);
        if (!patient) return null;
        // Get latest vitals
        const latestVitals = await ctx.db
          .query("vitals")
          .withIndex("by_patient", (q) => q.eq("patient_id", a.patient_id))
          .order("desc")
          .first();
        // Get active prescriptions count
        const prescriptions = await ctx.db
          .query("prescriptions")
          .withIndex("by_patient", (q) => q.eq("patient_id", a.patient_id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        // Get pending lab orders count
        const pendingLabs = await ctx.db
          .query("lab_orders")
          .withIndex("by_patient", (q) => q.eq("patient_id", a.patient_id))
          .filter((q) => q.neq(q.field("status"), "completed"))
          .collect();

        return {
          ...patient,
          latestVitals,
          activePrescriptionCount: prescriptions.length,
          pendingLabCount: pendingLabs.length,
        };
      })
    );
    return patients.filter(Boolean);
  },
});
