import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser, maskDocumentDoctor } from "./security";

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
  args: { 
    patient_id: v.id("patients"),
    betterAuthId: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = args.betterAuthId ? await getUser(ctx, args.betterAuthId) : null;
    
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();

    // If it's a private doctor, apply restrictions
    const isPrivateDoctor = user && user.role === "private_doctor";
    const isPresent = args.sessionToken 
      ? (await ctx.db
          .query("biometric_sessions")
          .withIndex("by_token", (q) => q.eq("session_token", args.sessionToken!))
          .first())?.is_valid 
      : false;

    // Enrich with doctor name AND filter for private doctors in absent mode
    const enriched = await Promise.all(
      prescriptions.map(async (p) => {
        // If absent mode private doctor, skip if not their own
        if (isPrivateDoctor && !isPresent && p.doctor_id !== user._id) {
          return null;
        }

        return await maskDocumentDoctor(ctx, args.betterAuthId || null, p);
      })
    );
    
    return enriched.filter(Boolean);
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
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) return [];
    if (user.role !== "pharmacy" && user.role !== "admin") return [];
    const active = await ctx.db
      .query("prescriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Enrich with patient and doctor data, plus expiry check
    const enriched = await Promise.all(
      active.map(async (p) => {
        const patient = await ctx.db.get(p.patient_id);
        const doctor = await ctx.db.get(p.doctor_id);
        const issuedAt = p.issued_at || p._creationTime;
        const isExpired = now - issuedAt > SEVEN_DAYS_MS;
        const daysUntilExpiry = Math.floor((SEVEN_DAYS_MS - (now - issuedAt)) / (24 * 60 * 60 * 1000));

        return {
          ...p,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          patientAllergies: patient?.allergies || [],
          doctorName: doctor?.name || "Unknown",
          isExpired,
          daysUntilExpiry,
        };
      })
    );

    // Filter out expired prescriptions
    return enriched.filter((p) => !p.isExpired);
  },
});

export const checkExpiry = query({
  args: { prescription_id: v.id("prescriptions") },
  handler: async (ctx, args) => {
    const prescription = await ctx.db.get(args.prescription_id);
    if (!prescription) return { isExpired: true, reason: "Prescription not found" };

    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const issuedAt = prescription.issued_at || prescription._creationTime;
    const isExpired = now - issuedAt > SEVEN_DAYS_MS;

    if (isExpired) {
      return { isExpired: true, reason: "Prescription expired (7 days from issue)" };
    }

    return { isExpired: false, daysRemaining: Math.floor((SEVEN_DAYS_MS - (now - issuedAt)) / (24 * 60 * 60 * 1000)) };
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
