"use client";

import { AlertTriangle, User, Heart, Droplets, Activity, Thermometer, Wind, Weight } from "lucide-react";
import { Chip, Spinner } from "@heroui/react";
import { Doc } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface PatientHeaderBarProps {
  patient: Doc<"patients">;
  onClose?: () => void;
}

// Clinical normal ranges for vital status assessment
const VITAL_RANGES = {
  systolic_bp: { normal: [90, 120], warning: [120, 140], critical_high: 180, critical_low: 70 },
  diastolic_bp: { normal: [60, 80], warning: [80, 90], critical_high: 120, critical_low: 40 },
  heart_rate: { normal: [60, 100], warning: [100, 120], critical_high: 150, critical_low: 40 },
  temperature: { normal: [36.1, 37.2], warning: [37.2, 38.5], critical_high: 40, critical_low: 35 },
  spo2: { normal: [95, 100], warning: [90, 95], critical_high: 100, critical_low: 85 },
  respiratory_rate: { normal: [12, 20], warning: [20, 30], critical_high: 35, critical_low: 8 },
};

function getVitalStatus(key: string, value: number): "critical" | "warning" | "normal" {
  const range = VITAL_RANGES[key as keyof typeof VITAL_RANGES];
  if (!range) return "normal";

  if (key === "spo2" || key === "respiratory_rate") {
    // For these, lower is worse
    if (value <= range.critical_low || value >= range.critical_high) return "critical";
    if (value < range.normal[0] || value > range.warning[1]) return "warning";
    return "normal";
  }

  if (value <= range.critical_low || value >= range.critical_high) return "critical";
  if (value < range.normal[0] || value > range.warning[1]) return "warning";
  return "normal";
}

function getVitalColor(status: "critical" | "warning" | "normal"): string {
  switch (status) {
    case "critical": return "text-rose-600 bg-rose-50 border-rose-200";
    case "warning": return "text-amber-600 bg-amber-50 border-amber-200";
    case "normal": return "text-emerald-600 bg-emerald-50 border-emerald-200";
  }
}

function VitalBadge({ icon: Icon, label, value, unit }: { icon: React.ElementType; label: string; value: number; unit: string }) {
  const status = getVitalStatus(label.toLowerCase().replace(" ", "_"), value);
  const colorClass = getVitalColor(status);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${colorClass}`}>
      <Icon size={14} className="shrink-0" />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
        <div className="text-sm font-black font-mono">{value}{unit}</div>
      </div>
      {status === "critical" && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" />}
    </div>
  );
}

export function PatientHeaderBar({ patient, onClose }: PatientHeaderBarProps) {
  const hasAllergies = patient.allergies && patient.allergies.length > 0;
  const latestVitals = useQuery(api.vitals.getLatestForPatient, patient?._id ? { patient_id: patient._id } : "skip");

  return (
    <div className={`rounded-2xl border p-4 mb-6 transition-all ${hasAllergies ? "bg-gradient-to-r from-rose-50 to-white border-rose-200" : "bg-gradient-to-r from-blue-50 to-white border-blue-200"}`}>
      <div className="flex flex-col gap-4">
        {/* Top Row: Patient Info */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasAllergies ? "bg-rose-100" : "bg-blue-100"}`}>
              <User size={20} className={hasAllergies ? "text-rose-600" : "text-blue-600"} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {patient.first_name} {patient.last_name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500 font-medium">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700">
                  {patient.national_id}
                </span>
                <span className="text-slate-300">•</span>
                <span>DOB: {patient.dob}</span>
                {patient.blood_type && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Droplets size={12} className="text-red-400" />
                      {patient.blood_type}
                    </span>
                  </>
                )}
                {patient.wilaya && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{patient.wilaya}</span>
                  </>
                )}
                {patient.phone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{patient.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasAllergies && (
              <div className="flex items-center gap-2 bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <div className="flex gap-1 flex-wrap">
                  {patient.allergies!.map((a) => (
                    <Chip
                      key={a}
                      size="sm"
                      color="danger"
                      className="font-black text-[9px] uppercase tracking-widest"
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            {!hasAllergies && (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <Heart size={14} className="text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">No Known Allergies</span>
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 text-sm font-bold"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Vitals Strip */}
        {latestVitals ? (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Vitals</span>
              <span className="text-[10px] font-mono text-slate-400 ml-auto">
                {new Date(latestVitals.recorded_at).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {latestVitals.systolic_bp && latestVitals.diastolic_bp && (
                <VitalBadge icon={Heart} label="BP" value={latestVitals.systolic_bp} unit={`/${latestVitals.diastolic_bp}`} />
              )}
              {latestVitals.heart_rate && (
                <VitalBadge icon={Activity} label="HR" value={latestVitals.heart_rate} unit=" bpm" />
              )}
              {latestVitals.temperature && (
                <VitalBadge icon={Thermometer} label="Temp" value={latestVitals.temperature} unit="°C" />
              )}
              {latestVitals.spo2 && (
                <VitalBadge icon={Droplets} label="SpO2" value={latestVitals.spo2} unit="%" />
              )}
              {latestVitals.respiratory_rate && (
                <VitalBadge icon={Wind} label="RR" value={latestVitals.respiratory_rate} unit=" /min" />
              )}
              {latestVitals.weight && (
                <VitalBadge icon={Weight} label="Weight" value={latestVitals.weight} unit=" kg" />
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-xs font-medium text-slate-400">Loading vitals...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}