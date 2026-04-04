"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip } from "@heroui/react";
import { Pill, Plus, Trash2, AlertTriangle, Send } from "lucide-react";
import { Id, Doc } from "../../../convex/_generated/dataModel";

interface MedicationLine {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  route: string;
}

interface PrescriptionFormProps {
  patient: Doc<"patients">;
  betterAuthId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PrescriptionForm({ patient, betterAuthId, onSuccess, onCancel }: PrescriptionFormProps) {
  const createPrescription = useMutation(api.prescriptions.create);
  const [medications, setMedications] = useState<MedicationLine[]>([
    { name: "", dose: "", frequency: "", duration: "", route: "oral" },
  ]);
  const [saving, setSaving] = useState(false);
  const [allergyWarning, setAllergyWarning] = useState<string | null>(null);

  const hasAllergies = patient.allergies && patient.allergies.length > 0;

  const addLine = () => {
    setMedications([...medications, { name: "", dose: "", frequency: "", duration: "", route: "oral" }]);
  };

  const removeLine = (idx: number) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof MedicationLine, value: string) => {
    const updated = [...medications];
    updated[idx] = { ...updated[idx], [field]: value };
    setMedications(updated);

    // Check allergy conflict on name change
    if (field === "name" && hasAllergies) {
      const allergiesLower = patient.allergies!.join(" ").toLowerCase();
      if (value && allergiesLower.includes(value.toLowerCase())) {
        setAllergyWarning(`⚠ CONFLICT: "${value}" may conflict with patient allergy: ${patient.allergies!.join(", ")}`);
      } else {
        setAllergyWarning(null);
      }
    }
  };

  const handleSubmit = async () => {
    const valid = medications.every((m) => m.name && m.dose && m.frequency && m.duration);
    if (!valid) {
      alert("All medication fields are required.");
      return;
    }
    setSaving(true);
    try {
      await createPrescription({
        betterAuthId,
        patient_id: patient._id,
        medications: medications.map((m) => ({
          name: m.name,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          route: m.route,
        })),
      });
      onSuccess?.();
    } catch (e: unknown) {
      const error = e as Error;
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-slate-200 shadow-lg">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Pill size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">
              New Prescription
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              For {patient.first_name} {patient.last_name}
            </p>
          </div>
        </div>

        {/* Allergy Banner */}
        {hasAllergies && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-rose-900 text-sm">Known Allergies</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {patient.allergies!.map((a) => (
                  <Chip key={a} size="sm" color="danger" className="text-[9px] font-black uppercase tracking-widest">
                    {a}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {allergyWarning && (
          <div className="bg-red-600 text-white p-4 rounded-xl font-bold text-sm animate-pulse">
            {allergyWarning}
          </div>
        )}

        {/* Medication Lines */}
        <div className="space-y-4">
          {medications.map((med, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Line {idx + 1}
                </span>
                {medications.length > 1 && (
                  <button onClick={() => removeLine(idx)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  placeholder="Drug name *"
                  className="col-span-2 md:col-span-1 p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  value={med.name}
                  onChange={(e) => updateLine(idx, "name", e.target.value)}
                />
                <input
                  placeholder="Dose (e.g. 500mg) *"
                  className="p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  value={med.dose}
                  onChange={(e) => updateLine(idx, "dose", e.target.value)}
                />
                <input
                  placeholder="Frequency (e.g. 2x/day) *"
                  className="p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  value={med.frequency}
                  onChange={(e) => updateLine(idx, "frequency", e.target.value)}
                />
                <input
                  placeholder="Duration (e.g. 7 days) *"
                  className="p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  value={med.duration}
                  onChange={(e) => updateLine(idx, "duration", e.target.value)}
                />
                <select
                  className="p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 outline-none"
                  value={med.route}
                  onChange={(e) => updateLine(idx, "route", e.target.value)}
                >
                  <option value="oral">Oral</option>
                  <option value="iv">Intravenous</option>
                  <option value="im">Intramuscular</option>
                  <option value="sc">Subcutaneous</option>
                  <option value="topical">Topical</option>
                  <option value="inhaled">Inhaled</option>
                  <option value="rectal">Rectal</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <Button variant="ghost" className="font-bold text-blue-600" onPress={addLine}>
          <Plus size={14} /> Add Medication Line
        </Button>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button variant="ghost" className="font-bold" onPress={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200"
            onPress={handleSubmit}
            isDisabled={saving}
          >
            <Send size={14} /> {saving ? "Saving..." : "Submit Prescription"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
