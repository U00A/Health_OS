import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for patient documents
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Upload a patient document
export const uploadDocument = mutation({
  args: {
    patient_id: v.id("patients"),
    document_type: v.union(
      v.literal("medical_report"),
      v.literal("lab_result"),
      v.literal("imaging_report"),
      v.literal("prescription_scan"),
      v.literal("insurance"),
      v.literal("id_document"),
      v.literal("referral"),
      v.literal("other")
    ),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    storage_id: v.id("_storage"),
    file_name: v.string(),
    file_type: v.string(),
    file_size: v.number(),
    uploaded_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("patient_documents", {
      patient_id: args.patient_id,
      document_type: args.document_type,
      title: args.title,
      description: args.description,
      storage_id: args.storage_id,
      file_name: args.file_name,
      file_type: args.file_type,
      file_size: args.file_size,
      uploaded_by: args.uploaded_by,
      uploaded_at: Date.now(),
      status: "pending",
    });
    return docId;
  },
});

// List documents for a patient
export const listByPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("patient_documents")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();
    
    // Add URL for each document
    const docsWithUrls = await Promise.all(
      docs.map(async (doc) => {
        const url = await ctx.storage.getUrl(doc.storage_id);
        return { ...doc, url };
      })
    );
    
    return docsWithUrls;
  },
});

// Get a single document by ID
export const getById = query({
  args: { document_id: v.id("patient_documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.document_id);
    if (!doc) return null;
    const url = await ctx.storage.getUrl(doc.storage_id);
    return { ...doc, url };
  },
});

// Delete a document
export const deleteDocument = mutation({
  args: { document_id: v.id("patient_documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.document_id);
    if (!doc) throw new Error("Document not found");
    
    // Delete the file from storage
    await ctx.storage.delete(doc.storage_id);
    
    // Delete the document record
    await ctx.db.delete(args.document_id);
  },
});

// Update document status
export const updateStatus = mutation({
  args: {
    document_id: v.id("patient_documents"),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("reviewed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.document_id, { status: args.status });
  },
});

// Update extracted data
export const updateExtractedData = mutation({
  args: {
    document_id: v.id("patient_documents"),
    extracted_data: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.document_id, {
      extracted_data: args.extracted_data,
      status: "processed",
    });
  },
});

// Get document count by type for a patient
export const getDocumentStats = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("patient_documents")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .collect();
    
    const stats: Record<string, number> = {
      total: docs.length,
      pending: 0,
      processed: 0,
      reviewed: 0,
    };
    
    for (const doc of docs) {
      if (doc.status === "pending") stats.pending++;
      if (doc.status === "processed") stats.processed++;
      if (doc.status === "reviewed") stats.reviewed++;
    }
    
    return stats;
  },
});

// Extract document metadata
export const extractDocumentData = mutation({
  args: { document_id: v.id("patient_documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.document_id);
    if (!doc) throw new Error("Document not found");
    
    // Extract metadata from document
    const extractedData: Record<string, unknown> = {
      fileName: doc.file_name,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      uploadedAt: new Date(doc.uploaded_at).toISOString(),
      documentType: doc.document_type,
    };
    
    // Update the document with extracted data
    await ctx.db.patch(args.document_id, {
      extracted_data: extractedData,
      status: "processed",
    });
    
    return extractedData;
  },
});
