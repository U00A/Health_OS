import { mutation } from "./_generated/server";

/**
 * Ensures that demo users for all roles exist in the database.
 * Note: This only seeds the 'users' table. 
 * Passwords must be set via the Register flow on the first login.
 */
export const seedDemoUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const demoUsers = [
      { email: "admin@hospital.local", role: "admin", name: "System Administrator" },
      { email: "ouanes461@gmail.com", role: "patient", name: "Demo Patient" },
      { email: "doctoretat@test.com", role: "medecin_etat", name: "State Doctor" },
      { email: "privatedoc@test.com", role: "private_doctor", name: "Private Practitioner" },
      { email: "staff@hospital.local", role: "medical_staff", name: "Ward Staff" },
      { email: "pharmacy@hospital.local", role: "pharmacy", name: "Hospital Pharmacy" },
      { email: "lab@hospital.local", role: "laboratory", name: "Central Lab" },
    ] as const;

    let createdCount = 0;
    let existingCount = 0;

    for (const demo of demoUsers) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", demo.email))
        .first();

      if (!existing) {
        await ctx.db.insert("users", {
          email: demo.email,
          role: demo.role,
          name: demo.name,
        });
        createdCount++;
      } else {
        // Update role if it's different
        if (existing.role !== demo.role) {
          await ctx.db.patch(existing._id, { role: demo.role });
        }
        existingCount++;
      }
    }

    return {
      message: `Seed complete. Created ${createdCount} users, verified ${existingCount} existing users.`,
      success: true,
    };
  },
});
