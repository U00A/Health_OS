import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const create = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    medications: v.array(v.object({
      name: v.string(),
      dose: v.string(),
      frequency: v.string(),
      duration: v.string(),
      route: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);

    const patient = await ctx.db.get(args.patient_id);
    if (!patient) throw new Error("Patient not found");

    // ALLERGY CROSS-CHECK
    if (patient.allergies && patient.allergies.length > 0) {
      const allergiesLower = patient.allergies.join(" ").toLowerCase();
      for (const med of args.medications) {
        if (allergiesLower.includes(med.name.toLowerCase())) {
          throw new Error(`ALLERGY CONFLICT: The patient has a documented allergy that conflicts with '${med.name}'.`);
        }
      }
    }

    const prescriptionId = await ctx.db.insert("prescriptions", {
      patient_id: args.patient_id,
      doctor_id: user._id,
      issued_at: Date.now(),
      status: "active",
      medications: args.medications.map((m) => ({
        ...m,
        verified: false,
      })),
    });

    // NOTIFICATION: Alert the patient (Section 9.3)
    if (patient.user_id) {
      const patientUser = await ctx.db.get(patient.user_id);
      if (patientUser) {
        await ctx.db.insert("notifications", {
          recipient_id: patientUser._id,
          sender_id: user._id,
          patient_id: args.patient_id,
          notification_type: "prescription_written",
          title: "New Prescription",
          message: `${user.name || "Your Doctor"} has prescribed ${args.medications.length} medication(s) for you.`,
          created_at: Date.now(),
          is_read: false,
        });
      }
    }

    return prescriptionId;
  },
});

export const listByPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();

    // Enrich with doctor name
    const enriched = await Promise.all(
      prescriptions.map(async (p) => {
        const doctor = await ctx.db.get(p.doctor_id);
        return { ...p, doctorName: doctor?.name || "Unknown" };
      })
    );
    return enriched;
  },
});

export const listByDoctor = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", user._id))
      .order("desc")
      .take(50);
  },
});

export const listPending = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["pharmacy"], args.betterAuthId);
    const active = await ctx.db
      .query("prescriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    // Enrich with patient and doctor data
    const enriched = await Promise.all(
      active.map(async (p) => {
        const patient = await ctx.db.get(p.patient_id);
        const doctor = await ctx.db.get(p.doctor_id);
        return {
          ...p,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          patientAllergies: patient?.allergies || [],
          doctorName: doctor?.name || "Unknown",
        };
      })
    );
    return enriched;
  },
});

export const listAllActive = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("prescriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const enriched = await Promise.all(
      active.map(async (p) => {
        const patient = await ctx.db.get(p.patient_id);
        const doctor = await ctx.db.get(p.doctor_id);
        return {
          ...p,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          patientAllergies: patient?.allergies || [],
          doctorName: doctor?.name || "Unknown",
        };
      })
    );
    return enriched;
  },
});

export const updateStatus = mutation({
  args: {
    betterAuthId: v.string(),
    prescription_id: v.id("prescriptions"),
    status: v.union(
      v.literal("active"),
      v.literal("dispensed"),
      v.literal("partially_dispensed"),
      v.literal("expired")
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["pharmacy", "medecin_etat"], args.betterAuthId);
    await ctx.db.patch(args.prescription_id, { status: args.status });
  },
});
