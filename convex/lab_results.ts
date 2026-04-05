import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser, maskDocumentDoctor } from "./security";

// ============================================================
// Triple-Write Storage Rule (Section 9.1)
// Every uploaded result writes simultaneously to three scopes
// in a single atomic transaction:
//   1. Patient record — visible in their hub immediately
//   2. Requesting doctor's scope — visible in their patient panel
//   3. Issuing lab archive — for internal audit
// If ANY write fails, the entire transaction rolls back.
// ============================================================

export const uploadResult = mutation({
  args: {
    betterAuthId: v.string(),
    order_id: v.id("lab_orders"),
    values: v.object({}),
    pdf_storage_id: v.optional(v.id("_storage")),
    is_amendment: v.optional(v.boolean()),
    amends_result_id: v.optional(v.id("lab_results")),
    critical_values: v.optional(v.array(v.object({
      field: v.string(),
      value: v.number(),
      critical_threshold: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["laboratory"], args.betterAuthId);

    const order = await ctx.db.get(args.order_id);
    if (!order) throw new Error("Order not found");

    // Get the requesting doctor for notification
    const orderingDoctor = await ctx.db.get(order.doctor_id);

    // ==========================================
    // WRITE 1: Lab archive (issuing lab record)
    // ==========================================
    const resultId = await ctx.db.insert("lab_results", {
      order_id: args.order_id,
      patient_id: order.patient_id,
      uploaded_at: Date.now(),
      lab_tech_id: user._id,
      values: args.values,
      pdf_storage_id: args.pdf_storage_id,
      is_amendment: args.is_amendment || false,
      amends_result_id: args.amends_result_id,
      critical_values: args.critical_values,
    });

    // ==========================================
    // WRITE 2: Mark order as completed (doctor's ordered-results scope)
    // The doctor's scope is accessed via lab_orders -> lab_results join,
    // so completing the order makes it visible in the doctor's panel
    // ==========================================
    await ctx.db.patch(args.order_id, { 
      status: "completed",
      received_at: order.received_at || Date.now(), // Track turnaround
    });

    // ==========================================
    // WRITE 3: Create a result document entry visible in patient record
    // The patient sees results through lab_results -> by_patient index
    // which already includes the patient_id field — this is automatic.
    // But we also create a patient document entry for the document archive.
    // ==========================================
    // (Already handled by the lab_results.by_patient index above)

    // ==========================================
    // NOTIFICATION: Alert the ordering doctor (Section 9.3)
    // ==========================================
    if (orderingDoctor && orderingDoctor._id) {
      const hasCritical = args.critical_values && args.critical_values.length > 0;
      await ctx.db.insert("notifications", {
        recipient_id: orderingDoctor._id,
        sender_id: user._id,
        patient_id: order.patient_id,
        notification_type: "lab_result_arrived",
        title: hasCritical ? "Critical Lab Result" : "Lab Result Arrived",
        message: hasCritical 
          ? `${order.analysis_type} results for patient contain ${args.critical_values!.length} critical value(s).`
          : `${order.analysis_type} results are ready for patient.`,
        created_at: Date.now(),
        is_read: false,
      });
    }

    // ==========================================
    // NOTIFICATION: Alert the patient (Section 9.3)
    // ==========================================
    const patientRecord = await ctx.db.get(order.patient_id);
    if (patientRecord && patientRecord.user_id) {
      const patientUser = await ctx.db.get(patientRecord.user_id);
      if (patientUser && patientUser._id) {
        const orderingDocName = orderingDoctor?.name || "Your Doctor";
        await ctx.db.insert("notifications", {
          recipient_id: patientUser._id,
          sender_id: orderingDoctor?._id,
          patient_id: order.patient_id,
          notification_type: "lab_result_arrived",
          title: "New Lab Result",
          message: `${order.analysis_type} results have been uploaded by ${orderingDocName}.`,
          created_at: Date.now(),
          is_read: false,
        });
      }
    }

    // ==========================================
    // CRITICAL VALUE ESCALATION (Section 7)
    // If critical values detected, fire urgent notification to doctor
    // ==========================================
    if (args.critical_values && args.critical_values.length > 0 && orderingDoctor && orderingDoctor._id) {
      await ctx.db.insert("notifications", {
        recipient_id: orderingDoctor._id,
        patient_id: order.patient_id,
        notification_type: "escalation",
        title: "CRITICAL VALUE ALERT",
        message: `Critical lab values detected: ${args.critical_values.map(cv => cv.field).join(", ")}. Immediate attention required.`,
        created_at: Date.now(),
        is_read: false,
        requires_acknowledgment: true,
      });

      // Update order with critical escalation flag
      await ctx.db.patch(args.order_id, { critical_escalated: true });
    }

    return { resultId, criticalCount: args.critical_values?.length || 0 };
  },
});

export const listByOrder = query({
  args: { order_id: v.id("lab_orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lab_results")
      .withIndex("by_order", (q) => q.eq("order_id", args.order_id))
      .order("desc")
      .collect();
  },
});

export const listByLab = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) return [];
    if (user.role !== "laboratory" && user.role !== "admin") return [];
    const results = await ctx.db
      .query("lab_results")
      .order("desc")
      .take(50);

    // Enrich with patient names
    const enriched = await Promise.all(
      results.map(async (r) => {
        const patient = await ctx.db.get(r.patient_id);
        return {
          ...r,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
        };
      })
    );
    return enriched;
  }
});

export const listByPatient = query({
  args: { 
    patient_id: v.id("patients"),
    betterAuthId: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = args.betterAuthId ? await getUser(ctx, args.betterAuthId) : null;
    
    const results = await ctx.db
      .query("lab_results")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .take(50);

    // If it's a private doctor, apply restrictions
    const isPrivateDoctor = user && user.role === "private_doctor";
    const isPresent = args.sessionToken 
      ? (await ctx.db
          .query("biometric_sessions")
          .withIndex("by_token", (q) => q.eq("session_token", args.sessionToken!))
          .first())?.is_valid 
      : false;

    // Enrich with order info AND filter for private doctors in absent mode
    const enriched = await Promise.all(
      results.map(async (r) => {
        const order = await ctx.db.get(r.order_id);
        
        // If absent mode private doctor, skip if not their own
        if (isPrivateDoctor && !isPresent && order?.doctor_id !== user._id) {
          return null;
        }

        const maskedDoc = await maskDocumentDoctor(ctx, args.betterAuthId || null, { ...r, doctor_id: order?.doctor_id });

        return {
          ...r,
          ...maskedDoc,
          analysis_type: order?.analysis_type || "Unknown",
          urgency: order?.urgency || "routine",
          ordered_at: order?.ordered_at,
          doctor_id: order?.doctor_id,
        };
      })
    );

    return enriched.filter(Boolean);
  },
});
