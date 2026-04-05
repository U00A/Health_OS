"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import {
  Search, UserRound, FileText, Activity, Pill, Beaker, UserPlus,
  AlertTriangle, TrendingUp, CalendarDays, Clock, ClipboardList,
  TestTube, Users, Archive, Send, FileCheck, MessageSquare, Printer,
  Download, Building2, X, ChevronRight, Stethoscope, Heart, Brain,
  Bone, Eye, FlaskConical, Syringe, Hospital,
  ArrowLeft, Plus, Trash2, Save, EyeOff, Eye as EyeIcon
} from "lucide-react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { PatientHeaderBar } from "@/components/patient/PatientHeaderBar";
import { PatientSearchModal } from "@/components/clinical/PatientSearchModal";
import { PrescriptionForm } from "@/components/clinical/PrescriptionForm";
import { CompteRenduForm } from "@/components/clinical/CompteRenduForm";
import { LabOrderForm } from "@/components/clinical/LabOrderForm";
import { VitalsTrendChart } from "@/components/clinical/VitalsTrendChart";

type ActiveView =
  | "list"
  | "prescription"
  | "compte_rendu"
  | "lab_order"
  | "timeline"
  | "referral"
  | "cross_patient"
  | "archive"
  | "shift_handover"
  | "shift_log"
  | "ward_roster"
  | "scratchpad"
  | "templates"
  | "lab_trends"
  | "documents"
  | "vitals";

interface EnrichedPatient {
  _id: string;
  _creationTime: number;
  first_name: string;
  last_name: string;
  national_id: string;
  dob: string;
  blood_type?: string;
  wilaya?: string;
  allergies?: string[];
  phone?: string;
  activePrescriptionCount: number;
  pendingLabCount: number;
}

// Quick action buttons configuration
const quickActions = [
  { key: "compte_rendu", label: "Compte Rendu", icon: FileText, color: "bg-indigo-600 hover:bg-indigo-700" },
  { key: "prescription", label: "Prescription", icon: Pill, color: "bg-blue-600 hover:bg-blue-700" },
  { key: "lab_order", label: "Lab Order", icon: Beaker, color: "bg-violet-600 hover:bg-violet-700" },
  { key: "timeline", label: "Timeline", icon: CalendarDays, color: "bg-slate-700 hover:bg-slate-800" },
  { key: "referral", label: "Referral", icon: Send, color: "bg-emerald-600 hover:bg-emerald-700" },
  { key: "vitals", label: "Vitals", icon: Activity, color: "bg-rose-600 hover:bg-rose-700" },
];

// Secondary toolbar buttons
const secondaryActions = [
  { key: "cross_patient", label: "Ward Vitals", icon: Users },
  { key: "shift_handover", label: "Shift Handover", icon: MessageSquare },
  { key: "shift_log", label: "Shift Log", icon: ClipboardList },
  { key: "ward_roster", label: "Ward Roster", icon: Building2 },
  { key: "archive", label: "Archive", icon: Archive },
  { key: "scratchpad", label: "Scratchpad", icon: ClipboardList },
  { key: "templates", label: "Templates", icon: FileText },
  { key: "lab_trends", label: "Lab Trends", icon: TrendingUp },
  { key: "documents", label: "Documents", icon: FileCheck },
];

