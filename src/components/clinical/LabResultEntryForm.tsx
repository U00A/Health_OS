"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip } from "@heroui/react";
import { FlaskConical, Send, AlertTriangle, AlertCircle } from "lucide-react";

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

  // Real-time critical value detection
  const detectedCriticals = fields.map(f => {
    const v = values[f.key];
    if (!v) return null;
    const num = Number(v);
    const refParts = f.refRange.replace(/[<>]/g, "").split("-").map(Number);
    
    if (refParts.length === 2 && !isNaN(refParts[0]) && !isNaN(refParts[1])) {
      // Logic: 30% deviance from range is critical
      if (num < refParts[0] * 0.7 || num > refParts[1] * 1.3) {
        return { field: f.label, value: num, threshold: num < refParts[0] ? refParts[0] : refParts[1], unit: f.unit, refRange: f.refRange };
      }
    } else if (f.refRange.startsWith("<")) {
      const threshold = Number(f.refRange.substring(1));
      if (num > threshold * 1.5) return { field: f.label, value: num, threshold, unit: f.unit, refRange: f.refRange };
    } else if (f.refRange.startsWith(">")) {
      const threshold = Number(f.refRange.substring(1));
      if (num < threshold * 0.5) return { field: f.label, value: num, threshold, unit: f.unit, refRange: f.refRange };
    }
    return null;
  }).filter(Boolean);

  const handleSubmit = async () => {
    // Convert string values to numbers
    const numericValues: Record<string, number | null> = {};
    const criticalPayload: Array<{ field: string, value: number, critical_threshold: number }> = [];

    for (const f of fields) {
      const v = values[f.key];
      numericValues[f.key] = v ? Number(v) : null;
    }

    detectedCriticals.forEach(c => {
      if (c) {
        criticalPayload.push({
          field: c.field,
          value: c.value,
          critical_threshold: c.threshold
        });
      }
    });

    // Fire critical value alert if any detected
    if (detectedCriticals.length > 0 && onCriticalAlert) {
      onCriticalAlert(patientName, analysisType, detectedCriticals.map(c => `${c?.field}: ${c?.value}`).join("; "));
    }

    setSaving(true);
    try {
      await uploadResult({
        betterAuthId,
        order_id: orderId as any,
        values: numericValues,
        critical_values: criticalPayload.length > 0 ? criticalPayload : undefined,
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
    <Card className={`border shadow-lg transition-colors duration-500 ${detectedCriticals.length > 0 ? "border-red-300 bg-red-50/10" : "border-slate-200"}`}>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${detectedCriticals.length > 0 ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"}`}>
              {detectedCriticals.length > 0 ? <AlertTriangle size={18} /> : <FlaskConical size={18} />}
            </div>
            <div>
              <h3 className={`font-bold text-lg tracking-tight ${detectedCriticals.length > 0 ? "text-red-700" : "text-slate-900"}`}>
                {detectedCriticals.length > 0 ? "Critical Results Detected" : "Enter Results"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{analysisType} — {patientName}</p>
            </div>
          </div>
          {detectedCriticals.length > 0 && (
            <Chip size="sm" color="danger" variant="shadow" className="font-black animate-pulse">
              CRITICAL
            </Chip>
          )}
        </div>

        {detectedCriticals.length > 0 && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <p className="font-bold mb-1">Warning: One or more values are outside the critical safety range.</p>
              <ul className="list-disc list-inside">
                {detectedCriticals.map((c, i) => (
                  <li key={i}>{c?.field}: {c?.value} {c?.unit} (Ref: {c?.refRange})</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((f) => {
            const isCritical = detectedCriticals.some(c => c?.field === f.label);
            return (
              <div key={f.key} className={`border rounded-xl p-3 transition-colors ${isCritical ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}`}>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isCritical ? "text-red-400" : "text-slate-400"}`}>
                  {f.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="—"
                    className={`flex-1 p-2 rounded-lg border bg-white text-lg font-bold font-mono outline-none ${isCritical ? "border-red-300 text-red-700 focus:border-red-500" : "border-slate-200 text-slate-900 focus:border-violet-500"}`}
                    value={values[f.key] || ""}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  />
                  <span className={`text-xs font-medium shrink-0 ${isCritical ? "text-red-500" : "text-slate-500"}`}>{f.unit}</span>
                </div>
                <span className={`text-[9px] font-medium mt-1 block ${isCritical ? "text-red-400" : "text-slate-400"}`}>
                  Ref: {f.refRange}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button variant="ghost" className="font-bold" onPress={onCancel}>Cancel</Button>
          )}
          <Button
            className={`font-bold shadow-md ${detectedCriticals.length > 0 ? "bg-red-600 text-white shadow-red-200" : "bg-violet-600 text-white shadow-violet-200"}`}
            onPress={handleSubmit}
            isDisabled={saving}
          >
            <Send size={14} /> {saving ? "Uploading..." : detectedCriticals.length > 0 ? "Submit & Alert Doctor" : "Submit Results"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
