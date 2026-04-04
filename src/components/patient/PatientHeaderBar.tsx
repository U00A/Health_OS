"use client";

import { AlertTriangle, User, Heart, Droplets } from "lucide-react";
import { Chip } from "@heroui/react";
import { Doc } from "../../../convex/_generated/dataModel";

interface PatientHeaderBarProps {
  patient: Doc<"patients">;
  onClose?: () => void;
}

export function PatientHeaderBar({ patient, onClose }: PatientHeaderBarProps) {
  const hasAllergies = patient.allergies && patient.allergies.length > 0;

  return (
    <div className={`rounded-2xl border p-4 mb-6 transition-all ${hasAllergies ? "bg-gradient-to-r from-rose-50 to-white border-rose-200" : "bg-gradient-to-r from-blue-50 to-white border-blue-200"}`}>
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
    </div>
  );
}
