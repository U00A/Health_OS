import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

// Convex deployment URL
const CONVEX_URL = "https://dusty-dinosaur-1.eu-west-1.convex.cloud";

async function cleanupPatients() {
  const convex = new ConvexHttpClient(CONVEX_URL);

  console.log("Cleaning up patient accounts...\n");

  // First, let's see what patients exist
  console.log("Current patients in database:");
  const allPatients = await convex.query(api.patients.listAll, { betterAuthId: "admin" }).catch(() => []);
  console.log(`Found ${allPatients.length} patient(s)\n`);

  // Delete all patients
  console.log("Deleting all patients...");
  try {
    const result = await convex.mutation(api.patients.deleteAllPatients, { betterAuthId: "admin" });
    console.log(`Deleted ${result.deletedCount} patient(s)\n`);
  } catch (e) {
    console.log(`Error deleting patients: ${e.message}\n`);
  }

  // Delete all patient users
  console.log("Deleting all patient users...");
  try {
    const result = await convex.mutation(api.users.deleteAllPatientUsers, { betterAuthId: "admin" });
    console.log(`Deleted ${result.deletedCount} user(s)\n`);
  } catch (e) {
    console.log(`Error deleting users: ${e.message}\n`);
  }

  console.log("Cleanup complete!");
}

cleanupPatients().catch(console.error);