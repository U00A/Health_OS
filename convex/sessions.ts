import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireRole } from "./security";

export const shiftClockInfo = mutation({
  args: {
    betterAuthId: v.string(),
    event: v.union(v.literal("clock_in"), v.literal("clock_out")),
    ward_id: v.id("wards"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["medical_staff", "medecin_etat"], args.betterAuthId);

    // Auto-log to append-only case_entries
    await ctx.db.insert("case_entries", {
      actor_id: user._id,
      ward_id: args.ward_id,
      timestamp: Date.now(),
      entry_type: args.event === "clock_in" ? "shift_start" : "shift_end",
      notes: `User session automatic logging: ${args.event}`,
    });
  }
});
