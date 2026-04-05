import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    betterAuthId: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    hospital_id: v.optional(v.id("hospitals")),
    speciality_id: v.optional(v.id("specialities")),
    ward_id: v.optional(v.id("wards")),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("medecin_etat"),
      v.literal("private_doctor"),
      v.literal("medical_staff"),
      v.literal("pharmacy"),
      v.literal("laboratory"),
      v.literal("patient"),
      v.literal("administration")  // NEW in v2.0
    )),
    // NEW in v2.0: Private doctor professional details
    clinic_name: v.optional(v.string()),
    clinic_address: v.optional(v.string()),
    professional_id: v.optional(v.string()),
    contact_details: v.optional(v.string()),
    // NEW in v2.0: Inactive patient flag
    is_inactive: v.optional(v.boolean()),
    // NEW in v2.0: Last seen date for inactive tracking
    last_seen_at: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_hospital", ["hospital_id"])
    .index("by_better_auth_id", ["betterAuthId"])
    .index("by_speciality", ["speciality_id"]),

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
    user_id: v.optional(v.id("users")),
    national_id: v.string(),
    first_name: v.string(),
    last_name: v.string(),
    dob: v.string(),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
    blood_type: v.optional(v.string()),
    phone: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    commune: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    // NEW in v2.0: Biometric reference for fingerprint gating
    biometric_reference: v.optional(v.string()),
    // NEW in v2.0: Emergency contact for admin role
    emergency_contact: v.optional(v.string()),
    // NEW in v2.0: Enrollment status
    enrollment_status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("archived")
    )),
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
    // NEW in v2.0: Enrollment invitation tracking
    invitation_status: v.optional(v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("expired")
    )),
    invitation_sent_at: v.optional(v.number()),
    // NEW in v2.0: Last consultation date for inactive tracking
    last_consultation_at: v.optional(v.number()),
  })
    .index("by_doctor", ["doctor_id"])
    .index("by_patient", ["patient_id"]),

  compte_rendus: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.id("users"),
    date: v.number(),
    diagnosis_code: v.optional(v.string()),
    symptoms: v.optional(v.string()),
    treatment_plan: v.optional(v.string()),
    follow_up: v.optional(v.string()),
    content_html: v.string(),
    amendment_of: v.optional(v.id("compte_rendus")),
    // NEW in v2.0: Template support
    template_id: v.optional(v.string()),
    // NEW in v2.0: Speciality context
    speciality_id: v.optional(v.id("specialities")),
  })
    .index("by_patient", ["patient_id"])
    .index("by_doctor", ["doctor_id"]),

  prescriptions: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.id("users"),
    issued_at: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("dispensed"),
      v.literal("partially_dispensed"),
      v.literal("expired")
    ),
    medications: v.array(v.object({
      name: v.string(),
      dose: v.string(),
      frequency: v.string(),
      duration: v.string(),
      route: v.optional(v.string()),
      verified: v.optional(v.boolean()),
    })),
    // NEW in v2.0: Expiry date for prescription expiry warning
    expiry_date: v.optional(v.number()),
    // NEW in v2.0: Controlled substance flag
    is_controlled_substance: v.optional(v.boolean()),
    // NEW in v2.0: Controlled substance reason field
    controlled_reason: v.optional(v.string()),
    // NEW in v2.0: Partial dispense tracking
    partially_dispensed_items: v.optional(v.array(v.object({
      name: v.string(),
      restock_date: v.optional(v.number()),
    }))),
  })
    .index("by_patient", ["patient_id"])
    .index("by_doctor", ["doctor_id"])
    .index("by_status", ["status"]),

  lab_orders: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.id("users"),
    lab_id: v.optional(v.id("users")),
    ordered_at: v.number(),
    analysis_type: v.string(),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
    clinical_notes: v.optional(v.string()),
    // NEW in v2.0: Turnaround tracking
    received_at: v.optional(v.number()),
    // NEW in v2.0: Critical value escalation tracking
    critical_escalated: v.optional(v.boolean()),
  })
    .index("by_patient", ["patient_id"])
    .index("by_lab", ["lab_id"])
    .index("by_doctor", ["doctor_id"])
    .index("by_status", ["status"]),

  lab_results: defineTable({
    order_id: v.id("lab_orders"),
    patient_id: v.id("patients"),
    uploaded_at: v.number(),
    lab_tech_id: v.id("users"),
    values: v.any(),
    pdf_storage_id: v.optional(v.id("_storage")),
    is_amendment: v.optional(v.boolean()),
    amends_result_id: v.optional(v.id("lab_results")),
    // NEW in v2.0: Critical values tracking
    critical_values: v.optional(v.array(v.object({
      field: v.string(),
      value: v.number(),
      critical_threshold: v.number(),
    }))),
  })
    .index("by_order", ["order_id"])
    .index("by_patient", ["patient_id"]),

  imaging_files: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.optional(v.id("users")),
    uploaded_at: v.number(),
    modality: v.string(),
    body_part: v.string(),
    storage_id: v.id("_storage"),
    // NEW in v2.0: Report text
    report_text: v.optional(v.string()),
  }).index("by_patient", ["patient_id"]),

  admissions: defineTable({
    patient_id: v.id("patients"),
    bed_id: v.id("beds"),
    doctor_id: v.optional(v.id("users")),
    ward_id: v.optional(v.id("wards")),
    admitted_at: v.number(),
    discharged_at: v.optional(v.number()),
    admission_type: v.optional(v.union(
      v.literal("emergency"),
      v.literal("scheduled"),
      v.literal("transfer")
    )),
    status: v.union(v.literal("active"), v.literal("discharged")),
  })
    .index("by_patient", ["patient_id"])
    .index("by_bed", ["bed_id"])
    .index("by_status", ["status"])
    .index("by_ward", ["ward_id"]),

  vitals: defineTable({
    patient_id: v.id("patients"),
    recorded_by: v.id("users"),
    recorded_at: v.number(),
    systolic_bp: v.optional(v.number()),
    diastolic_bp: v.optional(v.number()),
    heart_rate: v.optional(v.number()),
    temperature: v.optional(v.number()),
    spo2: v.optional(v.number()),
    respiratory_rate: v.optional(v.number()),
    weight: v.optional(v.number()),
    // NEW in v2.0: Blood glucose for diabetic monitoring
    blood_glucose: v.optional(v.number()),
    // NEW in v2.0: Role of person recording
    recorded_by_role: v.optional(v.union(
      v.literal("medecin_etat"),
      v.literal("private_doctor"),
      v.literal("medical_staff")
    )),
  })
    .index("by_patient", ["patient_id"])
    .index("by_recorded_at", ["recorded_at"]),

  case_entries: defineTable({
    ward_id: v.id("wards"),
    actor_id: v.id("users"),
    timestamp: v.number(),
    entry_type: v.union(
      v.literal("shift_start"),
      v.literal("shift_end"),
      v.literal("admission"),
      v.literal("discharge"),
      v.literal("bed_transfer"),
      v.literal("escalation"),
      v.literal("observation"),
      v.literal("nursing_note"),
      v.literal("procedure"),
      v.literal("general"),
      // NEW in v2.0: Identity gate logging
      v.literal("identity_gate_opened"),
      // NEW in v2.0: Shift handover
      v.literal("shift_handover"),
      // NEW in v2.0: Supply request
      v.literal("supply_request"),
      // NEW in v2.0: Escalation acknowledgement
      v.literal("escalation_acknowledged")
    ),
    notes: v.optional(v.string()),
    patient_id: v.optional(v.id("patients")),
    // NEW in v2.0: For escalations, track acknowledgment
    escalation_acknowledged_by: v.optional(v.id("users")),
    escalation_acknowledged_at: v.optional(v.number()),
  })
    .index("by_actor", ["actor_id"])
    .index("by_ward", ["ward_id"])
    .index("by_type", ["entry_type"]),

  dispense_records: defineTable({
    prescription_id: v.id("prescriptions"),
    pharmacist_id: v.id("users"),
    dispensed_at: v.number(),
    notes: v.optional(v.string()),
    // NEW in v2.0: Partial dispense tracking
    is_partial: v.optional(v.boolean()),
    dispensed_items: v.optional(v.array(v.object({
      name: v.string(),
      quantity_dispensed: v.number(),
    }))),
    // NEW in v2.0: Controlled substance double-log
    is_controlled_substance: v.optional(v.boolean()),
    controlled_reason: v.optional(v.string()),
  })
    .index("by_prescription", ["prescription_id"])
    .index("by_pharmacist", ["pharmacist_id"]),

  patient_documents: defineTable({
    patient_id: v.id("patients"),
    uploaded_by: v.optional(v.id("users")),
    uploaded_at: v.number(),
    document_type: v.union(
      v.literal("medical_report"),
      v.literal("lab_result"),
      v.literal("imaging_report"),
      v.literal("prescription_scan"),
      v.literal("insurance"),
      v.literal("id_document"),
      v.literal("referral"),
      v.literal("other")
    ),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    storage_id: v.id("_storage"),
    file_name: v.string(),
    file_type: v.string(),
    file_size: v.number(),
    extracted_data: v.optional(v.any()),
    status: v.optional(v.union(v.literal("pending"), v.literal("processed"), v.literal("reviewed"))),
  })
    .index("by_patient", ["patient_id"])
    .index("by_type", ["document_type"])
    .index("by_status", ["status"]),

  // NEW in v2.0: Notifications table for bell alerts
  notifications: defineTable({
    recipient_id: v.id("users"),
    sender_id: v.optional(v.id("users")),
    patient_id: v.optional(v.id("patients")),
    notification_type: v.union(
      v.literal("lab_result_arrived"),
      v.literal("prescription_written"),
      v.literal("signal_flag"),
      v.literal("escalation"),
      v.literal("discharge"),
      v.literal("appointment_reminder")
    ),
    title: v.string(),
    message: v.string(),
    is_read: v.optional(v.boolean()),
    created_at: v.number(),
    // For escalation - requires explicit ack
    requires_acknowledgment: v.optional(v.boolean()),
    acknowledged_at: v.optional(v.number()),
  })
    .index("by_recipient", ["recipient_id"])
    .index("by_patient", ["patient_id"])
    .index("by_is_read", ["is_read"]),

  // NEW in v2.0: Signal flags from doctors during patient-present sessions
  signal_flags: defineTable({
    patient_id: v.id("patients"),
    doctor_id: v.id("users"),
    flag_type: v.union(
      v.literal("alert"),
      v.literal("recommendation"),
      v.literal("observation")
    ),
    note: v.string(),
    created_at: v.number(),
    // Anonymised for display to other doctors
  })
    .index("by_patient", ["patient_id"])
    .index("by_doctor", ["doctor_id"]),

  // NEW in v2.0: Billing records for Administration role
  billing_records: defineTable({
    patient_id: v.id("patients"),
    admission_id: v.optional(v.id("admissions")),
    billing_date: v.number(),
    service_category: v.union(
      v.literal("consultation"),
      v.literal("lab"),
      v.literal("imaging"),
      v.literal("bed_day"),
      v.literal("pharmacy"),
      v.literal("other")
    ),
    amount: v.number(),
    payment_status: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("waived")
    ),
    created_by: v.id("users"),
  })
    .index("by_patient", ["patient_id"])
    .index("by_admission", ["admission_id"])
    .index("by_payment_status", ["payment_status"]),

  // NEW in v2.0: Consultation templates for doctors
  consultation_templates: defineTable({
    doctor_id: v.id("users"),
    name: v.string(),
    speciality: v.optional(v.string()),
    condition_type: v.optional(v.string()),
    template_content: v.string(),
    icd_code: v.optional(v.string()),
    default_treatment: v.optional(v.string()),
  })
    .index("by_doctor", ["doctor_id"]),

  // NEW in v2.0: Biometric session tracking
  biometric_sessions: defineTable({
    patient_id: v.id("patients"),
    professional_id: v.id("users"),
    session_token: v.string(),
    created_at: v.number(),
    expires_at: v.number(),
    is_valid: v.boolean(),
    // Audit log entry reference
    case_entry_id: v.optional(v.id("case_entries")),
  })
    .index("by_patient", ["patient_id"])
    .index("by_professional", ["professional_id"])
    .index("by_token", ["session_token"]),

  // NEW in v2.0: Supply request log for staff
  supply_requests: defineTable({
    ward_id: v.id("wards"),
    requested_by: v.id("users"),
    item_name: v.string(),
    quantity: v.number(),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(v.literal("pending"), v.literal("fulfilled"), v.literal("rejected")),
    created_at: v.number(),
    fulfilled_at: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_ward", ["ward_id"])
    .index("by_status", ["status"]),

  // NEW in v2.0: Shift handover notes
  shift_handovers: defineTable({
    ward_id: v.id("wards"),
    outgoing_doctor_id: v.id("users"),
    incoming_doctor_id: v.optional(v.id("users")),
    patient_id: v.optional(v.id("patients")),
    notes: v.string(),
    created_at: v.number(),
    is_read: v.optional(v.boolean()),
  })
    .index("by_ward", ["ward_id"])
    .index("by_patient", ["patient_id"]),

  // NEW in v2.0: Referrals
  referrals: defineTable({
    patient_id: v.id("patients"),
    from_doctor_id: v.id("users"),
    to_speciality_id: v.optional(v.id("specialities")),
    to_doctor_id: v.optional(v.id("users")),
    referral_letter: v.string(),
    created_at: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("completed")),
  })
    .index("by_patient", ["patient_id"])
    .index("by_from_doctor", ["from_doctor_id"]),
});