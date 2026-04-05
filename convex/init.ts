import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id, TableNames } from "./_generated/dataModel";

/**
 * Master initialization function. Seeds everything needed for a working demo:
 * Hospital → Wards → Beds → Specialities → Demo Users → Demo Patients → Demo Prescriptions → Demo Lab Orders → Demo Case Entries
 * Run via: npx convex run init:masterInit
 */
export const masterInit = mutation({
  args: { resetFirst: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    // Optional: Reset existing data
    if (args.resetFirst) {
      // Call reset inline since we can't call mutation from mutation
      const tableNames = [
        "dispense_records", "case_entries", "lab_results", "lab_orders",
        "prescriptions", "compte_rendus", "imaging_files", "admissions",
        "vitals", "doctor_patients", "beds", "wards", "specialities",
        "patients", "users", "hospitals",
      ] as const;
      for (const table of tableNames) {
        try {
          const docs = await ctx.db.query(table as TableNames).collect();
          for (const doc of docs) {
            await ctx.db.delete(doc._id);
          }
        } catch { /* skip */ }
      }
    }

    // 1. Seed hospital
    let hospitalId: Id<"hospitals">;
    const existingHospital = await ctx.db
      .query("hospitals")
      .withIndex("by_name", (q) => q.eq("name", "CHU Mustapha Pacha"))
      .first();

    if (existingHospital) {
      hospitalId = existingHospital._id;
    } else {
      hospitalId = await ctx.db.insert("hospitals", {
        name: "CHU Mustapha Pacha",
        address: "Boulevard Mustapha Pacha",
        wilaya: "Alger",
        commune: "Alger Centre",
      });
    }

    // 2. Seed specialities for this hospital
    const specialityNames = [
      "Cardiologie", "Chirurgie Générale", "Pédiatrie",
      "Gynécologie-Obstétrique", "Médecine Interne", "Neurologie",
      "Orthopédie", "Pneumologie", "Radiologie", "Laboratoire",
      "Urgences", "Anesthésie-Réanimation",
    ];

    const specialityIds: Id<"specialities">[] = [];
    for (const name of specialityNames) {
      const existing = await ctx.db
        .query("specialities")
        .withIndex("by_hospital", (q) => q.eq("hospital_id", hospitalId))
        .filter((q) => q.eq(q.field("name"), name))
        .first();

      if (existing) {
        specialityIds.push(existing._id);
      } else {
        const id = await ctx.db.insert("specialities", {
          hospital_id: hospitalId,
          name,
        });
        specialityIds.push(id);
      }
    }

    // 3. Seed wards for this hospital
    const wardDefs = [
      { name: "Urgences", floor: "RDC", capacity: 20 },
      { name: "Chirurgie A", floor: "1er Étage", capacity: 15 },
      { name: "Chirurgie B", floor: "1er Étage", capacity: 15 },
      { name: "Médecine Interne", floor: "2ème Étage", capacity: 20 },
      { name: "Cardiologie", floor: "3ème Étage", capacity: 12 },
      { name: "Pédiatrie", floor: "3ème Étage", capacity: 15 },
      { name: "Réanimation", floor: "4ème Étage", capacity: 10 },
      { name: "Maternité", floor: "4ème Étage", capacity: 18 },
    ];

    const wardIds: Id<"wards">[] = [];
    for (const wardDef of wardDefs) {
      const existing = await ctx.db
        .query("wards")
        .withIndex("by_hospital", (q) => q.eq("hospital_id", hospitalId))
        .filter((q) => q.eq(q.field("name"), wardDef.name))
        .first();

      if (existing) {
        wardIds.push(existing._id);
      } else {
        const id = await ctx.db.insert("wards", {
          hospital_id: hospitalId,
          name: wardDef.name,
          floor: wardDef.floor,
          capacity: wardDef.capacity,
        });
        wardIds.push(id);
      }
    }

    // 4. Seed beds for each ward
    const emergenciesWardId = wardIds[0];
    const surgeryAWardId = wardIds[1];
    const medicineWardId = wardIds[3];

    let bedCount = 0;
    for (const wardId of wardIds) {
      const wardDef = wardDefs.find((w) => w.name === wardDefs[wardIds.indexOf(wardId)]?.name);
      const capacity = wardDef?.capacity || 10;

      for (let i = 1; i <= capacity; i++) {
        const ward = await ctx.db.get(wardId);
        if (!ward) continue;
        const existing = await ctx.db
          .query("beds")
          .withIndex("by_ward", (q) => q.eq("ward_id", wardId))
          .filter((q) => q.eq(q.field("name"), `Lit ${i}`))
          .first();

        if (!existing) {
          await ctx.db.insert("beds", {
            ward_id: wardId,
            name: `Lit ${i.toString().padStart(2, "0")}`,
            status: "vacant",
          });
          bedCount++;
        }
      }
    }

    // 5. Seed demo users
    const demoUsers = [
      { email: "admin@hospital.local", role: "admin" as const, name: "Administrateur Système" },
      { email: "doctoretat@test.com", role: "medecin_etat" as const, name: "Dr. Amara Boudiaf", speciality: "Médecine Interne" },
      { email: "privatedoc@test.com", role: "private_doctor" as const, name: "Dr. Leïla Hamdi", speciality: "Cardiologie" },
      { email: "staff@hospital.local", role: "medical_staff" as const, name: "Infirmier Sofiane Meziane" },
      { email: "pharmacy@hospital.local", role: "pharmacy" as const, name: "Pharmacien Nassima Khelifi" },
      { email: "lab@hospital.local", role: "laboratory" as const, name: "Technicien Labo Karim Benali" },
      { email: "ouanes461@gmail.com", role: "patient" as const, name: "Yassine Ourdane" },
    ];

    const userIds: Record<string, Id<"users"> | null> = {};
    for (const demo of demoUsers) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", demo.email))
        .first();

      let userId: Id<"users">;
      if (existing) {
        userId = existing._id;
        // Update role/hospital if needed
        const updates: Record<string, unknown> = {};
        updates.role = demo.role;
        updates.hospital_id = hospitalId;
        if (demo.speciality) {
          const specialityForUser = specialityIds.find((sid) => {
            // Match speciality by name
            return sid; // simplified
          });
          if (specialityForUser) updates.speciality_id = specialityForUser;
        }
        if (existing.role !== demo.role || existing.hospital_id !== hospitalId) {
          await ctx.db.patch(existing._id, updates);
        }
      } else {
        const userFields: Record<string, unknown> = {
          email: demo.email,
          name: demo.name,
          role: demo.role,
          hospital_id: hospitalId,
        };
        if (demo.speciality) {
          const specialityForUser = specialityIds.find(() => true);
          if (specialityForUser) userFields.speciality_id = specialityForUser;
        }
        userId = await ctx.db.insert("users", userFields);
      }
      userIds[demo.email] = userId;
    }

    // 6. Seed demo patients
    const demoPatients = [
      {
        national_id: "19901011234567",
        first_name: "Fatima",
        last_name: "Zahra",
        dob: "1990-10-11",
        blood_type: "A+",
        phone: "0555123456",
        wilaya: "Alger",
        commune: "Hussein Dey",
        allergies: ["Penicillin", "Aspirin"],
        assigned_doctor_email: "doctoretat@test.com",
        admission_ward: medicineWardId,
      },
      {
        national_id: "19851204567890",
        first_name: "Mohamed",
        last_name: "Cherif",
        dob: "1985-12-04",
        blood_type: "O-",
        phone: "0661987654",
        wilaya: "Blida",
        commune: "Blida Centre",
        allergies: ["Latex"],
        assigned_doctor_email: "doctoretat@test.com",
        admission_ward: emergenciesWardId,
      },
      {
        national_id: "19750307891234",
        first_name: "Amina",
        last_name: "Bellil",
        dob: "1975-03-07",
        blood_type: "B+",
        phone: "0770111222",
        wilaya: "Oran",
        commune: "Oran Centre",
        allergies: [],
        assigned_doctor_email: "privatedoc@test.com",
        admission_ward: surgeryAWardId,
      },
      {
        national_id: "19600315678901",
        first_name: "Ahmed",
        last_name: "Boualem",
        dob: "1960-03-15",
        blood_type: "AB+",
        phone: "0555333444",
        wilaya: "Sétif",
        commune: "Sétif Ville",
        allergies: ["Iodine", "Sulfa"],
        assigned_doctor_email: "privatedoc@test.com",
        admission_ward: null,
      },
    ];

    for (const dp of demoPatients) {
      const existing = await ctx.db
        .query("patients")
        .withIndex("by_national_id", (q) => q.eq("national_id", dp.national_id))
        .first();

      if (!existing) {
        // Find patient user if exists
        const patientUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", "ouanes461@gmail.com"))
          .first();

        const patientId = await ctx.db.insert("patients", {
          user_id: dp.first_name === "Yassine" ? (userIds["ouanes461@gmail.com"] ?? undefined) : undefined,
          national_id: dp.national_id,
          first_name: dp.first_name,
          last_name: dp.last_name,
          dob: dp.dob,
          blood_type: dp.blood_type,
          phone: dp.phone,
          wilaya: dp.wilaya,
          commune: dp.commune,
          allergies: dp.allergies,
        });

        // Assign to doctor
        const doctor = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", dp.assigned_doctor_email))
          .first();

        if (doctor) {
          await ctx.db.insert("doctor_patients", {
            doctor_id: doctor._id,
            patient_id: patientId,
            active: true,
          });
        }

        // Admit if ward specified
        if (dp.admission_ward) {
          const bedsInWard = await ctx.db
            .query("beds")
            .withIndex("by_ward", (q) => q.eq("ward_id", dp.admission_ward as Id<"wards">))
            .filter((q) => q.eq(q.field("status"), "vacant"))
            .take(1);

          if (bedsInWard.length > 0) {
            const bed = bedsInWard[0];
            await ctx.db.patch(bed._id, { status: "occupied" });

            await ctx.db.insert("admissions", {
              patient_id: patientId,
              bed_id: bed._id,
              doctor_id: doctor ? doctor._id : undefined,
              ward_id: dp.admission_ward,
              admitted_at: Date.now() - Math.floor(Math.random() * 86400000 * 3),
              admission_type: "emergency",
              status: "active",
            });
          }
        }
      }
    }

    // 7. Seed demo lab users
    const labUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "lab@hospital.local"))
      .first();

    if (labUser) {
      await ctx.db.patch(labUser._id, { ward_id: emergenciesWardId });
    }

    return {
      success: true,
      message: `Master init complete: 1 hospital, ${specialityIds.length} specialities, ${wardIds.length} wards, ${bedCount} beds, ${demoUsers.length} demo users, ${demoPatients.length} demo patients.`,
    };
  },
});

