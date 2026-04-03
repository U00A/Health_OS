import { QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export async function requireRole(ctx: QueryCtx, allowedRoles: string[], betterAuthId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", betterAuthId))
    .first();

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

  // Fallback, to be extended for staff, lab, pharmacy
  return true;
}
