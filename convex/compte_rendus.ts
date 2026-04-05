// v1.0.4 - Fully self-contained, no cross-module imports that could cause dynamic import issues
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper: get user by betterAuthId (inlined to avoid cross-module issues)
async function getUserInline(ctx: any, betterAuthId: string) {
  if (!betterAuthId || betterAuthId === "undefined" || betterAuthId === "null") {
    return null;
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_better_auth_id", (q: any) => q.eq("betterAuthId", betterAuthId))
    .first();
  if (user) return user;
  try {
    return await ctx.db.get(betterAuthId);
  } catch {
    return null;
  }
}

// Helper: require role (inlined to avoid cross-module issues)
async function requireRoleInline(ctx: any, allowedRoles: string[], betterAuthId: string) {
  if (!betterAuthId || betterAuthId === "undefined" || betterAuthId === "null") {
    throw new Error("Unauthorized: Identity token is missing");
  }
  const user = await getUserInline(ctx, betterAuthId);
  if (!user) throw new Error("Unauthorized: User not found");
  const userRole = user.role || "patient";
  if (!allowedRoles.includes(userRole) && userRole !== "admin") {
    throw new Error("Forbidden: Insufficient privileges");
  }
  return { ...user, role: userRole };
}

// Immutable insert (no update or delete)
export const create = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    diagnosis_code: v.optional(v.string()),
    symptoms: v.optional(v.string()),
    treatment_plan: v.optional(v.string()),
    follow_up: v.optional(v.string()),
    content_html: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoleInline(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);

    const compteRenduId = await ctx.db.insert("compte_rendus", {
      patient_id: args.patient_id,
      doctor_id: user._id,
      date: Date.now(),
      diagnosis_code: args.diagnosis_code,
      symptoms: args.symptoms,
      treatment_plan: args.treatment_plan,
      follow_up: args.follow_up,
      content_html: args.content_html,
    });

    return compteRenduId;
  },
});

export const listByPatient = query({
  args: { 
    patient_id: v.id("patients"),
    betterAuthId: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = args.betterAuthId ? await getUserInline(ctx, args.betterAuthId) : null;
    
    let baseQuery = ctx.db
      .query("compte_rendus")
      .withIndex("by_patient", (q: any) => q.eq("patient_id", args.patient_id));

    if (user && user.role === "private_doctor") {
      const isPresent = args.sessionToken 
        ? (await ctx.db
            .query("biometric_sessions")
            .withIndex("by_token", (q: any) => q.eq("session_token", args.sessionToken!))
            .first())?.is_valid 
        : false;
      
      if (!isPresent) {
        baseQuery = baseQuery.filter((q: any) => q.eq(q.field("doctor_id"), user._id));
      }
    }

    const results = await baseQuery.order("desc").collect();

    const enriched = [];
    for (const doc of results) {
      const masked = await maskDocumentDoctorInline(ctx, args.betterAuthId || null, doc);
      enriched.push(masked);
    }

    return enriched;
  },
});

// Inlined masking function - no external dependencies
async function maskDocumentDoctorInline(ctx: any, callerBetterAuthId: string | null, doc: any) {
  if (!doc.doctor_id) return { ...doc };

  const caller = callerBetterAuthId ? await getUserInline(ctx, callerBetterAuthId) : null;
  const callerRole = caller?.role || "patient";

  // State doctors see full identity
  if (callerRole === "medecin_etat") {
    const doctor = await ctx.db.get(doc.doctor_id);
    if (!doctor) return { ...doc, doctorName: "Unknown Doctor" };
    return { ...doc, doctorName: doctor.name || "Unknown Doctor", doctorClinic: doctor.clinic_name, doctorContact: doctor.contact_details };
  }

  // Patients see full identity
  if (callerRole === "patient") {
    const doctor = await ctx.db.get(doc.doctor_id);
    if (!doctor) return { ...doc, doctorName: "Unknown Doctor" };
    return { ...doc, doctorName: doctor.name || "Unknown Doctor", doctorClinic: doctor.clinic_name, doctorContact: doctor.contact_details };
  }

  // Private doctors viewing another private doctor's work -> MASKED
  if (callerRole === "private_doctor") {
    const targetDoctor = await ctx.db.get(doc.doctor_id);
    if (!targetDoctor) return { ...doc, doctorName: "Treating Physician" };

    // If it's the same doctor, show full identity
    if (caller && targetDoctor._id === caller._id) {
      return { ...doc, doctorName: targetDoctor.name || "Unknown Doctor", doctorClinic: targetDoctor.clinic_name, doctorContact: targetDoctor.contact_details };
    }
    // Different private doctor -> MASK
    return { ...doc, doctorName: "Treating Physician" };
  }

  // Default: masked
  return { ...doc, doctorName: "Treating Physician" };
}