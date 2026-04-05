import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireRole } from "./security";

// Utility function to generate a random number between min and max
const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generatePatientMockData = mutation({
  args: {
    betterAuthId: v.string(),
    patient_id: v.id("patients"),
    daysHistory: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Both doctors and admins can seed data for testing
    const user = await requireRole(ctx, ["admin", "medical_staff", "state_doctor", "private_doctor"], args.betterAuthId);
    
    const days = args.daysHistory || 14; // Default to 2 weeks of history
    const vitalsToInsert = [];
    
    // Base healthy values
    let currentWeight = randomInRange(65, 95);
    let currentSysBP = randomInRange(110, 130);
    let currentDiaBP = randomInRange(70, 85);
    
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = days; i >= 0; i--) {
      // Simulate slight fluctuations over time
      currentWeight += (Math.random() - 0.5) * 0.5; // Fluctuate by +/- 0.25kg
      currentSysBP += randomInRange(-3, 3);
      currentDiaBP += randomInRange(-2, 2);
      
      const hr = randomInRange(60, 95);
      const temp = 36.5 + (Math.random() * 0.8); // 36.5 to 37.3
      const spo2 = randomInRange(96, 100);
      const resp = randomInRange(12, 18);

      const pastTimestamp = now - (i * oneDayMs) + randomInRange(-2*60*60*1000, 2*60*60*1000); // +/- 2 hours noise

      vitalsToInsert.push({
        patient_id: args.patient_id,
        recorded_by: user._id,
        recorded_at: pastTimestamp,
        systolic_bp: currentSysBP,
        diastolic_bp: currentDiaBP,
        heart_rate: hr,
        temperature: parseFloat(temp.toFixed(1)),
        spo2: spo2,
        respiratory_rate: resp,
        weight: parseFloat(currentWeight.toFixed(1)),
      });
    }

    // Insert all the historical vitals
    let insertedVitalsCount = 0;
    for (const vital of vitalsToInsert) {
      await ctx.db.insert("vitals", vital);
      insertedVitalsCount++;
    }

    // Generate Mock CRs
    const numCrs = randomInRange(1, 3);
    for (let i = 0; i < numCrs; i++) {
        const pastTimestamp = now - randomInRange(1, days) * oneDayMs;
        await ctx.db.insert("compte_rendus", {
            patient_id: args.patient_id,
            doctor_id: user._id,
            date: pastTimestamp,
            diagnosis_code: ["HTN", "T2DM", "ASTHMA", "URTI"][randomInRange(0, 3)],
            symptoms: "Patient complained of mild headache and occasional dizziness.",
            treatment_plan: "Increase hydration, monitor blood pressure daily.",
            follow_up: "Two weeks",
            content_html: "<p>General consultation.</p>"
        });
    }

    // Generate Mock Lab Results
    const numLabs = randomInRange(1, 3);
    for (let i = 0; i < numLabs; i++) {
        const pastTimestamp = now - randomInRange(1, days) * oneDayMs;
        const analysisType = ["Complete Blood Count (CBC)", "Basic Metabolic Panel (BMP)", "Lipid Panel", "HbA1c"][randomInRange(0, 3)];
        
        // Ensure a lab order exists to attach the result to
        const orderId = await ctx.db.insert("lab_orders", {
          patient_id: args.patient_id,
          doctor_id: user._id,
          ordered_at: pastTimestamp - (1000 * 60 * 60 * 2), // 2 hours before
          analysis_type: analysisType,
          urgency: "routine",
          status: "completed",
        });

        // Basic dummy values
        const values: Record<string, number> = {};
        if (analysisType === "Complete Blood Count (CBC)") {
            values["wbc"] = parseFloat((Math.random() * 5 + 4).toFixed(1));
            values["rbc"] = parseFloat((Math.random() * 2 + 4).toFixed(1));
            values["hemoglobin"] = parseFloat((Math.random() * 5 + 11).toFixed(1));
            values["hematocrit"] = parseFloat((Math.random() * 15 + 35).toFixed(1));
            values["platelets"] = Math.floor(Math.random() * 200 + 150);
        } else if (analysisType === "Basic Metabolic Panel (BMP)") {
            values["glucose"] = Math.floor(Math.random() * 30 + 75);
            values["bun"] = Math.floor(Math.random() * 10 + 10);
            values["creatinine"] = parseFloat((Math.random() * 0.5 + 0.7).toFixed(1));
            values["sodium"] = Math.floor(Math.random() * 10 + 135);
            values["potassium"] = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
            values["calcium"] = parseFloat((Math.random() * 2 + 8.5).toFixed(1));
        } else if (analysisType === "Lipid Panel") {
            values["total_chol"] = Math.floor(Math.random() * 50 + 150);
            values["ldl"] = Math.floor(Math.random() * 40 + 80);
            values["hdl"] = Math.floor(Math.random() * 20 + 40);
            values["triglycerides"] = Math.floor(Math.random() * 50 + 100);
        } else {
            values["hba1c"] = parseFloat((Math.random() * 2 + 4.5).toFixed(1));
        }

        await ctx.db.insert("lab_results", {
           order_id: orderId,
           patient_id: args.patient_id,
           lab_tech_id: user._id, // Assume the user inserting acts as the lab tech for mock data
           uploaded_at: pastTimestamp,
           values: values,
        });
    }

    return {
      success: true,
      message: `Generated ${insertedVitalsCount} historical vitals, ${numCrs} CRs, and ${numLabs} Lab Results.`,
      insertedVitalsCount: insertedVitalsCount
    };
  },
});
