import { mutation } from "./_generated/server";

export const patients = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all users with role 'patient'
    const allUsers = await ctx.db.query("users").withIndex("by_role", q => q.eq("role", "patient")).collect();
    
    // 2. Loop through each and ensure a linked patients record exists
    for (const user of allUsers) {
      const existingPatient = await ctx.db.query("patients").withIndex("by_user_id", q => q.eq("user_id", user._id)).first();
      
      if (!existingPatient) {
        const fakeNationalId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        
        await ctx.db.insert("patients", {
          user_id: user._id,
          national_id: fakeNationalId,
          first_name: user.name?.split(" ")[0] || "Demo",
          last_name: user.name?.split(" ")[1] || "Patient",
          dob: "1980-05-15",
          blood_type: "O+",
          phone: user.phone || "0555000000",
          wilaya: "Algiers",
          commune: "Bab Ezzouar",
          allergies: ["Penicillin", "Peanuts"]
        });
        
        console.log(`Seeded patient record for user: ${user.email}`);
      }
    }
    
    return { success: true, message: "Missing patient records seeded." };
  }
});
