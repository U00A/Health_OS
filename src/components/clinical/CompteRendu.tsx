"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { TipTapEditor } from "./TipTapEditor";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";

export function CompteRendu({ patientId }: { patientId: Id<"patients"> }) {
  const betterAuthId = useBetterAuthId();
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [plan, setPlan] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");

  const createRecord = useMutation(api.compte_rendus.create);

  const handleSave = async () => {
    if (!betterAuthId) return;
    setIsSubmitting(true);
    try {
      await createRecord({
        betterAuthId,
        patient_id: patientId,
        diagnosis_code: diagnosisCode,
        symptoms,
        treatment_plan: plan,
        follow_up: followUp,
        content_html: editorHtml,
      });
      setEditorHtml("");
      setSymptoms("");
      setPlan("");
      setFollowUp("");
      setDiagnosisCode("");
      alert("Compte Rendu saved successfully!");
    } catch (e) {
      const error = e as Error;
      alert("Failed to save: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">
          New Compte Rendu
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ICD-10 Diagnosis
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g. J01.90"
              value={diagnosisCode}
              onChange={(e) => setDiagnosisCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Follow-up timeline
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g. 2 weeks"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Symptoms summary
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Report (Immutable)
          </label>
          <TipTapEditor content="" onChange={setEditorHtml} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Treatment Plan
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border h-20"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Sign & Submit Record"}
        </button>
      </div>
    </div>
  );
}
