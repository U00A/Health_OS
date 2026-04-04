import { query } from "./_generated/server";

export const getLandingStats = query({
  args: {},
  handler: async (ctx) => {
    // Collect specific counts. Note: For extremely large production databases,
    // dedicated counter aggregates or the edge config should be used.
    // For the current scale, querying and getting .length provides real-time counts.
    const users = await ctx.db.query("users").collect();
    const patients = await ctx.db.query("patients").collect();
    const hospitals = await ctx.db.query("hospitals").collect();
    const activeAdmissions = await ctx.db.query("admissions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return {
      totalUsers: users.length,
      totalPatients: patients.length,
      totalHospitals: hospitals.length,
      activeAdmissions: activeAdmissions.length,
    };
  },
});
