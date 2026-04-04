"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button } from "@heroui/react";
import { FlaskConical, Send } from "lucide-react";

interface LabResultEntryFormProps {
  orderId: string;
  analysisType: string;
  patientName: string;
  betterAuthId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onCriticalAlert?: (patientName: string, analysisType: string, values: string) => void;
}

// Reference ranges by analysis type
const PANEL_FIELDS: Record<string, Array<{ key: string; label: string; unit: string; refRange: string }>> = {
  "Complete Blood Count (CBC)": [
    { key: "wbc", label: "WBC", unit: "×10³/µL", refRange: "4.5-11.0" },
    { key: "rbc", label: "RBC", unit: "×10⁶/µL", refRange: "4.5-5.5" },
    { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL", refRange: "12.0-17.5" },
    { key: "hematocrit", label: "Hematocrit", unit: "%", refRange: "36-50" },
    { key: "platelets", label: "Platelets", unit: "×10³/µL", refRange: "150-400" },
  ],
  "Basic Metabolic Panel (BMP)": [
    { key: "glucose", label: "Glucose", unit: "mg/dL", refRange: "70-100" },
    { key: "bun", label: "BUN", unit: "mg/dL", refRange: "7-20" },
    { key: "creatinine", label: "Creatinine", unit: "mg/dL", refRange: "0.7-1.3" },
    { key: "sodium", label: "Sodium", unit: "mEq/L", refRange: "136-145" },
    { key: "potassium", label: "Potassium", unit: "mEq/L", refRange: "3.5-5.0" },
    { key: "calcium", label: "Calcium", unit: "mg/dL", refRange: "8.5-10.5" },
  ],
  "Lipid Panel": [
    { key: "total_chol", label: "Total Cholesterol", unit: "mg/dL", refRange: "<200" },
    { key: "ldl", label: "LDL", unit: "mg/dL", refRange: "<100" },
    { key: "hdl", label: "HDL", unit: "mg/dL", refRange: ">40" },
    { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", refRange: "<150" },
  ],
  "HbA1c": [
    { key: "hba1c", label: "HbA1c", unit: "%", refRange: "<5.7" },
  ],
};

// Default fields for panels not explicitly mapped
const DEFAULT_FIELDS = [
  { key: "result_1", label: "Result 1", unit: "", refRange: "—" },
  { key: "result_2", label: "Result 2", unit: "", refRange: "—" },
  { key: "result_3", label: "Result 3", unit: "", refRange: "—" },
];

export function LabResultEntryForm({
  orderId,
  analysisType,
  patientName,
  betterAuthId,
  onSuccess,
  onCancel,
  onCriticalAlert,
}: LabResultEntryFormProps) {
  const uploadResult = useMutation(api.labResults.uploadResult);
  const fields = PANEL_FIELDS[analysisType] || DEFAULT_FIELDS;
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    // Convert string values to numbers
    const numericValues: Record<string, number | null> = {};
    const criticalValues: string[] = [];
    for (const f of fields) {
      const v = values[f.key];
      numericValues[f.key] = v ? Number(v) : null;
      // Check for critical values (simplified thresholds)
      if (v) {
        const num = Number(v);
        const refParts = f.refRange.replace(/[<>]/g, "").split("-").map(Number);
        if (refParts.length === 2 && !isNaN(refParts[0]) && !isNaN(refParts[1])) {
          if (num < refParts[0] * 0.7 || num > refParts[1] * 1.3) {
            criticalValues.push(`${f.label}: ${v} ${f.unit} (ref: ${f.refRange})`);
          }
        }
      }
    }

    // Fire critical value alert if any detected
    if (criticalValues.length > 0 && onCriticalAlert) {
      onCriticalAlert(patientName, analysisType, criticalValues.join("; "));
    }

    setSaving(true);
    try {
      await uploadResult({
        betterAuthId,
        order_id: orderId as any,
        values: numericValues,
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
            <FlaskConical size={18} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Enter Results</h3>
            <p className="text-xs text-slate-500 font-medium">{analysisType} — {patientName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {f.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="—"
                  className="flex-1 p-2 rounded-lg border border-slate-200 bg-white text-lg font-bold font-mono text-slate-900 focus:border-violet-500 outline-none"
                  value={values[f.key] || ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                />
                <span className="text-xs text-slate-500 font-medium shrink-0">{f.unit}</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                Ref: {f.refRange}
              </span>
            </div>
          ))}
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
            <Send size={14} /> {saving ? "Uploading..." : "Submit Results"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
