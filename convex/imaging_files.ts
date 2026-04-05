import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./security";

export const generateUploadUrl = mutation({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["medecin_etat", "private_doctor", "medical_staff", "laboratory"], args.betterAuthId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImagingMetadata = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    modality: v.string(),
    body_part: v.string(),
    storage_id: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Medical personnel upload images
    await requireRole(ctx, ["medecin_etat", "private_doctor", "medical_staff"], args.betterAuthId);
    
    return await ctx.db.insert("imaging_files", {
      patient_id: args.patient_id,
      uploaded_at: Date.now(),
      modality: args.modality,
      body_part: args.body_part,
      storage_id: args.storage_id,
    });
  }
});

export const getFilesByPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("imaging_files")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .collect();

    // Map to include signed URLs
    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storage_id),
      }))
    );
  }
});