export default function DoctorPage() {
  const betterAuthId = useBetterAuthId();
  const rawPatients = useQuery(
    api.doctor_patients.listMyPatients,
    betterAuthId ? { betterAuthId } : "skip"
  );
  const patients: EnrichedPatient[] = (rawPatients?.filter(Boolean) as EnrichedPatient[]) || [];

  const [selectedPatient, setSelectedPatient] = useState<Doc<"patients"> | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [showSearch, setShowSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [timelineFilter, setTimelineFilter] = useState<"all" | "cr" | "lab" | "rx" | "vitals">("all");

  // Referral state
  const [referralType, setReferralType] = useState<"internal" | "external" | "urgent" | "">("");
  const [referralSpeciality, setReferralSpeciality] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [referralGenerated, setReferralGenerated] = useState(false);

  // Shift handover state
  const [handoverNotes, setHandoverNotes] = useState<Record<string, string>>({});
  const [handoverSubmitted, setHandoverSubmitted] = useState(false);

  // Shift log
  const [logFilter, setLogFilter] = useState<"all" | "observation" | "escalation" | "procedure" | "nursing_note">("all");
  const [logEntries, setLogEntries] = useState<{ type: string; note: string; time: number }[]>([]);
  const [newLogNote, setNewLogNote] = useState("");
  const [newLogType, setNewLogType] = useState<"observation" | "escalation" | "procedure" | "nursing_note">("observation");

  // Quick note / scratchpad
  const [quickNote, setQuickNote] = useState("");
  const [scratchpadNotes, setScratchpadNotes] = useState("");

  // Allergy conflict banner
  const [allergyConflict, setAllergyConflict] = useState<{ isOpen: boolean; allergens: string[]; conflictingMeds: string[] }>({
    isOpen: false,
    allergens: [],
    conflictingMeds: [],
  });

  // Consultation templates
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateContent, setTemplateContent] = useState("");

  // Document visibility
  const [showAllDocs, setShowAllDocs] = useState(false);

  // Filtered patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchFilter.trim()) return patients;
    const filter = searchFilter.toLowerCase();
    return patients.filter(
      (p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(filter) ||
        p.national_id.toLowerCase().includes(filter) ||
        (p.wilaya || "").toLowerCase().includes(filter) ||
        (p.blood_type || "").toLowerCase().includes(filter)
    );
  }, [patients, searchFilter]);

  const handleSelectPatient = (p: Doc<"patients">) => {
    setSelectedPatient(p);
    setActiveView("list");
    setSearchFilter("");
  };

  // Fetch timeline data for selected patient
  const crs = useQuery(
    api.compte_rendus.listByPatient,
    selectedPatient && (activeView === "timeline" || activeView === "referral")
      ? { patient_id: selectedPatient._id as Id<"patients">, betterAuthId: betterAuthId || undefined }
      : "skip"
  );
  const labResults = useQuery(
    api.lab_results.listByPatient,
    selectedPatient && (activeView === "timeline" || activeView === "lab_trends" || activeView === "documents")
      ? { patient_id: selectedPatient._id as Id<"patients">, betterAuthId: betterAuthId || undefined }
      : "skip"
  );
  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    selectedPatient && (activeView === "timeline" || activeView === "documents")
      ? { patient_id: selectedPatient._id as Id<"patients">, betterAuthId: betterAuthId || undefined }
      : "skip"
  );
  const vitals = useQuery(
    api.vitals.listByPatient,
    selectedPatient && (activeView === "timeline" || activeView === "vitals")
      ? { patient_id: selectedPatient._id as Id<"patients">, betterAuthId: betterAuthId || undefined }
      : "skip"
  );

  const addLogEntry = () => {
    if (!newLogNote.trim()) return;
    setLogEntries((prev) => [
      { type: newLogType, note: newLogNote, time: Date.now() },
      ...prev,
    ]);
    setNewLogNote("");
  };

  const submitHandover = () => {
    if (!selectedPatient || !handoverNotes[selectedPatient._id]?.trim()) return;
    setHandoverSubmitted(true);
    setTimeout(() => setHandoverSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Overview</h1>
            <p className="text-slate-500 font-medium mt-1">
              {rawPatients !== undefined ? `${patients.length} active patient${patients.length !== 1 ? "s" : ""}` : "Loading..."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, wilaya..."
                className="w-full bg-white border border-slate-200 shadow-sm pl-9 pr-8 p-2.5 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Button
              className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200"
              onPress={() => setShowSearch(true)}
            >
              <UserPlus size={16} /> Assign
            </Button>
          </div>
        </div>

        {/* Quick Actions - Only show when patient selected */}
        {selectedPatient && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isActive = activeView === action.key;
              return (
                <button
                  key={action.key}
                  onClick={() => setActiveView(isActive ? "list" : action.key as ActiveView)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? `${action.color} text-white shadow-md`
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Secondary Actions - Always visible */}
        <div className="flex flex-wrap gap-2">
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            const isActive = activeView === action.key;
            return (
              <button
                key={action.key}
                onClick={() => setActiveView(isActive ? "list" : action.key as ActiveView)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Icon size={14} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Header Bar */}
      {selectedPatient && (
        <PatientHeaderBar
          patient={selectedPatient}
          onClose={() => {
            setSelectedPatient(null);
            setActiveView("list");
          }}
        />
      )}

      {/* Patient List View */}
      {activeView === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {rawPatients === undefined ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            ) : filteredPatients.length === 0 ? (
              <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
                <div className="p-12 text-center">
                  <UserRound size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-700 text-lg mb-2">
                    {searchFilter ? "No patients match your search" : "No Patients Assigned"}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">
                    {searchFilter
                      ? "Try adjusting your search terms"
                      : 'Use "Assign Patient" to search and add patients to your roster.'}
                  </p>
                  {!searchFilter && (
                    <Button className="font-bold bg-blue-600 text-white" onPress={() => setShowSearch(true)}>
                      <UserPlus size={14} /> Assign First Patient
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                {searchFilter && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Search size={14} />
                    <span>
                      Showing {filteredPatients.length} of {patients.length} patients
                    </span>
                    <button
                      onClick={() => setSearchFilter("")}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                )}
                {filteredPatients.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleSelectPatient(p as unknown as Doc<"patients">)}
                    className={`border shadow-sm hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer rounded-2xl bg-white ${
                      selectedPatient?._id === p._id
                        ? "border-blue-400 bg-blue-50/30 shadow-md shadow-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            p.allergies && p.allergies.length > 0
                              ? "bg-rose-100 text-rose-600"
                              : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                          }`}
                        >
                          <UserRound size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-lg">
                              {p.first_name} {p.last_name}
                            </h3>
                            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 rounded-md">
                              {p.national_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            {p.blood_type && <span>{p.blood_type}</span>}
                            {p.blood_type && <span className="text-slate-300">•</span>}
                            <span>DOB: {p.dob}</span>
                            {p.wilaya && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>{p.wilaya}</span>
                              </>
                            )}
                          </div>
                          {p.allergies && p.allergies.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle size={12} className="text-red-500" />
                              {p.allergies.map((a) => (
                                <Chip
                                  key={a}
                                  size="sm"
                                  color="danger"
                                  variant="soft"
                                  className="text-[9px] font-black uppercase tracking-widest"
                                >
                                  {a}
                                </Chip>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.pendingLabCount > 0 && (
                          <Chip
                            size="sm"
                            color="warning"
                            variant="soft"
                            className="text-[9px] font-black uppercase tracking-widest"
                          >
                            {p.pendingLabCount} lab{p.pendingLabCount > 1 ? "s" : ""}
                          </Chip>
                        )}
                        {p.activePrescriptionCount > 0 && (
                          <Chip
                            size="sm"
                            color="accent"
                            variant="soft"
                            className="text-[9px] font-black uppercase tracking-widest"
                          >
                            {p.activePrescriptionCount} Rx
                          </Chip>
                        )}
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200 border-none">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={24} className="text-blue-200" />
                  <h3 className="text-lg font-bold tracking-tight">Shift Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20">
                    <span className="text-sm font-medium text-blue-100">Active Patients</span>
                    <span className="font-black font-mono text-2xl">{patients.length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20">
                    <span className="text-sm font-medium text-blue-100">Status</span>
                    <Chip
                      size="sm"
                      className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-bold text-[10px] uppercase tracking-widest"
                    >
                      On Duty
                    </Chip>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Total Patients</span>
                    <span className="font-bold text-slate-900">{patients.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Active Prescriptions</span>
                    <span className="font-bold text-blue-600">
                      {patients.reduce((sum, p) => sum + p.activePrescriptionCount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Pending Labs</span>
                    <span className="font-bold text-amber-600">
                      {patients.reduce((sum, p) => sum + p.pendingLabCount, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Vitals View */}
      {selectedPatient && activeView === "vitals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Vitals Trends</h2>
                <p className="text-xs text-slate-500">Historical vitals with normal range indicators</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="systolic_bp"
              unit="mmHg"
              label="Systolic BP"
              normalRange={[90, 120]}
            />
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="heart_rate"
              unit="bpm"
              label="Heart Rate"
              normalRange={[60, 100]}
            />
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="temperature"
              unit="°C"
              label="Temperature"
              normalRange={[36.1, 37.2]}
            />
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="spo2"
              unit="%"
              label="SpO2"
              normalRange={[95, 100]}
            />
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="respiratory_rate"
              unit="/min"
              label="Respiratory Rate"
              normalRange={[12, 20]}
            />
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="weight"
              unit="kg"
              label="Weight"
              normalRange={[50, 100]}
            />
          </div>
        </div>
      )}

      {/* Timeline View */}
      {selectedPatient && activeView === "timeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Patient Timeline</h2>
                <p className="text-xs text-slate-500">Chronological view of all patient events</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "cr", "lab", "rx", "vitals"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimelineFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    timelineFilter === f
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {f === "all" ? "All" : f === "cr" ? "CRs" : f === "lab" ? "Labs" : f === "rx" ? "Rx" : "Vitals"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {(() => {
              const events: { type: string; date: number; dateStr: string; data?: unknown }[] = [];
              if (crs)
                crs.forEach((cr) =>
                  events.push({
                    type: "cr",
                    date: cr._creationTime,
                    dateStr: new Date(cr._creationTime).toLocaleString(),
                    data: cr,
                  })
                );
              if (labResults)
                labResults.forEach((lr) => {
                  if (lr)
                    events.push({
                      type: "lab",
                      date: lr._creationTime,
                      dateStr: new Date(lr._creationTime).toLocaleString(),
                      data: lr,
                    });
                });
              if (prescriptions)
                prescriptions.forEach((rx) => {
                  if (rx)
                    events.push({
                      type: "rx",
                      date: Number(rx.issued_at ?? 0),
                      dateStr: new Date(Number(rx.issued_at ?? 0)).toLocaleString(),
                      data: rx,
                    });
                });
              if (vitals)
                vitals.forEach((v) =>
                  events.push({
                    type: "vitals",
                    date: v.recorded_at,
                    dateStr: new Date(v.recorded_at).toLocaleString(),
                    data: v,
                  })
                );
              events.sort((a, b) => b.date - a.date);
              const filtered = timelineFilter === "all" ? events : events.filter((e) => e.type === timelineFilter);

              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <ClipboardList size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No events found for this filter.</p>
                  </div>
                );
              }

              const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
                cr: { icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", label: "Compte Rendu" },
                lab: { icon: TestTube, color: "text-violet-600", bg: "bg-violet-50", label: "Lab Result" },
                rx: { icon: Pill, color: "text-blue-600", bg: "bg-blue-50", label: "Prescription" },
                vitals: { icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", label: "Vitals" },
              };

              return filtered.map((event, idx) => {
                const config = typeConfig[event.type];
                const Icon = config.icon;
                return (
                  <div
                    key={idx}
                    className="flex gap-4 items-start p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">{config.label}</span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Clock size={10} />
                          {event.dateStr}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">Event recorded</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Forms */}
      {selectedPatient && activeView === "prescription" && betterAuthId && (
        <PrescriptionForm
          patient={selectedPatient}
          betterAuthId={betterAuthId}
          onSuccess={() => setActiveView("list")}
          onCancel={() => setActiveView("list")}
        />
      )}
      {selectedPatient && activeView === "compte_rendu" && betterAuthId && (
        <CompteRenduForm
          patient={selectedPatient}
          betterAuthId={betterAuthId}
          onSuccess={() => setActiveView("list")}
          onCancel={() => setActiveView("list")}
        />
      )}
      {selectedPatient && activeView === "lab_order" && betterAuthId && (
        <LabOrderForm
          patient={selectedPatient}
          betterAuthId={betterAuthId}
          onSuccess={() => setActiveView("list")}
          onCancel={() => setActiveView("list")}
        />
      )}

      {/* Referral View */}
      {selectedPatient && activeView === "referral" && (
        <div className="space-y-6">
          {!referralGenerated ? (
            <Card className="border border-blue-200 shadow-sm bg-blue-50/30">
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Send size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Referral Letter</h2>
                    <p className="text-xs text-slate-500">
                      Referral for {selectedPatient.first_name} {selectedPatient.last_name} (
                      {selectedPatient.national_id})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Referral Type
                    </label>
                    <div className="flex gap-2">
                      {(
                        [
                          { key: "internal", label: "Internal", color: "bg-blue-600" },
                          { key: "external", label: "External", color: "bg-indigo-600" },
                          { key: "urgent", label: "Urgent", color: "bg-red-600" },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setReferralType(t.key)}
                          className={`flex-1 p-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                            referralType === t.key
                              ? `${t.color} text-white border-transparent`
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Target Speciality
                    </label>
                    <select
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none"
                      value={referralSpeciality}
                      onChange={(e) => setReferralSpeciality(e.target.value)}
                    >
                      <option value="">Select receiving speciality...</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="ophthalmology">Ophthalmology</option>
                      <option value="pulmonology">Pulmonology</option>
                      <option value="nephrology">Nephrology</option>
                      <option value="endocrinology">Endocrinology</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    Pre-Filled Diagnosis
                  </label>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
                    {crs && crs.length > 0 ? (
                      <span className="font-bold text-slate-900">
                        {crs[0].diagnosis_code || "Clinical Consultation"}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No recent diagnosis on file</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    Referral Reason
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none resize-none"
                    placeholder="Provide clinical context, reason for referral..."
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    className="font-bold bg-blue-600 text-white shadow-md"
                    isDisabled={!referralType || !referralSpeciality || !referralReason.trim()}
                    onPress={() => setReferralGenerated(true)}
                  >
                    <FileCheck size={14} /> Generate Referral Letter
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-bold"
                    onPress={() => {
                      setActiveView("list");
                      setReferralReason("");
                      setReferralType("");
                      setReferralSpeciality("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border border-green-200 shadow-sm bg-green-50/30">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileCheck size={18} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Referral Generated</h2>
                    <p className="text-xs text-slate-500">Referral letter has been created successfully</p>
                  </div>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-600">
                    <strong>Referral Type:</strong> {referralType}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Speciality:</strong> {referralSpeciality}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Reason:</strong> {referralReason}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="font-bold bg-green-600 text-white" onPress={() => window.print()}>
                    <Printer size={14} /> Print Referral
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-bold"
                    onPress={() => {
                      setActiveView("list");
                      setReferralGenerated(false);
                      setReferralReason("");
                      setReferralType("");
                      setReferralSpeciality("");
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Shift Handover View */}
      {activeView === "shift_handover" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <MessageSquare size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Shift Handover</h2>
                <p className="text-xs text-slate-500">Document important notes for the next shift</p>
              </div>
            </div>

            {handoverSubmitted && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                Handover notes submitted successfully!
              </div>
            )}

            {patients.length > 0 ? (
              <div className="space-y-4">
                {patients.map((p) => (
                  <div key={p._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {p.first_name} {p.last_name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{p.national_id}</span>
                    </div>
                    <textarea
                      rows={2}
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm outline-none resize-none"
                      placeholder={`Notes for ${p.first_name}...`}
                      value={handoverNotes[p._id] || ""}
                      onChange={(e) => setHandoverNotes({ ...handoverNotes, [p._id]: e.target.value })}
                    />
                  </div>
                ))}
                <Button className="font-bold bg-amber-600 text-white" onPress={submitHandover}>
                  <Send size={14} /> Submit Handover
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No patients to document handover for</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Shift Log View */}
      {activeView === "shift_log" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <ClipboardList size={18} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Shift Log</h2>
                <p className="text-xs text-slate-500">Record observations, procedures, and notes</p>
              </div>
            </div>

            {/* Add new log entry */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex gap-2">
                {(["observation", "escalation", "procedure", "nursing_note"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewLogType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      newLogType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-slate-200 text-slate-500"
                    }`}
                  >
                    {type.replace("_", " ")}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-3 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                  placeholder="Enter log entry..."
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLogEntry()}
                />
                <Button className="font-bold bg-indigo-600 text-white" onPress={addLogEntry}>
                  <Plus size={14} /> Add
                </Button>
              </div>
            </div>

            {/* Log entries */}
            {logEntries.length > 0 ? (
              <div className="space-y-2">
                {logEntries.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        entry.type === "escalation"
                          ? "bg-red-500"
                          : entry.type === "procedure"
                          ? "bg-blue-500"
                          : entry.type === "nursing_note"
                          ? "bg-green-500"
                          : "bg-slate-400"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-500">{entry.type.replace("_", " ")}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(entry.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{entry.note}</p>
                    </div>
                    <button
                      onClick={() => setLogEntries(logEntries.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No log entries yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your first observation above</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Ward Roster View */}
      {activeView === "ward_roster" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Ward Roster</h2>
                <p className="text-xs text-slate-500">Current ward assignments and bed status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((p) => (
                <div key={p._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {p.first_name[0]}
                      {p.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{p.national_id}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Blood Type</span>
                      <span className="font-bold">{p.blood_type || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wilaya</span>
                      <span className="font-bold">{p.wilaya || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Rx</span>
                      <span className="font-bold text-blue-600">{p.activePrescriptionCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {patients.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <Building2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No patients in ward</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Archive View */}
      {activeView === "archive" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Archive size={18} className="text-slate-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Archive</h2>
                <p className="text-xs text-slate-500">Historical patient records and completed cases</p>
              </div>
            </div>

            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <Archive size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Archive feature coming soon</p>
              <p className="text-xs text-slate-400 mt-1">Completed patient cases will be stored here</p>
            </div>
          </div>
        </Card>
      )}

      {/* Scratchpad View */}
      {activeView === "scratchpad" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ClipboardList size={18} className="text-yellow-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Scratchpad</h2>
                <p className="text-xs text-slate-500">Quick notes and reminders</p>
              </div>
            </div>

            <textarea
              rows={12}
              className="w-full p-4 rounded-xl border border-slate-200 bg-yellow-50 text-sm font-mono outline-none resize-none"
              placeholder="Type your notes here..."
              value={scratchpadNotes}
              onChange={(e) => setScratchpadNotes(e.target.value)}
            />

            <div className="flex gap-2">
              <Button className="font-bold bg-yellow-600 text-white" onPress={() => localStorage.setItem("scratchpad", scratchpadNotes)}>
                <Save size={14} /> Save Notes
              </Button>
              <Button variant="ghost" className="font-bold" onPress={() => setScratchpadNotes("")}>
                <Trash2 size={14} /> Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Templates View */}
      {activeView === "templates" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Templates</h2>
                <p className="text-xs text-slate-500">Pre-built consultation templates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "General Consultation", desc: "Standard patient visit template" },
                { name: "Follow-up Visit", desc: "Routine follow-up assessment" },
                { name: "Chronic Disease", desc: "Diabetes, hypertension management" },
                { name: "Acute Illness", desc: "Fever, infection, pain assessment" },
                { name: "Preventive Care", desc: "Vaccination, screening template" },
                { name: "Referral Note", desc: "Specialist referral documentation" },
              ].map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedTemplate(t.name);
                    setTemplateContent(`Template: ${t.name}\n\nDate: ${new Date().toLocaleDateString()}\nPatient: [Patient Name]\n\nChief Complaint:\n\nHistory of Present Illness:\n\nAssessment:\n\nPlan:\n`);
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedTemplate && (
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                  Template Content
                </label>
                <textarea
                  rows={10}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm font-mono outline-none resize-none"
                  placeholder="Template content will appear here. Customize as needed..."
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button className="font-bold bg-purple-600 text-white" onPress={() => setActiveView("compte_rendu")}>
                    <FileText size={14} /> Use as Compte Rendu
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-bold"
                    onPress={() => {
                      setSelectedTemplate("");
                      setTemplateContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lab Trends View */}
      {selectedPatient && activeView === "lab_trends" && (
        <Card className="border border-violet-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-violet-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Lab Result Trends</h2>
                <p className="text-xs text-slate-500">Historical lab values with reference range bands</p>
              </div>
            </div>

            {labResults && labResults.length > 0 ? (
              <div className="space-y-4">
                {labResults.map((lr) => {
                  if (!lr) return null;
                  return (
                    <div key={lr._id} className="p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TestTube size={16} className="text-violet-600" />
                          <span className="font-bold text-slate-900 text-sm">
                            {(lr as Record<string, unknown>).test_name as string || "Lab Test"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(lr._creationTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg col-span-4">
                          <p className="text-xs text-slate-500 font-bold uppercase">Analysis Type</p>
                          <p className="text-lg font-black text-slate-900">{lr.analysis_type || "N/A"}</p>
                        </div>
                      </div>
                      {lr.critical_values && Array.isArray(lr.critical_values) && lr.critical_values.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-600" />
                          <span className="text-xs font-bold text-red-700">Critical values detected</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <TestTube size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No lab results on file</p>
                <p className="text-xs text-slate-400 mt-1">Lab results will appear here with trend visualization.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Documents View */}
      {selectedPatient && activeView === "documents" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <FileCheck size={18} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Full Document Visibility</h2>
                  <p className="text-xs text-slate-500">All patient documents — unmasked</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className={showAllDocs ? "bg-slate-900 text-white font-bold" : "font-bold"}
                onPress={() => setShowAllDocs(!showAllDocs)}
              >
                {showAllDocs ? "Showing All" : "Show All Docs"}
              </Button>
            </div>

            {showAllDocs ? (
              <div className="space-y-4">
                {/* CRs */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" /> Comptes Rendus
                  </h3>
                  {crs && crs.length > 0
                    ? crs.map((cr) => (
                        <div key={cr._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">
                              {cr.diagnosis_code || "Clinical Note"}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {new Date(cr._creationTime).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            By: <span className="font-bold text-slate-700">Treating Physician</span>
                          </p>
                        </div>
                      ))
                    : <p className="text-xs text-slate-400 italic">No CRs on file</p>}
                </div>

                {/* Lab Results */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <TestTube size={14} className="text-violet-600" /> Lab Results
                  </h3>
                  {labResults && labResults.length > 0
                    ? labResults.map((lr) => (
                        <div key={lr?._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">
                              {lr?.analysis_type || "Lab Test"}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {lr?._creationTime ? new Date(lr._creationTime).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            By: <span className="font-bold text-slate-700">Laboratory</span>
                          </p>
                        </div>
                      ))
                    : <p className="text-xs text-slate-400 italic">No lab results on file</p>}
                </div>

                {/* Prescriptions */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Pill size={14} className="text-blue-600" /> Prescriptions
                  </h3>
                  {prescriptions && prescriptions.length > 0
                    ? prescriptions.map((rx) => {
                        if (!rx) return null;
                        const meds = (rx as Record<string, unknown>).medications;
                        const medCount = Array.isArray(meds) ? meds.length : 0;
                        const issuedAt = Number(rx.issued_at ?? 0);
                        return (
                          <div key={rx._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900">{medCount} medication(s)</span>
                              <span className="text-xs text-slate-400 font-mono">
                                {new Date(issuedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              By: <span className="font-bold text-slate-700">Prescribing Doctor</span>
                            </p>
                          </div>
                        );
                      })
                    : <p className="text-xs text-slate-400 italic">No prescriptions on file</p>}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FileCheck size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Click "Show All Docs" to view all patient documents</p>
                <p className="text-xs text-slate-400 mt-1">
                  As a state doctor, you have full visibility to all clinical documents.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Cross-Patient Ward Vitals View */}
      {activeView === "cross_patient" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Ward Vitals Overview</h2>
                <p className="text-xs text-slate-500">Quick vitals snapshot for all assigned patients</p>
              </div>
            </div>

            {patients.length > 0 ? (
              <div className="space-y-4">
                {patients.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
                    onClick={() => {
                      setSelectedPatient(p as unknown as Doc<"patients">);
                      setActiveView("vitals");
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {p.first_name[0]}
                          {p.last_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {p.first_name} {p.last_name}
                          </p>
                          <p className="text-xs text-slate-500">{p.national_id}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">HR</p>
                        <p className="text-sm font-bold text-slate-900">--</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">BP</p>
                        <p className="text-sm font-bold text-slate-900">--/--</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Temp</p>
                        <p className="text-sm font-bold text-slate-900">--</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">SpO2</p>
                        <p className="text-sm font-bold text-slate-900">--%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No patients to display vitals for</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Patient Search Modal */}
      <PatientSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelect={handleSelectPatient}
        showAssignButton
        betterAuthId={betterAuthId}
      />

      {/* Allergy Conflict Banner */}
      {allergyConflict.isOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="border border-red-300 shadow-2xl bg-red-50 max-w-lg w-full">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-red-900 text-lg">ALLERGY CONFLICT DETECTED</h2>
                  <p className="text-xs text-red-600 font-bold">BLOCKING — Cannot proceed without override</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-red-200 rounded-xl space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Patient Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {allergyConflict.allergens.map((a) => (
                      <Chip key={a} size="sm" color="danger" className="text-[10px] font-black uppercase">
                        {a}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Conflicting Medications</p>
                  <div className="flex flex-wrap gap-1">
                    {allergyConflict.conflictingMeds.map((m) => (
                      <Chip key={m} size="sm" color="warning" className="text-[10px] font-black uppercase">
                        {m}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 font-bold bg-red-600 text-white"
                  onPress={() => setAllergyConflict({ isOpen: false, allergens: [], conflictingMeds: [] })}
                >
                  Acknowledge & Override
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 font-bold"
                  onPress={() => {
                    setActiveView("list");
                    setAllergyConflict({ isOpen: false, allergens: [], conflictingMeds: [] });
                  }}
                >
                  Cancel & Review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}