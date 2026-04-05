import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser, maskDocumentDoctor } from "./security";

export const recordVitals = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    systolic_bp: v.optional(v.number()),
    diastolic_bp: v.optional(v.number()),
    heart_rate: v.optional(v.number()),
    temperature: v.optional(v.number()),
    spo2: v.optional(v.number()),
    respiratory_rate: v.optional(v.number()),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medical_staff"], args.betterAuthId);

    return await ctx.db.insert("vitals", {
      patient_id: args.patient_id,
      recorded_by: user._id,
      recorded_at: Date.now(),
      systolic_bp: args.systolic_bp,
      diastolic_bp: args.diastolic_bp,
      heart_rate: args.heart_rate,
      temperature: args.temperature,
      spo2: args.spo2,
      respiratory_rate: args.respiratory_rate,
      weight: args.weight,
    });
  },
});

export const listByPatient = query({
  args: { 
    patient_id: v.id("patients"),
    betterAuthId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .take(50);

    return await Promise.all(
      results.map(async (vit) => {
        const masked = await maskDocumentDoctor(ctx, args.betterAuthId || null, { ...vit, doctor_id: vit.recorded_by });
        return { ...vit, ...masked };
      })
    );
  },
});

export const getLatestForPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .first();
  },
});
