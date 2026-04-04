"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button } from "@heroui/react";
import { Beaker, Send } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

interface LabOrderFormProps {
  patient: Doc<"patients">;
  betterAuthId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ANALYSIS_TYPES = [
  "Complete Blood Count (CBC)",
  "Basic Metabolic Panel (BMP)",
  "Liver Function Tests (LFT)",
  "Lipid Panel",
  "HbA1c",
  "Thyroid Panel (TSH/T3/T4)",
  "Urinalysis",
  "Coagulation Panel (PT/INR)",
  "Blood Glucose (Fasting)",
  "Renal Function Panel",
  "Iron Studies",
  "C-Reactive Protein (CRP)",
  "Electrolytes Panel",
  "Vitamin D Level",
  "Custom Panel",
];

export function LabOrderForm({ patient, betterAuthId, onSuccess, onCancel }: LabOrderFormProps) {
  const createOrder = useMutation(api.labOrders.createOrder);
  const [analysisType, setAnalysisType] = useState(ANALYSIS_TYPES[0]);
  const [urgency, setUrgency] = useState<"routine" | "urgent" | "stat">("routine");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createOrder({
        betterAuthId,
        patient_id: patient._id,
        analysis_type: analysisType,
        urgency,
        clinical_notes: clinicalNotes || undefined,
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
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Beaker size={18} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">
              Lab Order
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              For {patient.first_name} {patient.last_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Analysis Type
            </label>
            <select
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-violet-500 outline-none"
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
            >
              {ANALYSIS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Urgency
            </label>
            <div className="flex gap-2">
              {(["routine", "urgent", "stat"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 p-3 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all ${
                    urgency === u
                      ? u === "stat"
                        ? "bg-red-600 text-white border-red-600"
                        : u === "urgent"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Clinical Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Additional notes for the lab team..."
            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-violet-500 focus:ring-1 focus:ring-violet-100 outline-none resize-none"
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button variant="ghost" className="font-bold" onPress={onCancel}>Cancel</Button>
          )}
          <Button
            className="font-bold bg-violet-600 text-white shadow-md shadow-violet-200"
            onPress={handleSubmit}
            isDisabled={saving}
          >
            <Send size={14} /> {saving ? "Submitting..." : "Submit Lab Order"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
