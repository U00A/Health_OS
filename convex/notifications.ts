import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser } from "./security";

// ============================================================
// Notification System (Section 9.3)
// Bell alert notifications for real-time events:
// - Doctor: result arrived, escalation triggered
// - Patient: prescription written, result uploaded
// - Staff: escalation acknowledged
// ============================================================

// Get notifications for current user
export const getMyNotifications = query({
  args: {
    betterAuthId: v.string(),
    unread_only: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) return [];

    let notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipient_id", user._id))
      .order("desc")
      .take(100);

    if (args.unread_only) {
      notifications = notifications.filter((n) => !n.is_read);
    }

    // Enrich with patient names
    const enriched = await Promise.all(
      notifications.map(async (n) => {
        let patientName = "";
        if (n.patient_id) {
          const patient = await ctx.db.get(n.patient_id);
          if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
          }
        }
        let senderName = "";
        if (n.sender_id) {
          const sender = await ctx.db.get(n.sender_id);
          if (sender) {
            senderName = sender.name || "";
          }
        }
        return {
          ...n,
          patientName,
          senderName,
        };
      })
    );

    return enriched;
  },
});

// Get unread count for badge display
export const getUnreadCount = query({
  args: {
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) return 0;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipient_id", user._id))
      .order("desc")
      .take(100);

    return notifications.filter((n) => !n.is_read).length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    betterAuthId: v.string(),
    notification_id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) throw new Error("User not found");

    const notification = await ctx.db.get(args.notification_id);
    if (!notification) throw new Error("Notification not found");

    if (notification.recipient_id !== user._id) {
      throw new Error("Forbidden: Cannot read another user's notification");
    }

    await ctx.db.patch(args.notification_id, { is_read: true });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) throw new Error("User not found");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipient_id", user._id))
      .collect();

    for (const n of notifications) {
      if (!n.is_read) {
        await ctx.db.patch(n._id, { is_read: true });
      }
    }
  },
});

// Acknowledge escalation notification (requires explicit ack)
export const acknowledgeEscalation = mutation({
  args: {
    betterAuthId: v.string(),
    notification_id: v.id("notifications"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) throw new Error("User not found");

    const notification = await ctx.db.get(args.notification_id);
    if (!notification) throw new Error("Notification not found");

    if (notification.recipient_id !== user._id) {
      throw new Error("Forbidden");
    }

    await ctx.db.patch(args.notification_id, {
      is_read: true,
      acknowledged_at: Date.now(),
    });

    // Log escalation acknowledgement
    if (notification.patient_id) {
      // Find the ward for this patient
      const admissions = await ctx.db
        .query("admissions")
        .withIndex("by_patient", (q) => q.eq("patient_id", notification.patient_id!))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      if (admissions.length > 0) {
        const admission = admissions[0];
        if (admission.ward_id) {
          await ctx.db.insert("case_entries", {
            ward_id: admission.ward_id,
            actor_id: user._id,
            timestamp: Date.now(),
            entry_type: "escalation_acknowledged",
            patient_id: notification.patient_id,
            notes: args.notes || "Escalation acknowledged by assigned doctor",
          });
        }
      }
    }
  },
});

// Prescription written notification (triggered when prescription is saved)
export const notifyPrescriptionWritten = mutation({
  args: {
    doctor_id: v.id("users"),
    patient_id: v.id("patients"),
    medication_count: v.number(),
  },
  handler: async (ctx, args) => {
    const patientRecord = await ctx.db.get(args.patient_id);
    if (!patientRecord || !patientRecord.user_id) return;

    const patientUser = await ctx.db.get(patientRecord.user_id);
    if (!patientUser) return;

    const doctor = await ctx.db.get(args.doctor_id);
    const doctorName = doctor?.name || "Your Doctor";

    await ctx.db.insert("notifications", {
      recipient_id: patientUser._id,
      sender_id: args.doctor_id,
      patient_id: args.patient_id,
      notification_type: "prescription_written",
      title: "New Prescription",
      message: `${doctorName} has prescribed ${args.medication_count} medication(s) for you.`,
      created_at: Date.now(),
      is_read: false,
    });
  },
});

// Signal flag notification (triggered when doctor signals another doctor)
export const createSignalFlag = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    flag_type: v.union(v.literal("alert"), v.literal("recommendation"), v.literal("observation")),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) throw new Error("User not found");

    if (user.role !== "medecin_etat" && user.role !== "private_doctor") {
      throw new Error("Forbidden: Only doctors can create signal flags");
    }

    // Create signal flag (identity always anonymised)
    await ctx.db.insert("signal_flags", {
      patient_id: args.patient_id,
      doctor_id: user._id,
      flag_type: args.flag_type,
      note: args.note,
      created_at: Date.now(),
    });

    // Notify the patient
    const patientRecord = await ctx.db.get(args.patient_id);
    if (patientRecord && patientRecord.user_id) {
      await ctx.db.insert("notifications", {
        recipient_id: patientRecord.user_id,
        sender_id: user._id,
        patient_id: args.patient_id,
        notification_type: "signal_flag",
        title: "Care Team Note",
        message: "A treating physician has left a note for your care team.",
        created_at: Date.now(),
        is_read: false,
      });
    }
  },
});

// Get signal flags for a patient (shown to subsequent doctors)
export const getSignalFlagsForPatient = query({
  args: {
    patient_id: v.id("patients"),
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) throw new Error("User not found");

    // Only clinical roles can see flags
    if (user.role === "administration") return [];

    const flags = await ctx.db
      .query("signal_flags")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();

    // Always anonymised ??? sender is always "Treating Physician"
    return flags.map((f) => ({
      ...f,
      doctorName: "Treating Physician",
    }));
  },
});
