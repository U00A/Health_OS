import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser, isAdminRole } from "./security";

// ============================================================
// Billing Management (Section 5 - Administration Role)
// Civil and billing data only — zero clinical access.
// ============================================================

// Create a billing entry (admin role only)
export const createBillingEntry = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    admission_id: v.optional(v.id("admissions")),
    service_category: v.union(
      v.literal("consultation"),
      v.literal("lab"),
      v.literal("imaging"),
      v.literal("bed_day"),
      v.literal("pharmacy"),
      v.literal("other")
    ),
    amount: v.number(),
    payment_status: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("waived")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["administration"], args.betterAuthId);

    const billingId = await ctx.db.insert("billing_records", {
      patient_id: args.patient_id,
      admission_id: args.admission_id,
      billing_date: Date.now(),
      service_category: args.service_category,
      amount: args.amount,
      payment_status: args.payment_status,
      created_by: user._id,
    });

    return billingId;
  },
});

// Update billing payment status
export const updateBillingStatus = mutation({
  args: {
    betterAuthId: v.string(),
    billing_id: v.id("billing_records"),
    payment_status: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("waived")
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["administration"], args.betterAuthId);
    await ctx.db.patch(args.billing_id, { payment_status: args.payment_status });
  },
});

// Get billing records for a patient (admin role only)
export const getPatientBilling = query({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["administration"], args.betterAuthId);

    const records = await ctx.db
      .query("billing_records")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();

    // Enrich with patient name (civil data only)
    const enriched = await Promise.all(
      records.map(async (record) => {
        const patient = await ctx.db.get(record.patient_id);
        const admission = record.admission_id ? await ctx.db.get(record.admission_id) : null;
        return {
          ...record,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          admissionDate: admission ? admission.admitted_at : null,
          dischargeDate: admission ? admission.discharged_at : null,
        };
      })
    );

    return enriched;
  },
});

// Get all admissions with civil data only (admin role)
export const getAdmissions = query({
  args: {
    betterAuthId: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("discharged"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["administration"], args.betterAuthId);

    const admissions = await ctx.db
      .query("admissions")
      .withIndex("by_status", (q) => q.eq("status", args.status || "active"))
      .order("desc")
      .collect();

    // Enrich with civil patient data and bed info
    const enriched = await Promise.all(
      admissions.map(async (admission) => {
        const patient = await ctx.db.get(admission.patient_id);
        const bed = await ctx.db.get(admission.bed_id);
        return {
          _id: admission._id,
          _creationTime: admission._creationTime,
          patient_id: admission.patient_id,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          admitted_at: admission.admitted_at,
          discharged_at: admission.discharged_at,
          admission_type: admission.admission_type,
          status: admission.status,
          bedName: bed?.name || "",
        };
      })
    );

    return enriched;
  },
});

// Get patient civil registry data (admin role only)
export const getPatientCivilData = query({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["administration"], args.betterAuthId);

    const patient = await ctx.db.get(args.patient_id);
    if (!patient) return null;

    // Return ONLY civil data — no clinical fields
    return {
      _id: patient._id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      national_id: patient.national_id,
      dob: patient.dob,
      sex: patient.sex,
      phone: patient.phone,
      wilaya: patient.wilaya,
      commune: patient.commune,
      emergency_contact: patient.emergency_contact,
      // NO blood_type, allergies, or any clinical fields
    };
  },
});

// Search patients by name/national ID (admin role only)
export const searchPatients = query({
  args: {
    betterAuthId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["administration"], args.betterAuthId);

    const allPatients = await ctx.db
      .query("patients")
      .collect();

    const searchLower = args.query.toLowerCase();
    const results = allPatients.filter((p) =>
      p.first_name.toLowerCase().includes(searchLower) ||
      p.last_name.toLowerCase().includes(searchLower) ||
      p.national_id.includes(args.query)
    );

    // Return civil data only
    return results.map((p) => ({
      _id: p._id,
      first_name: p.first_name,
      last_name: p.last_name,
      national_id: p.national_id,
      dob: p.dob,
      phone: p.phone,
      wilaya: p.wilaya,
    }));
  },
});

// Get admission statistics (admin role only)
export const getStats = query({
  args: {
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["administration"], args.betterAuthId);

    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const allAdmissions = await ctx.db.query("admissions").collect();
    const thisMonth = allAdmissions.filter((a) => a.admitted_at > monthAgo);
    const active = allAdmissions.filter((a) => a.status === "active");

    // Calculate average length of stay for discharged patients
    const discharged = allAdmissions.filter(
      (a) => a.status === "discharged" && a.discharged_at
    );
    const avgStay = discharged.length > 0
      ? Math.round(discharged.reduce((sum, a) => sum + (a.discharged_at! - a.admitted_at) / (24 * 60 * 60 * 1000), 0) / discharged.length)
      : 0;

    return {
      totalAdmissions: allAdmissions.length,
      admissionsThisMonth: thisMonth.length,
      activeAdmissions: active.length,
      avgStayDays: avgStay,
    };
  },
});