"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button } from "@heroui/react";
import { HeartPulse, Send } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface VitalsEntryFormProps {
  patientId: Id<"patients">;
  patientName: string;
  betterAuthId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VitalsEntryForm({ patientId, patientName, betterAuthId, onSuccess, onCancel }: VitalsEntryFormProps) {
  const recordVitals = useMutation(api.vitals.recordVitals);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await recordVitals({
        betterAuthId,
        patient_id: patientId,
        systolic_bp: systolic ? Number(systolic) : undefined,
        diastolic_bp: diastolic ? Number(diastolic) : undefined,
        heart_rate: heartRate ? Number(heartRate) : undefined,
        temperature: temperature ? Number(temperature) : undefined,
        spo2: spo2 ? Number(spo2) : undefined,
        respiratory_rate: respiratoryRate ? Number(respiratoryRate) : undefined,
        weight: weight ? Number(weight) : undefined,
      });
      onSuccess?.();
    } catch (e: unknown) {
      const error = e as Error;
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const vitalsFields = [
    { label: "Systolic BP", unit: "mmHg", value: systolic, set: setSystolic, normal: "90-120" },
    { label: "Diastolic BP", unit: "mmHg", value: diastolic, set: setDiastolic, normal: "60-80" },
    { label: "Heart Rate", unit: "bpm", value: heartRate, set: setHeartRate, normal: "60-100" },
    { label: "Temperature", unit: "°C", value: temperature, set: setTemperature, normal: "36.1-37.2" },
    { label: "SpO₂", unit: "%", value: spo2, set: setSpo2, normal: "95-100" },
    { label: "Resp. Rate", unit: "/min", value: respiratoryRate, set: setRespiratoryRate, normal: "12-20" },
    { label: "Weight", unit: "kg", value: weight, set: setWeight, normal: "—" },
  ];

  return (
    <Card className="border border-slate-200 shadow-lg">
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
            <HeartPulse size={18} className="text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Record Vitals</h3>
            <p className="text-xs text-slate-500 font-medium">For {patientName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {vitalsFields.map((f) => (
            <div key={f.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {f.label}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="any"
                  placeholder="—"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white text-lg font-bold font-mono text-slate-900 focus:border-rose-500 outline-none"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                {f.unit} · Normal: {f.normal}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button variant="ghost" className="font-bold" onPress={onCancel}>Cancel</Button>
          )}
          <Button
            className="font-bold bg-rose-600 text-white shadow-md shadow-rose-200"
            onPress={handleSubmit}
            isDisabled={saving}
          >
            <Send size={14} /> {saving ? "Recording..." : "Record Vitals"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
