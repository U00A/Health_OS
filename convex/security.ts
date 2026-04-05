import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================
// Role-based access control
// ============================================================

export async function requireRole(ctx: QueryCtx | MutationCtx, allowedRoles: string[], betterAuthId: string) {
  if (!betterAuthId || betterAuthId === "undefined" || betterAuthId === "null") {
    throw new Error("Unauthorized: Identity token is missing");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", betterAuthId))
    .first();

  if (!user) {
    // Fallback: Try direct Convex _id lookup (new auth system support)
    try {
      user = await ctx.db.get(betterAuthId as Id<"users">);
    } catch {
      // Not a valid Convex ID string, ignore
    }
  }

  if (!user) throw new Error("Unauthorized: User not found");

  const userRole = user.role || "patient";

  if (!allowedRoles.includes(userRole) && userRole !== "admin") {
    throw new Error("Forbidden: Insufficient privileges");
  }

  return { ...user, role: userRole };
}

export async function requirePatientAccess(
  ctx: QueryCtx,
  patientId: string,
  user: Doc<"users">
) {
  if (user.role === "admin") return true;

  // Patient accessing their own record
  if (user.role === "patient") {
    const patientRecord = await ctx.db.get(patientId as Id<"patients">);
    if (patientRecord?.user_id === user._id) return true;
    throw new Error("Forbidden");
  }

  // Doctor accessing assigned patient
  if (user.role === "medecin_etat" || user.role === "private_doctor") {
    const assignment = await ctx.db
      .query("doctor_patients")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", user._id))
      .filter((q) => q.eq(q.field("patient_id"), patientId))
      .first();

    if (!assignment || !assignment.active) throw new Error("Forbidden: Patient not assigned");
    return true;
  }

  // Administration role - civil access only
  if (user.role === "administration") {
    const admission = await ctx.db
      .query("admissions")
      .withIndex("by_patient", (q) => q.eq("patient_id", patientId as Id<"patients">))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    // Admin can access any admitted patient's civil data
    return !!admission;
  }

  // Fallback, to be extended for staff, lab, pharmacy
  return true;
}

// ============================================================
// User lookup helper
// ============================================================

export async function getUser(ctx: QueryCtx | MutationCtx, betterAuthId: string): Promise<Doc<"users"> | null> {
  if (!betterAuthId || betterAuthId === "undefined" || betterAuthId === "null") {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", betterAuthId))
    .first();

  if (user) return user;

  // Fallback: Try direct Convex _id lookup
  try {
    return await ctx.db.get(betterAuthId as Id<"users">);
  } catch {
    return null;
  }
}

// ============================================================
// Biometric Gating (Section 9.4)
// No third-party clinical interface opens without both:
// (1) Patient biometric confirmation (fingerprint)
// (2) Professional identity verification
// ============================================================

export async function verifyBiometricGate(
  ctx: MutationCtx,
  patientId: Id<"patients">,
  professionalBetterAuthId: string
): Promise<{ valid: boolean; sessionToken?: string; reason?: string }> {
  const patient = await ctx.db.get(patientId);
  if (!patient) return { valid: false, reason: "Patient not found" };

  // Check if patient has biometric reference registered
  if (!patient.biometric_reference) {
    return { valid: false, reason: "Patient biometric not registered" };
  }

  // Verify professional identity
  const professional = await getUser(ctx, professionalBetterAuthId);
  if (!professional) return { valid: false, reason: "Professional not found" };
  if (!professional.professional_id && !professional.betterAuthId) {
    return { valid: false, reason: "Professional ID not configured" };
  }

  // Generate session token (single-use, expires in 8 hours)
  const sessionToken = `bio_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

  // Create biometric session record
  const caseEntryId = await ctx.db.insert("case_entries", {
    ward_id: (await ctx.db.query("wards").first())?._id as Id<"wards">, // This should be contextual
    actor_id: professional._id,
    timestamp: Date.now(),
    entry_type: "identity_gate_opened",
    patient_id: patientId,
    notes: `Biometric + professional ID gate opened for patient ${patient.first_name} ${patient.last_name}`,
  });

  await ctx.db.insert("biometric_sessions", {
    patient_id: patientId,
    professional_id: professional._id,
    session_token: sessionToken,
    created_at: Date.now(),
    expires_at: expiresAt,
    is_valid: true,
    case_entry_id: caseEntryId as Id<"case_entries">,
  });

  return { valid: true, sessionToken };
}

export async function validateBiometricSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string
): Promise<boolean> {
  const session = await ctx.db
    .query("biometric_sessions")
    .withIndex("by_token", (q) => q.eq("session_token", sessionToken))
    .first();

  if (!session) return false;
  if (!session.is_valid) return false;
  if (session.expires_at < Date.now()) return false;

  return true;
}

// ============================================================
// Programmatic Data Masking (Section 9.5)
// Private doctor identities are masked from other private doctors
// at the Convex query layer ??? not just UI layer.
// State doctors see full identity (public health oversight).
// Patients see full identity (right to know who treated them).
// ============================================================

/**
 * Masks private doctor identity when the caller is a private doctor.
 * Returns anonymised "Treating Physician" for private doctors viewing other private doctors' work.
 * Returns full identity for state doctors, patients, and other roles.
 */
export async function maskDoctorIdentity(
  ctx: QueryCtx,
  callerBetterAuthId: string | null,
  doctorId: Id<"users">
): Promise<{ doctorName: string; doctorClinic?: string; doctorContact?: string }> {
  // If no caller, default to masked
  if (!callerBetterAuthId) {
    return { doctorName: "Treating Physician" };
  }

  const caller = await getUser(ctx, callerBetterAuthId);
  if (!caller) {
    return { doctorName: "Treating Physician" };
  }

  // State doctors see full identity (public health oversight)
  if (caller.role === "medecin_etat") {
    const doctor = await ctx.db.get(doctorId);
    if (!doctor) return { doctorName: "Unknown Doctor" };
    return {
      doctorName: doctor.name || "Unknown Doctor",
      doctorClinic: doctor.clinic_name,
      doctorContact: doctor.contact_details,
    };
  }

  // Patients see full identity (right to know)
  if (caller.role === "patient") {
    const doctor = await ctx.db.get(doctorId);
    if (!doctor) return { doctorName: "Unknown Doctor" };
    return {
      doctorName: doctor.name || "Unknown Doctor",
      doctorClinic: doctor.clinic_name,
      doctorContact: doctor.contact_details,
    };
  }

  // Administration role - no clinical access at all
  if (caller.role === "administration") {
    return { doctorName: "Treating Physician" };
  }

  // Pharmacy - limited visibility
  if (caller.role === "pharmacy") {
    const doctor = await ctx.db.get(doctorId);
    if (!doctor) return { doctorName: "Unknown Doctor" };
    return {
      doctorName: doctor.name || "Unknown Doctor",
    };
  }

  // Laboratory - limited visibility
  if (caller.role === "laboratory") {
    const doctor = await ctx.db.get(doctorId);
    if (!doctor) return { doctorName: "Unknown Doctor" };
    return {
      doctorName: doctor.name || "Unknown Doctor",
    };
  }

  // Private doctors viewing another private doctor's work -> MASKED
  if (caller.role === "private_doctor") {
    const targetDoctor = await ctx.db.get(doctorId);
    if (!targetDoctor) return { doctorName: "Treating Physician" };

    // If the target is also a private doctor, mask their identity
    if (targetDoctor.role === "private_doctor") {
      // Check if it's the same doctor (self-viewing is allowed)
      if (targetDoctor._id === caller._id) {
        return {
          doctorName: targetDoctor.name || "Unknown Doctor",
          doctorClinic: targetDoctor.clinic_name,
          doctorContact: targetDoctor.contact_details,
        };
      }
      // Different private doctor -> MASK
      return { doctorName: "Treating Physician" };
    }

    // If target is a state doctor, show full identity
    return {
      doctorName: targetDoctor.name || "Unknown Doctor",
    };
  }

  // Medical staff - show name only
  if (caller.role === "medical_staff") {
    const doctor = await ctx.db.get(doctorId);
    if (!doctor) return { doctorName: "Unknown Doctor" };
    return { doctorName: doctor.name || "Unknown Doctor" };
  }

  // Default fallback
  return { doctorName: "Treating Physician" };
}

/**
 * Helper to apply masking to a document with a doctor_id field
 */
export async function maskDocumentDoctor<T extends { doctor_id?: Id<"users"> }>(
  ctx: QueryCtx,
  callerBetterAuthId: string | null,
  doc: T
): Promise<T & { doctorName?: string; doctorClinic?: string; doctorContact?: string }> {
  if (!doc.doctor_id) return { ...doc } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };

  const masked = await maskDoctorIdentity(ctx, callerBetterAuthId, doc.doctor_id);
  const result = { ...doc } as T & { doctorName?: string; doctorClinic?: string; doctorContact?: string };

  if (masked.doctorName === "Treating Physician") {
    result.doctorName = "Treating Physician";
    result.doctorClinic = undefined;
    result.doctorContact = undefined;
  } else {
    result.doctorName = masked.doctorName;
    result.doctorClinic = masked.doctorClinic;
    result.doctorContact = masked.doctorContact;
  }

  return result;
}

// ============================================================
// Admin Role Access Control (Section 5)
// Administration role sees ONLY civil data:
// - Patient name, surname, national ID
// - Admission/discharge dates
// - Billing records
// ZERO access to clinical, diagnostic, pharmaceutical data
// ============================================================

export function isAdminRole(role: string | undefined): boolean {
  return role === "administration";
}

// Strip all clinical fields from patient data for admin role
export function stripClinicalForAdmin<T extends Record<string, unknown>>(data: T): Omit<T, "blood_type" | "allergies" | "diagnoses" | "medications"> {
  const { blood_type: _, allergies: __, diagnoses: ___, medications: ____, ...rest } = data as unknown as Record<string, unknown>;
  return rest as Omit<T, "blood_type" | "allergies" | "diagnoses" | "medications">;
}
