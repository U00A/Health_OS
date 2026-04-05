"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Calendar,
  FileText,
  Beaker,
  Pill,
  Activity,
  Stethoscope,
  Upload,
  Clock,
} from "lucide-react";

interface HealthTimelineProps {
  patientId: Id<"patients">;
}

type TimelineEvent = {
  id: string;
  date: number;
  type: "admission" | "cr" | "lab" | "prescription" | "vitals" | "imaging" | "dispense";
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

export function HealthTimeline({ patientId }: HealthTimelineProps) {
  const compteRendus = useQuery(
    api.compte_rendus.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const labResults = useQuery(
    api.lab_results.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const vitals = useQuery(
    api.vitals.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const imagingFiles = useQuery(
    api.imaging_files.getFilesByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );

  const events: TimelineEvent[] = [];

  // Add CRs
  if (compteRendus) {
    for (const cr of compteRendus) {
      events.push({
        id: cr._id,
        date: cr._creationTime,
        type: "cr",
        title: "Compte Rendu",
        description: cr.diagnosis_code || "Clinical consultation",
        icon: <FileText size={14} />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      });
    }
  }

  // Add lab results
  if (labResults) {
    for (const lr of labResults) {
      if (!lr) continue;
      events.push({
        id: lr._id,
        date: lr.uploaded_at,
        type: "lab",
        title: "Lab Result",
        description: "Analysis results uploaded",
        icon: <Beaker size={14} />,
        color: "text-violet-600",
        bgColor: "bg-violet-100",
      });
    }
  }

  // Add prescriptions
  if (prescriptions) {
    for (const rx of prescriptions) {
      if (!rx) continue;
      events.push({
        id: rx._id,
        date: rx.issued_at,
        type: "prescription",
        title: "Prescription",
        description: `${rx.medications.length} medication(s) prescribed`,
        icon: <Pill size={14} />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
      });
    }
  }

  // Add vitals
  if (vitals) {
    for (const v of vitals) {
      events.push({
        id: v._id,
        date: v._creationTime,
        type: "vitals",
        title: "Vitals Recorded",
        description: `BP: ${v.systolic_bp}/${v.diastolic_bp}, HR: ${v.heart_rate}`,
        icon: <Activity size={14} />,
        color: "text-rose-600",
        bgColor: "bg-rose-100",
      });
    }
  }

  // Add imaging
  if (imagingFiles) {
    for (const img of imagingFiles) {
      events.push({
        id: img._id,
        date: img._creationTime,
        type: "imaging",
        title: "Imaging",
        description: img.modality || "Imaging file uploaded",
        icon: <Upload size={14} />,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
      });
    }
  }

  // Sort by date descending
  events.sort((a, b) => b.date - a.date);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Clock size={32} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">No health events recorded</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4 pl-12">
            {/* Icon */}
            <div
              className={`absolute left-0 top-0 w-10 h-10 ${event.bgColor} ${event.color} rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10`}
            >
              {event.icon}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-500">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
