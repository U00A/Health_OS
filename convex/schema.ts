import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    betterAuthId: v.optional(v.string()),
    hospital_id: v.optional(v.id("hospitals")),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("medecin_etat"),
      v.literal("private_doctor"),
      v.literal("medical_staff"),
      v.literal("pharmacy"),
      v.literal("laboratory"),
      v.literal("patient")
    )),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_hospital", ["hospital_id"])
    .index("by_better_auth_id", ["betterAuthId"]),

  hospitals: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
  }).index("by_name", ["name"]),

  wards: defineTable({
    hospital_id: v.id("hospitals"),
    name: v.string(),
    floor: v.optional(v.string()),
    capacity: v.number(),
  }).index("by_hospital", ["hospital_id"]),

  specialities: defineTable({
    hospital_id: v.id("hospitals"),
    name: v.string(),
  }).index("by_hospital", ["hospital_id"]),

  patients: defineTable({
    user_id: v.optional(v.id("users")), // User ID if they have an account
    national_id: v.string(),
    first_name: v.string(),
    last_name: v.string(),
    dob: v.string(), // ISO format YYYY-MM-DD
    blood_type: v.optional(v.string()),
    phone: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
  })
    .index("by_national_id", ["national_id"])
    .index("by_user_id", ["user_id"]),

  beds: defineTable({
    ward_id: v.id("wards"),
    name: v.string(),
    status: v.union(v.literal("vacant"), v.literal("occupied"), v.literal("pending_discharge")),
  })
    .index("by_ward", ["ward_id"])
    .index("by_status", ["status"]),

  doctor_patients: defineTable({
    doctor_id: v.id("users"),
    patient_id: v.id("patients"),
    active: v.boolean(),
  })
    .index("by_doctor", ["doctor_id"])
    .index("by_patient", ["patient_id"]),

  compte_rendus: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.id("users"),
    date: v.number(), // timestamp
    diagnosis_code: v.optional(v.string()), // ICD-10
    symptoms: v.optional(v.string()),
    treatment_plan: v.optional(v.string()),
    follow_up: v.optional(v.string()),
    content_html: v.string(), // Rich text
  })
    .index("by_patient", ["patient_id"])
    .index("by_doctor", ["doctor_id"]),

  prescriptions: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.id("users"),
    issued_at: v.number(),
    status: v.union(v.literal("active"), v.literal("dispensed"), v.literal("expired")),
    medications: v.array(v.object({
      name: v.string(),
      dose: v.string(),
      frequency: v.string(),
      duration: v.string()
    })),
  })
    .index("by_patient", ["patient_id"])
    .index("by_doctor", ["doctor_id"])
    .index("by_status", ["status"]),

  lab_orders: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.id("users"),
    lab_id: v.optional(v.id("users")), // laboratory user ID
    ordered_at: v.number(),
    analysis_type: v.string(),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    status: v.union(v.literal("pending"), v.literal("completed")),
  })
    .index("by_patient", ["patient_id"])
    .index("by_lab", ["lab_id"])
    .index("by_doctor", ["doctor_id"]),

  lab_results: defineTable({
    order_id: v.id("lab_orders"),
    uploaded_at: v.number(),
    lab_tech_id: v.id("users"),
    values: v.any(), // JSON unstructured for now
    pdf_storage_id: v.optional(v.id("_storage")),
  }).index("by_order", ["order_id"]),

  imaging_files: defineTable({
    patient_id: v.id("patients"),
    uploaded_at: v.number(),
    modality: v.string(),
    body_part: v.string(),
    storage_id: v.id("_storage"),
  }).index("by_patient", ["patient_id"]),

  admissions: defineTable({
    patient_id: v.id("patients"),
    bed_id: v.id("beds"),
    admitted_at: v.number(),
    discharged_at: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("discharged")),
  })
    .index("by_patient", ["patient_id"])
    .index("by_bed", ["bed_id"])
    .index("by_status", ["status"]),

  case_entries: defineTable({
    ward_id: v.id("wards"),
    actor_id: v.id("users"),
    timestamp: v.number(),
    entry_type: v.union(v.literal("shift_start"), v.literal("shift_end"), v.literal("admission"), v.literal("discharge"), v.literal("bed_transfer"), v.literal("escalation")),
    notes: v.optional(v.string()),
    patient_id: v.optional(v.id("patients")),
  })
    .index("by_actor", ["actor_id"])
    .index("by_ward", ["ward_id"])
    .index("by_type", ["entry_type"]),

  dispense_records: defineTable({
    prescription_id: v.id("prescriptions"),
    pharmacist_id: v.id("users"),
    dispensed_at: v.number(),
    notes: v.optional(v.string()),
  }).index("by_prescription", ["prescription_id"]),
});
