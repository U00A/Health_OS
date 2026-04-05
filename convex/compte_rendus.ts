// v1.0.3 - Fully inlined masking to avoid dynamic module import issues
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser } from "./security";
import { Doc, Id } from "./_generated/dataModel";

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
    const user = await requireRole(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);

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
    const user = args.betterAuthId ? await getUser(ctx, args.betterAuthId) : null;
    
    let baseQuery = ctx.db
      .query("compte_rendus")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id));

    if (user && user.role === "private_doctor") {
      const isPresent = args.sessionToken 
        ? (await ctx.db
            .query("biometric_sessions")
            .withIndex("by_token", (q) => q.eq("session_token", args.sessionToken!))
            .first())?.is_valid 
        : false;
      
      if (!isPresent) {
        baseQuery = baseQuery.filter((q) => q.eq(q.field("doctor_id"), user._id));
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

// Inlined masking function to avoid dynamic module import issues
async function maskDocumentDoctorInline<T extends { doctor_id?: Id<"users"> }>(
  ctx: QueryCtx,
  callerBetterAuthId: string | null,
  doc: T
): Promise<T & { doctorName?: string; doctorClinic?: string; doctorContact?: string }> {
  if (!doc.doctor_id) return { ...doc } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };

  const caller = callerBetterAuthId ? await getUser(ctx, callerBetterAuthId) : null;
  const callerRole = caller?.role || "patient";

  // State doctors see full identity
  if (callerRole === "medecin_etat") {
    const doctor = await ctx.db.get(doc.doctor_id);
    if (!doctor) return { ...doc, doctorName: "Unknown Doctor" } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };
    return { ...doc, doctorName: doctor.name || "Unknown Doctor", doctorClinic: doctor.clinic_name, doctorContact: doctor.contact_details } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };
  }

  // Patients see full identity
  if (callerRole === "patient") {
    const doctor = await ctx.db.get(doc.doctor_id);
    if (!doctor) return { ...doc, doctorName: "Unknown Doctor" } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };
    return { ...doc, doctorName: doctor.name || "Unknown Doctor", doctorClinic: doctor.clinic_name, doctorContact: doctor.contact_details } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };
  }

  // Private doctors viewing another private doctor's work -> MASKED
  if (callerRole === "private_doctor") {
    const targetDoctor = await ctx.db.get(doc.doctor_id);
    if (!targetDoctor) return { ...doc, doctorName: "Treating Physician" } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };

    // If it's the same doctor, show full identity
    if (caller && targetDoctor._id === caller._id) {
      return { ...doc, doctorName: targetDoctor.name || "Unknown Doctor", doctorClinic: targetDoctor.clinic_name, doctorContact: targetDoctor.contact_details } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };
    }
    // Different private doctor -> MASK
    return { ...doc, doctorName: "Treating Physician" } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };
  }

  // Default: masked
  return { ...doc, doctorName: "Treating Physician" } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };
}

type QueryCtx = Parameters<typeof getUser>[0];
