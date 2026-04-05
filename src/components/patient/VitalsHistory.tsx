"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Activity, Heart, Thermometer, Droplets, Wind, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, Chip, Spinner } from "@heroui/react";

interface VitalsHistoryProps {
  patientId: Id<"patients">;
}

const VITAL_RANGES = {
  systolic_bp: { normal: [90, 120] as [number, number], label: "BP Systolic", unit: " mmHg", icon: Heart },
  diastolic_bp: { normal: [60, 80] as [number, number], label: "BP Diastolic", unit: " mmHg", icon: Heart },
  heart_rate: { normal: [60, 100] as [number, number], label: "Heart Rate", unit: " bpm", icon: Activity },
  temperature: { normal: [36.1, 37.2] as [number, number], label: "Temperature", unit: "°C", icon: Thermometer },
  spo2: { normal: [95, 100] as [number, number], label: "SpO2", unit: "%", icon: Droplets },
  respiratory_rate: { normal: [12, 20] as [number, number], label: "Respiratory Rate", unit: " /min", icon: Wind },
};

function getVitalStatus(value: number, normalRange: [number, number]): string {
  if (value < normalRange[0] || value > normalRange[1] + 20) return "text-rose-600 bg-rose-50";
  if (value < normalRange[0] + 5 || value > normalRange[1]) return "text-amber-600 bg-amber-50";
  return "text-emerald-600 bg-emerald-50";
}

export function VitalsHistory({ patientId }: VitalsHistoryProps) {
  const vitals = useQuery(api.vitals.listByPatient, patientId ? { patient_id: patientId } : "skip");

  if (vitals === undefined) {
    return (
      <div className="flex items-center gap-2 p-6">
        <Spinner size="sm" />
        <span className="text-sm font-medium text-slate-400">Loading vitals history...</span>
      </div>
    );
  }

  const sortedVitals = [...vitals].sort((a, b) => b.recorded_at - a.recorded_at).slice(0, 10);

  if (sortedVitals.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        No vitals recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedVitals.map((vital) => (
        <div key={vital._id} className="border border-slate-100 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-700">
                {new Date(vital.recorded_at).toLocaleDateString()} {new Date(vital.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vital.systolic_bp && vital.diastolic_bp && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getVitalStatus(vital.systolic_bp, VITAL_RANGES.systolic_bp.normal)}`}>
                <Heart size={14} />
                <div>
                  <div className="text-[10px] font-bold uppercase opacity-70">BP</div>
                  <div className="text-sm font-black font-mono">{vital.systolic_bp}/{vital.diastolic_bp} mmHg</div>
                </div>
              </div>
            )}
            {vital.heart_rate && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getVitalStatus(vital.heart_rate, VITAL_RANGES.heart_rate.normal)}`}>
                <Activity size={14} />
                <div>
                  <div className="text-[10px] font-bold uppercase opacity-70">HR</div>
                  <div className="text-sm font-black font-mono">{vital.heart_rate} bpm</div>
                </div>
              </div>
            )}
            {vital.temperature && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getVitalStatus(vital.temperature, VITAL_RANGES.temperature.normal)}`}>
                <Thermometer size={14} />
                <div>
                  <div className="text-[10px] font-bold uppercase opacity-70">Temp</div>
                  <div className="text-sm font-black font-mono">{vital.temperature}°C</div>
                </div>
              </div>
            )}
            {vital.spo2 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getVitalStatus(vital.spo2, VITAL_RANGES.spo2.normal)}`}>
                <Droplets size={14} />
                <div>
                  <div className="text-[10px] font-bold uppercase opacity-70">SpO2</div>
                  <div className="text-sm font-black font-mono">{vital.spo2}%</div>
                </div>
              </div>
            )}
            {vital.respiratory_rate && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getVitalStatus(vital.respiratory_rate, VITAL_RANGES.respiratory_rate.normal)}`}>
                <Wind size={14} />
                <div>
                  <div className="text-[10px] font-bold uppercase opacity-70">RR</div>
                  <div className="text-sm font-black font-mono">{vital.respiratory_rate}/min</div>
                </div>
              </div>
            )}
            {vital.weight && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 bg-blue-50`}>
                <Wind size={14} />
                <div>
                  <div className="text-[10px] font-bold uppercase opacity-70">Weight</div>
                  <div className="text-sm font-black font-mono">{vital.weight} kg</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
