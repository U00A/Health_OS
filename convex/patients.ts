import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const updateContactInfo = mutation({
  args: {
    betterAuthId: v.string(),
    phone: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["patient"], args.betterAuthId);
    const patientRecord = await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .first();
    if (!patientRecord) return null;
    const updates: Record<string, unknown> = {};
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.wilaya !== undefined) updates.wilaya = args.wilaya;
    if (args.commune !== undefined) updates.commune = args.commune;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(patientRecord._id, updates);
    }
  },
});

export const getMyProfile = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) return null;

    // Only check role if user exists and has a role set
    if (user.role && user.role !== "patient" && user.role !== "admin") {
      return null;
    }

    return await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .first();
  },
});

export const searchByNationalId = query({
  args: { national_id: v.string() },
  handler: async (ctx, args) => {
    if (!args.national_id || args.national_id.length < 3) return [];
    const exact = await ctx.db
      .query("patients")
      .withIndex("by_national_id", (q) => q.eq("national_id", args.national_id))
      .first();
    if (exact) return [exact];
    // Fallback: scan and prefix match (limited)
    const all = await ctx.db.query("patients").take(200);
    return all.filter(
      (p) =>
        p.national_id.startsWith(args.national_id) ||
        p.first_name.toLowerCase().includes(args.national_id.toLowerCase()) ||
        p.last_name.toLowerCase().includes(args.national_id.toLowerCase())
    ).slice(0, 10);
  },
});

export const getById = query({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    betterAuthId: v.string(),
    national_id: v.string(),
    first_name: v.string(),
    last_name: v.string(),
    dob: v.string(),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
    blood_type: v.optional(v.string()),
    phone: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "medical_staff", "medecin_etat", "private_doctor"], args.betterAuthId);

    // Check duplicate national ID
    const existing = await ctx.db
      .query("patients")
      .withIndex("by_national_id", (q) => q.eq("national_id", args.national_id))
      .first();
    if (existing) throw new Error("A patient with this national ID already exists.");

    return await ctx.db.insert("patients", {
      national_id: args.national_id,
      first_name: args.first_name,
      last_name: args.last_name,
      dob: args.dob,
      sex: args.sex,
      blood_type: args.blood_type,
      phone: args.phone,
      wilaya: args.wilaya,
      commune: args.commune,
      allergies: args.allergies || [],
    });
  },
});

export const listAll = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "administration"], args.betterAuthId);
    return await ctx.db.query("patients").order("desc").take(100);
  },
});

export const seedDemoPatient = mutation({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["patient"], args.betterAuthId);
    const existingPatient = await ctx.db.query("patients").withIndex("by_user_id", (q) => q.eq("user_id", user._id)).first();

    if (!existingPatient) {
      const fakeNationalId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      await ctx.db.insert("patients", {
        user_id: user._id,
        national_id: fakeNationalId,
        first_name: user.name?.split(" ")[0] || "Demo",
        last_name: user.name?.split(" ")[1] || "Patient",
        dob: "1980-05-15",
        blood_type: "O+",
        phone: user.phone || "0555000000",
        wilaya: "Algiers",
        commune: "Bab Ezzouar",
        allergies: ["Penicillin", "Peanuts"],
      });
    }
  },
});

// Self-registration for patients after account creation
export const selfRegister = mutation({
  args: {
    betterAuthId: v.string(),
    national_id: v.string(),
    first_name: v.string(),
    last_name: v.string(),
    dob: v.string(),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
    blood_type: v.optional(v.string()),
    phone: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    emergency_contact: v.optional(v.string()),
    existing_conditions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { betterAuthId, ...patientData } = args;

    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", betterAuthId))
      .first();

    if (!user) {
      throw new Error("User account not found. Please sign in first.");
    }

    // Check if patient already exists
    const existingPatient = await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .first();

    if (existingPatient) {
      throw new Error("Patient profile already exists.");
    }

    // Check duplicate national ID
    const duplicateNationalId = await ctx.db
      .query("patients")
      .withIndex("by_national_id", (q) => q.eq("national_id", args.national_id))
      .first();

    if (duplicateNationalId) {
      throw new Error("A patient with this national ID already exists.");
    }

    // Create patient record
    const patientId = await ctx.db.insert("patients", {
      user_id: user._id,
      ...patientData,
      allergies: args.allergies || [],
      enrollment_status: "active",
    });

    return { patientId, userId: user._id };
  },
});

// Check if patient profile exists
export const checkPatientProfile = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) return { exists: false };

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .first();

    return { exists: !!patient, patient };
  },
});

// Delete patient and associated user account (admin only)
export const deletePatient = mutation({
  args: {
    betterAuthId: v.string(),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);

    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found.");

    // Delete associated user if exists
    if (patient.user_id) {
      const user = await ctx.db.get(patient.user_id);
      if (user) {
        // Delete the user
        await ctx.db.delete(patient.user_id);
      }
    }

    // Delete the patient record
    await ctx.db.delete(args.patientId);

    return { success: true };
  },
});

// Delete all patients and their associated users (admin only - for testing)
export const deleteAllPatients = mutation({
  args: {
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"], args.betterAuthId);

    const allPatients = await ctx.db.query("patients").collect();
    let deletedCount = 0;

    for (const patient of allPatients) {
      // Delete associated user if exists
      if (patient.user_id) {
        const user = await ctx.db.get(patient.user_id);
        if (user) {
          // Delete the user
          await ctx.db.delete(patient.user_id);
        }
      }
      // Delete the patient record
      await ctx.db.delete(patient._id);
      deletedCount++;
    }

    return { success: true, deletedCount };
  },
});
