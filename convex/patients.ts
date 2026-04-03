import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

// Patients can only update non-clinical fields
export const updateContactInfo = mutation({
  args: {
    betterAuthId: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only the logged in patient can edit their own contact details
    const user = await requireRole(ctx, ["patient"], args.betterAuthId);

    // Find the patient record linked to this user
    const patientRecord = await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .first();

    if (!patientRecord) return null;

    await ctx.db.patch(patientRecord._id, {
      phone: args.phone,
    });
  }
});

// Patients can retrieve their own profile
export const getMyProfile = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["patient"], args.betterAuthId);
    return await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .first();
  }
});

export const seedDemoPatient = mutation({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["patient"], args.betterAuthId);
    const existingPatient = await ctx.db.query("patients").withIndex("by_user_id", q => q.eq("user_id", user._id)).first();
    
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
        allergies: ["Penicillin", "Peanuts"]
      });
    }
  }
});