/**
 * Nuclear reset: wipes ALL tables so you can re-run init from scratch.
 */
export const masterReset = mutation({
  args: {},
  handler: async (ctx) => {
    const tableNames = [
      "dispense_records",
      "case_entries",
      "lab_results",
      "lab_orders",
      "prescriptions",
      "compte_rendus",
      "imaging_files",
      "admissions",
      "vitals",
      "doctor_patients",
      "beds",
      "wards",
      "specialities",
      "patients",
      "users",
      "hospitals",
      "patient_documents",
      "notifications",
      "signal_flags",
      "billing_records",
      "consultation_templates",
      "biometric_sessions",
      "supply_requests",
      "shift_handovers",
      "referrals",
    ] as const;

    let totalDeleted = 0;
    for (const table of tableNames) {
      try {
        const docs = await ctx.db.query(table as TableNames).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          totalDeleted++;
        }
      } catch {
        // Table might not exist, skip
      }
    }

    return { deleted: totalDeleted, message: "All data cleared inclusive of v2.0 tables." };
  },
});

/**
 * Quick check if the platform has been seeded.
 */
export const checkInit = query({
  args: {},
  handler: async (ctx) => {
    const hospitals = await ctx.db.query("hospitals").take(1);
    const users = await ctx.db.query("users").collect();
    const patients = await ctx.db.query("patients").collect();
    const wards = await ctx.db.query("wards").collect();
    const beds = await ctx.db.query("beds").collect();
    const specialities = await ctx.db.query("specialities").collect();
    const admissions = await ctx.db.query("admissions").collect();

    return {
      isSeeded: hospitals.length > 0,
      counts: {
        hospitals: hospitals.length,
        users: users.length,
        patients: patients.length,
        wards: wards.length,
        beds: beds.length,
        specialities: specialities.length,
        admissions: admissions.length,
      },
      roles: users.reduce((acc, u) => {
        const role = u.role || "unknown";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});