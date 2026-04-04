"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button } from "@heroui/react";
import { FileText, Send } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

interface CompteRenduFormProps {
  patient: Doc<"patients">;
  betterAuthId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CompteRenduForm({ patient, betterAuthId, onSuccess, onCancel }: CompteRenduFormProps) {
  const createCR = useMutation(api.compteRendus.create);
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!contentHtml.trim()) {
      alert("Clinical report content is required.");
      return;
    }
    setSaving(true);
    try {
      await createCR({
        betterAuthId,
        patient_id: patient._id,
        diagnosis_code: diagnosisCode || undefined,
        symptoms: symptoms || undefined,
        treatment_plan: treatmentPlan || undefined,
        follow_up: followUp || undefined,
        content_html: contentHtml,
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
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">
              Compte Rendu
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Clinical report for {patient.first_name} {patient.last_name} — immutable after save
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              ICD-10 Diagnosis Code
            </label>
            <input
              placeholder="e.g. I21.0"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              value={diagnosisCode}
              onChange={(e) => setDiagnosisCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Follow-up Date
            </label>
            <input
              type="date"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Symptoms
          </label>
          <textarea
            rows={3}
            placeholder="Describe presenting symptoms..."
            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none resize-none"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Treatment Plan
          </label>
          <textarea
            rows={3}
            placeholder="Treatment plan and recommendations..."
            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none resize-none"
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Full Clinical Report *
          </label>
          <textarea
            rows={6}
            placeholder="Complete clinical narrative..."
            className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button variant="ghost" className="font-bold" onPress={onCancel}>Cancel</Button>
          )}
          <Button
            className="font-bold bg-indigo-600 text-white shadow-md shadow-indigo-200"
            onPress={handleSubmit}
            isDisabled={saving}
          >
            <Send size={14} /> {saving ? "Saving..." : "Submit Report (Immutable)"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
