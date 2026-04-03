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
      duration: v.string()
    }))
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

    return await ctx.db.insert("prescriptions", {
      patient_id: args.patient_id,
      doctor_id: user._id,
      issued_at: Date.now(),
      status: "active",
      medications: args.medications
    });
  }
});

export const listByPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    // Only return prescriptions. Roles like Pharmacy or Patient or Doctor will access this.
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();
  }
});

export const updateStatus = mutation({
  args: {
    betterAuthId: v.string(),
    prescription_id: v.id("prescriptions"),
    status: v.union(v.literal("active"), v.literal("dispensed"), v.literal("expired"))
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["pharmacy", "medecin_etat"], args.betterAuthId);
    await ctx.db.patch(args.prescription_id, { status: args.status });
  }
});
