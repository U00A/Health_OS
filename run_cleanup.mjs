import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = "https://dusty-dinosaur-1.eu-west-1.convex.cloud";
const ADMIN_BETTER_AUTH_ID = "cCl6FmOmFqcms7Szsd0c2doVXnoQktFo";

async function main() {
  const convex = new ConvexHttpClient(CONVEX_URL);

  // List all patients
  console.log("Listing all patients...");
  const patients = await convex.query("patients:listAll", { betterAuthId: ADMIN_BETTER_AUTH_ID });
  console.log(`Found ${patients.length} patients`);

  // Delete each patient
  for (const patient of patients) {
    console.log(`\nDeleting patient: ${patient.first_name} ${patient.last_name} (${patient._id})`);
    
    // Delete associated user if exists
    if (patient.user_id) {
      console.log(`  Deleting associated user: ${patient.user_id}`);
      try {
        await convex.mutation("admin_users:deleteUser", {
          betterAuthId: ADMIN_BETTER_AUTH_ID,
          userId: patient.user_id
        });
        console.log("  User deleted");
      } catch (e) {
        console.log(`  Error deleting user: ${e.message}`);
      }
    }
    
    // Delete patient record
    try {
      await convex.mutation("patients:delete", {
        betterAuthId: ADMIN_BETTER_AUTH_ID,
        patientId: patient._id
      });
      console.log("  Patient deleted");
    } catch (e) {
      console.log(`  Error deleting patient: ${e.message}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);