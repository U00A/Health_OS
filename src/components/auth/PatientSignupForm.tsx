"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  User,
  Heart,
  Droplet,
  Phone,
  MapPin,
  AlertTriangle,
  Activity,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileText,
} from "lucide-react";

interface PatientSignupFormProps {
  authId: string;
  defaultEmail?: string;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const commonAllergies = [
  "Penicillin",
  "Aspirin",
  "Sulfa Drugs",
  "Peanuts",
  "Shellfish",
  "Latex",
  "Bee Stings",
  "Eggs",
  "Milk",
  "Soy",
  "Wheat",
  "Tree Nuts",
];
const commonConditions = [
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Thyroid Disorder",
  "Epilepsy",
  "Depression",
  "Anxiety",
  "Arthritis",
  "COPD",
  "Kidney Disease",
];

export function PatientSignupForm({ authId }: PatientSignupFormProps) {
  const router = useRouter();
  const selfRegister = useMutation(api.patients.selfRegister);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Personal Information
  const [nationalId, setNationalId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");

  // Step 2: Medical Information
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [customCondition, setCustomCondition] = useState("");

  // Step 3: Contact & Location
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const toggleCondition = (condition: string) => {
    setConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies((prev) => [...prev, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !conditions.includes(customCondition.trim())) {
      setConditions((prev) => [...prev, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  const canProceedStep1 = nationalId && firstName && lastName && dob && sex;
  const canProceedStep3 = phone && wilaya;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);

      try {
        await selfRegister({
          betterAuthId: authId,
          national_id: nationalId,
          first_name: firstName,
          last_name: lastName,
          dob,
          sex: sex as "male" | "female" | undefined,
          blood_type: bloodType || undefined,
          phone,
          wilaya,
          commune: commune || undefined,
          allergies: allergies.length > 0 ? allergies : undefined,
          emergency_contact: emergencyContact || undefined,
          existing_conditions: conditions.length > 0 ? conditions : undefined,
        });

        setSuccess("Patient profile created successfully! Redirecting to your dashboard...");
        setTimeout(() => router.push("/patient-portal"), 2000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create patient profile.";
        setError(message);
        setIsLoading(false);
      }
    },
    [
      selfRegister,
      authId,
      nationalId,
      firstName,
      lastName,
      dob,
      sex,
      bloodType,
      phone,
      wilaya,
      commune,
      allergies,
      emergencyContact,
      conditions,
      router,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Step {step} of 3
          </span>
          <span className="text-xs font-bold text-blue-600">
            {step === 1 ? "Personal Info" : step === 2 ? "Medical Info" : "Contact Details"}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <p className="text-sm text-slate-500">Let's start with your basic details</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                National ID Number *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                  placeholder="Enter your national ID"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sex *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSex("male")}
                  className={`h-12 rounded-xl border-2 font-semibold transition-all ${
                    sex === "male"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex("female")}
                  className={`h-12 rounded-xl border-2 font-semibold transition-all ${
                    sex === "female"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Medical Information */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Medical Information</h2>
            <p className="text-sm text-slate-500">Help us provide better care (optional but recommended)</p>
          </div>

          <div className="space-y-6">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-500" />
                Blood Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bloodTypes.map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setBloodType(bt)}
                    className={`h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                      bloodType === bt
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Allergies
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonAllergies.map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      allergies.includes(allergy)
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAllergy())}
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                  placeholder="Add custom allergy..."
                />
                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="px-4 h-10 bg-slate-100 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>
              {allergies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {allergies.map((a) => (
                    <span
                      key={a}
                      className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold"
                    >
                      {a} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Conditions */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Existing Medical Conditions
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonConditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => toggleCondition(condition)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      conditions.includes(condition)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCondition())}
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                  placeholder="Add custom condition..."
                />
                <button
                  type="button"
                  onClick={addCustomCondition}
                  className="px-4 h-10 bg-slate-100 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>
              {conditions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {conditions.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                    >
                      {c} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Contact & Location */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
              <Phone className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Contact Details</h2>
            <p className="text-sm text-slate-500">How can we reach you?</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                  placeholder="0XXX XXX XXX"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Wilaya *
                </label>
                <input
                  type="text"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Your wilaya"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Commune</label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Your commune (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Emergency Contact
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                  placeholder="Emergency contact number"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Phone number of a family member or close friend
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 mt-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 1 && !canProceedStep1) return;
              if (step === 2 && !canProceedStep3) return;
              setStep(step + 1);
            }}
            disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep3)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading || !canProceedStep3}
            className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Registration
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}