"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ChevronRight,
  ChevronDown,
  Beaker,
  FileText,
  Activity,
  Stethoscope,
  Clock,
  Pill,
  Bell,
  Calendar,
  Users,
  MessageSquare,
  Download,
} from "lucide-react";

export type Section =
  | "dashboard"
  | "specialities"
  | "lab-results"
  | "imaging"
  | "comptes-rendus"
  | "timeline"
  | "appointments"
  | "medications"
  | "doctors"
  | "messages"
  | "notifications";

interface PatientSidebarProps {
  patientId: Id<"patients">;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function PatientSidebar({ patientId, activeSection, onSectionChange }: PatientSidebarProps) {
  const [expandedSpecialities, setExpandedSpecialities] = useState<Set<string>>(new Set());
  const [expandedDoctors, setExpandedDoctors] = useState<Set<string>>(new Set());

  const compteRendusForSpecialities = useQuery(
    api.compteRendus.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );

  // Build speciality_id → count map from CRs
  const specialityIdSet = new Set<string>();
  const specialityMap = new Map<string, number>();
  if (compteRendusForSpecialities) {
    for (const cr of compteRendusForSpecialities) {
      if (cr.speciality_id) {
        specialityIdSet.add(cr.speciality_id);
        specialityMap.set(cr.speciality_id, (specialityMap.get(cr.speciality_id) || 0) + 1);
      }
    }
  }
  // Use the speciality_id values directly as the list
  const specialities = Array.from(specialityIdSet).map((id) => ({ _id: id }));
  const doctors = useQuery(
    api.doctorPatients.listDoctorsForPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const labResults = useQuery(
    api.labResults.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const imagingFiles = useQuery(
    api.imagingFiles.getFilesByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const compteRendus = useQuery(
    api.compteRendus.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );
  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    patientId ? { patient_id: patientId } : "skip"
  );

  const toggleSpeciality = (id: string) => {
    setExpandedSpecialities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDoctor = (id: string) => {
    setExpandedDoctors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Live Vitals Dashboard", icon: <Activity size={16} /> },
    { id: "specialities", label: "Speciality Archive", icon: <Stethoscope size={16} /> },
    { id: "lab-results", label: "Lab Results", icon: <Beaker size={16} />, badge: labResults?.length },
    { id: "imaging", label: "Imaging / Radio", icon: <FileText size={16} />, badge: imagingFiles?.length },
    { id: "comptes-rendus", label: "Comptes Rendus", icon: <FileText size={16} />, badge: compteRendus?.length },
    { id: "timeline", label: "Health Timeline", icon: <Clock size={16} /> },
    { id: "appointments", label: "Upcoming Appointments", icon: <Calendar size={16} /> },
    { id: "medications", label: "Medication Schedule", icon: <Pill size={16} />, badge: prescriptions?.filter((p) => p.status === "active").length },
    { id: "doctors", label: "Assigned Doctors", icon: <Users size={16} /> },
    { id: "messages", label: "Messages", icon: <MessageSquare size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto shrink-0">
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const isExpandable = item.id === "specialities";

          return (
            <div key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
                {isExpandable && (
                  <ChevronRight
                    size={14}
                    className={`transition-transform duration-200 ${
                      expandedSpecialities.size > 0 ? "rotate-90" : ""
                    }`}
                  />
                )}
              </button>

              {/* Expandable Specialities */}
              {isExpandable && expandedSpecialities.size > 0 && (
                <div className="ml-6 mt-1 space-y-1">
              {specialities?.map((spec: { _id: string }) => (
                    <div key={spec._id}>
                      <button
                        onClick={() => toggleSpeciality(spec._id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${
                            expandedSpecialities.has(spec._id) ? "rotate-180" : ""
                          }`}
                        />
                        Speciality
                        {specialityMap.has(spec._id) && (
                          <span className="ml-auto text-[10px] text-slate-400 font-bold">
                            {specialityMap.get(spec._id)}
                          </span>
                        )}
                      </button>
                      {expandedSpecialities.has(spec._id) && (
                        <div className="ml-4 space-y-1">
                          {doctors
                            ?.filter((d) => d && d.speciality_id === spec._id)
                            .map((doc) => doc && (
                              <button
                                key={doc._id}
                                onClick={() => {
                                  toggleDoctor(doc._id);
                                  onSectionChange("comptes-rendus");
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                              >
                                {doc.name || "Doctor"}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}