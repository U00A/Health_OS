import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getUser } from "./security";

export const createOrder = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    lab_id: v.optional(v.id("users")),
    analysis_type: v.string(),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    clinical_notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);

    return await ctx.db.insert("lab_orders", {
      patient_id: args.patient_id,
      doctor_id: user._id,
      lab_id: args.lab_id,
      ordered_at: Date.now(),
      analysis_type: args.analysis_type,
      urgency: args.urgency,
      status: "pending",
      clinical_notes: args.clinical_notes,
    });
  },
});

export const listPendingOrders = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.betterAuthId);
    if (!user) return [];
    if (user.role !== "laboratory" && user.role !== "admin") return [];
    // Lab sees all pending/in-progress orders (optionally filtered to their lab_id)
    const orders = await ctx.db
      .query("lab_orders")
      .filter((q) => q.neq(q.field("status"), "completed"))
      .order("desc")
      .collect();

    // Populate patient and doctor info
    const enriched = await Promise.all(
      orders.map(async (order) => {
        const patient = await ctx.db.get(order.patient_id);
        const doctor = await ctx.db.get(order.doctor_id);
        return {
          ...order,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          doctorName: doctor?.name || "Unknown",
        };
      })
    );
    return enriched;
  },
});

export const listByDoctor = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medecin_etat", "private_doctor"], args.betterAuthId);
    return await ctx.db
      .query("lab_orders")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", user._id))
      .order("desc")
      .take(50);
  },
});

export const listByPatient = query({
  args: { patient_id: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lab_orders")
      .withIndex("by_patient", (q) => q.eq("patient_id", args.patient_id))
      .order("desc")
      .collect();
  },
});

export const listAllPending = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("lab_orders")
      .filter((q) => q.neq(q.field("status"), "completed"))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const patient = await ctx.db.get(order.patient_id);
        const doctor = await ctx.db.get(order.doctor_id);
        return {
          ...order,
          patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
          patientNationalId: patient?.national_id || "",
          doctorName: doctor?.name || "Unknown",
        };
      })
    );
    return enriched;
  },
});

export const updateStatus = mutation({
  args: {
    betterAuthId: v.string(),
    order_id: v.id("lab_orders"),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["laboratory"], args.betterAuthId);
    await ctx.db.patch(args.order_id, { status: args.status });
  },
});
