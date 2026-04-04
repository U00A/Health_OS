import { v } from "convex/values";
import { query } from "./_generated/server";

export const listByHospital = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("specialities")
      .withIndex("by_hospital", (q) => q.eq("hospital_id", args.hospital_id))
      .collect();
  },
});

export const listWithDoctors = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, args) => {
    const specialities = await ctx.db
      .query("specialities")
      .withIndex("by_hospital", (q) => q.eq("hospital_id", args.hospital_id))
      .collect();

    const enriched = await Promise.all(
      specialities.map(async (s) => {
        const doctors = await ctx.db
          .query("users")
          .withIndex("by_speciality", (q) => q.eq("speciality_id", s._id))
          .collect();
        return {
          ...s,
          doctors: doctors.map((d) => ({
            _id: d._id,
            name: d.name || "Unnamed",
            role: d.role,
          })),
        };
      })
    );
    return enriched;
  },
});
