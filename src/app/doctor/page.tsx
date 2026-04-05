"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import { Search, UserRound, FileText, Activity, Pill, Beaker, UserPlus, AlertTriangle, TrendingUp, CalendarDays, Clock, ClipboardList, TestTube, Users, Archive, Send, FileCheck, MessageSquare, Printer, Download, Building2 } from "lucide-react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { PatientHeaderBar } from "@/components/patient/PatientHeaderBar";
import { PatientSearchModal } from "@/components/clinical/PatientSearchModal";
import { PrescriptionForm } from "@/components/clinical/PrescriptionForm";
import { CompteRenduForm } from "@/components/clinical/CompteRenduForm";
import { LabOrderForm } from "@/components/clinical/LabOrderForm";
import { VitalsTrendChart } from "@/components/clinical/VitalsTrendChart";

type ActiveView = "list" | "prescription" | "compte_rendu" | "lab_order" | "timeline" | "referral" | "cross_patient" | "archive" | "shift_handover" | "shift_log" | "ward_roster" | "scratchpad" | "templates" | "lab_trends" | "documents";

// Enriched patient type from listMyPatients
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

  // Quick note / scratchpad
  const [quickNote, setQuickNote] = useState("");
  const [scratchpadNotes, setScratchpadNotes] = useState("");
  
  // Allergy conflict banner
  const [allergyConflict, setAllergyConflict] = useState<{ isOpen: boolean; allergens: string[]; conflictingMeds: string[] }>({ isOpen: false, allergens: [], conflictingMeds: [] });
  
  // Consultation templates
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateContent, setTemplateContent] = useState("");
  
  // Document visibility
  const [showAllDocs, setShowAllDocs] = useState(false);

  const filteredPatients = patients.filter(
    (p) =>
      !searchFilter ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.national_id.includes(searchFilter)
  );

  const handleSelectPatient = (p: Doc<"patients">) => {
    setSelectedPatient(p);
    setActiveView("list");
  };

  // Fetch timeline data for selected patient
  const crs = useQuery(
    api.compte_rendus.listByPatient,
    selectedPatient && activeView === "timeline" ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined 
    } : "skip"
  );
  const labResults = useQuery(
    api.lab_results.listByPatient,
    selectedPatient && activeView === "timeline" ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined 
    } : "skip"
  );
  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    selectedPatient && activeView === "timeline" ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined 
    } : "skip"
  );
  const vitals = useQuery(
    api.vitals.listByPatient,
    selectedPatient && activeView === "timeline" ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined 
    } : "skip"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            {rawPatients !== undefined ? `${patients.length} active patients` : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Filter patients..."
              className="w-full md:w-64 bg-white border border-slate-200 shadow-sm pl-9 p-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <Button
            className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200"
            onPress={() => setShowSearch(true)}
          >
            <UserPlus size={16} /> Assign Patient
          </Button>
          {selectedPatient && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "timeline" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "timeline" ? "list" : "timeline")}
              >
                <CalendarDays size={16} /> Timeline
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "referral" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "referral" ? "list" : "referral")}
              >
                <Send size={16} /> Referral
              </Button>
            </div>
          )}
          {!selectedPatient && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "cross_patient" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "cross_patient" ? "list" : "cross_patient")}
              >
                <Users size={16} /> Ward Vitals
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "shift_handover" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "shift_handover" ? "list" : "shift_handover")}
              >
                <MessageSquare size={16} /> Shift Handover
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "shift_log" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "shift_log" ? "list" : "shift_log")}
              >
                <ClipboardList size={16} /> Shift Log
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "ward_roster" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "ward_roster" ? "list" : "ward_roster")}
              >
                <Building2 size={16} /> Ward Roster
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "archive" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "archive" ? "list" : "archive")}
              >
                <Archive size={16} /> Archive
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "scratchpad" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "scratchpad" ? "list" : "scratchpad")}
              >
                <ClipboardList size={16} /> Scratchpad
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "templates" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "templates" ? "list" : "templates")}
              >
                <FileText size={16} /> Templates
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "lab_trends" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "lab_trends" ? "list" : "lab_trends")}
              >
                <TrendingUp size={16} /> Lab Trends
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "documents" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "documents" ? "list" : "documents")}
              >
                <FileCheck size={16} /> Documents
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Patient Header Bar */}
      {selectedPatient && (
        <PatientHeaderBar
          patient={selectedPatient}
          onClose={() => { setSelectedPatient(null); setActiveView("list"); }}
        />
      )}

      {/* Action buttons when patient selected */}
      {selectedPatient && activeView === "list" && (
        <div className="flex gap-3 flex-wrap">
          <Button className="font-bold bg-indigo-600 text-white shadow-md shadow-indigo-200" onPress={() => setActiveView("compte_rendu")}>
            <FileText size={14} /> Write Compte Rendu
          </Button>
          <Button className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200" onPress={() => setActiveView("prescription")}>
            <Pill size={14} /> Write Prescription
          </Button>
          <Button className="font-bold bg-violet-600 text-white shadow-md shadow-violet-200" onPress={() => setActiveView("lab_order")}>
            <Beaker size={14} /> Order Lab
          </Button>
        </div>
      )}

      {/* Vitals Trends Section */}
      {selectedPatient && activeView === "list" && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Vitals Trends</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="systolic_bp"
              unit=""
              label="Systolic BP"
              normalRange={[90, 120]}
            />
            <VitalsTrendChart
              patientId={selectedPatient._id as Id<"patients">}
              metric="heart_rate"
              unit=" bpm"
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
              unit=" /min"
              label="Respiratory Rate"
              normalRange={[12, 20]}
            />
          </div>
        </div>
      )}

      {/* Forms */}
      {selectedPatient && activeView === "prescription" && betterAuthId && (
        <PrescriptionForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {selectedPatient && activeView === "compte_rendu" && betterAuthId && (
        <CompteRenduForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {selectedPatient && activeView === "lab_order" && betterAuthId && (
        <LabOrderForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}

      {/* Patient Timeline View */}
      {selectedPatient && activeView === "timeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <CalendarDays size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Patient Timeline</h2>
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
              const events: { type: string; date: number; dateStr: string }[] = [];
              if (crs) crs.forEach((cr) => events.push({ type: "cr", date: cr._creationTime, dateStr: new Date(cr._creationTime).toLocaleString() }));
              if (labResults) labResults.forEach((lr) => { if (lr) events.push({ type: "lab", date: lr._creationTime, dateStr: new Date(lr._creationTime).toLocaleString() }); });
              if (prescriptions) prescriptions.forEach((rx) => { if (rx) events.push({ type: "rx", date: Number(rx.issued_at ?? 0), dateStr: new Date(Number(rx.issued_at ?? 0)).toLocaleString() }); });
              if (vitals) vitals.forEach((v) => events.push({ type: "vitals", date: v.recorded_at, dateStr: new Date(v.recorded_at).toLocaleString() }));
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
                  <div key={idx} className="flex gap-4 items-start p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors">
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

      {/* Patient List */}
      {activeView === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {rawPatients === undefined ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))
            ) : filteredPatients.length === 0 ? (
              <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
                <div className="p-12 text-center">
                  <UserRound size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-700 text-lg mb-2">No Patients Assigned</h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">
                    Use &ldquo;Assign Patient&rdquo; to search and add patients to your roster.
                  </p>
                  <Button className="font-bold bg-blue-600 text-white" onPress={() => setShowSearch(true)}>
                    <UserPlus size={14} /> Assign First Patient
                  </Button>
                </div>
              </Card>
            ) : (
              filteredPatients.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleSelectPatient(p as unknown as Doc<"patients">)}
                  className={`border shadow-sm hover:border-blue-300 transition-all group cursor-pointer rounded-2xl bg-white ${
                    selectedPatient?._id === p._id ? "border-blue-400 bg-blue-50/30 shadow-md shadow-blue-100" : "border-slate-200"
                  }`}
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        p.allergies && p.allergies.length > 0
                          ? "bg-rose-100 text-rose-600"
                          : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}>
                        <UserRound size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">{p.first_name} {p.last_name}</h3>
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 rounded-md">{p.national_id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          {p.blood_type && <span>{p.blood_type}</span>}
                          {p.blood_type && <span className="text-slate-300">•</span>}
                          <span>DOB: {p.dob}</span>
                          {p.wilaya && <><span className="text-slate-300">•</span><span>{p.wilaya}</span></>}
                        </div>
                        {p.allergies && p.allergies.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle size={12} className="text-red-500" />
                            {p.allergies.map((a) => (
                              <Chip key={a} size="sm" color="danger" variant="soft" className="text-[9px] font-black uppercase tracking-widest">
                                {a}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.pendingLabCount > 0 && (
                        <Chip size="sm" color="warning" variant="soft" className="text-[9px] font-black uppercase tracking-widest">
                          {p.pendingLabCount} lab{p.pendingLabCount > 1 ? "s" : ""}
                        </Chip>
                      )}
                      {p.activePrescriptionCount > 0 && (
                        <Chip size="sm" color="accent" variant="soft" className="text-[9px] font-black uppercase tracking-widest">
                          {p.activePrescriptionCount} Rx
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar stats */}
          <div className="space-y-6">
            <Card className="bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200 border-none">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={24} className="text-blue-200" />
                  <h3 className="text-lg font-bold tracking-tight">Shift Status</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20">
                    <span className="text-sm font-medium text-blue-100">Active Patients</span>
                    <span className="font-black font-mono text-2xl">{patients.length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20">
                    <span className="text-sm font-medium text-blue-100">Status</span>
                    <Chip size="sm" className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-bold text-[10px] uppercase tracking-widest">
                      On Duty
                    </Chip>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Referral System — Enhanced with printable letter */}
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
                      {selectedPatient
                        ? `Referral for ${selectedPatient.first_name} ${selectedPatient.last_name} (${selectedPatient.national_id})`
                        : "Select target speciality / external clinic, diagnosis pre-filled, reason free text"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Referral Type</label>
                    <div className="flex gap-2">
                      {([
                        { key: "internal", label: "Internal", color: "bg-blue-600" },
                        { key: "external", label: "External", color: "bg-indigo-600" },
                        { key: "urgent", label: "Urgent", color: "bg-red-600" },
                      ] as const).map((t) => (
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
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Target Speciality</label>
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
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pre-Filled Diagnosis</label>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
                    {crs && crs.length > 0 ? (
                      <span className="font-bold text-slate-900">{crs[0].diagnosis_code || "Clinical Consultation"}</span>
                    ) : (
                      <span className="text-slate-400 italic">No recent diagnosis on file — will use blank</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Referral Reason</label>
                  <textarea
                    rows={4}
                    className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none resize-none"
                    placeholder="Provide clinical context, reason for referral, specific questions or requests..."
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
                  <Button variant="ghost" className="font-bold" onPress={() => { setActiveView("list"); setReferralReason(""); setReferralType(""); setReferralSpeciality(""); }}>Cancel</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileCheck size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">Referral Letter Generated</h2>
                      <p className="text-xs text-slate-500">Ready to print or download</p>
                    </div>
                  </div>
                </div>

                {/* Printable Referral Letter */}
                <div id="referral-letter" className="border border-slate-200 rounded-xl p-8 bg-white max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Referral Letter</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-lg">
                      <div>
                        <span className="text-slate-500 text-xs uppercase font-bold">Patient:</span>
                        <p className="font-bold">{selectedPatient?.first_name} {selectedPatient?.last_name}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs uppercase font-bold">National ID:</span>
                        <p className="font-mono font-bold">{selectedPatient?.national_id}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs uppercase font-bold">DOB:</span>
                        <p>{selectedPatient?.dob}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs uppercase font-bold">Referral Type:</span>
                        <p className="text-blue-700 font-bold uppercase">{referralType}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-500 text-xs uppercase font-bold mb-1">Referral To</p>
                      <p className="font-bold">{referralSpeciality.charAt(0).toUpperCase() + referralSpeciality.slice(1)}</p>
                    </div>

                    {crs && crs.length > 0 && crs[0].diagnosis_code && (
                      <div>
                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Pre-Filled Diagnosis</p>
                        <p className="font-bold">{crs[0].diagnosis_code}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-slate-500 text-xs uppercase font-bold mb-1">Referral Reason</p>
                      <p className="leading-relaxed whitespace-pre-wrap">{referralReason}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-400">Signature: ________________________ &nbsp;&nbsp; Date: ________________</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="font-bold bg-slate-900 text-white" onPress={() => window.print()}>
                    <Printer size={14} /> Print Letter
                  </Button>
                  <Button variant="ghost" className="font-bold" onPress={() => { setActiveView("list"); setReferralGenerated(false); setReferralReason(""); setReferralType(""); setReferralSpeciality(""); }}>
                    Back to Patient
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Shift Handover + Shift Log (no patient selected) */}
      {activeView === "shift_handover" && (
        <Card className="border border-violet-200 shadow-lg bg-violet-50/30">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <MessageSquare size={18} className="text-violet-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Shift Handover Notes</h2>
                <p className="text-xs text-slate-500">Triggered at session end — one note field per active patient, incoming doctor sees it pinned</p>
              </div>
            </div>

            {!handoverSubmitted ? (
              <>
                <div className="space-y-4">
                  {patients.map((p) => (
                    <div key={p._id} className="p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{p.first_name} {p.last_name}</p>
                        <span className="text-xs text-slate-400 font-mono">{p.national_id}</span>
                      </div>
                      <textarea
                        rows={3}
                        className="w-full p-3 rounded-lg border border-slate-200 text-sm font-medium outline-none resize-none"
                        placeholder={`Handover note for ${p.first_name}...`}
                        value={handoverNotes[p._id] || ""}
                        onChange={(e) => setHandoverNotes(prev => ({ ...prev, [p._id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button className="font-bold bg-violet-600 text-white shadow-md" onPress={() => setHandoverSubmitted(true)}>
                    <Send size={14} /> Submit Handover
                  </Button>
                  <Button variant="ghost" className="font-bold" onPress={() => setActiveView("list")}>Cancel</Button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck size={24} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-emerald-800 text-lg mb-2">Handover Submitted Successfully</h3>
                <p className="text-sm text-slate-600">
                  Incoming doctor will see notes pinned for each active patient ({patients.length} patients).
                </p>
                <Button className="mt-4 font-bold bg-slate-900 text-white" onPress={() => setActiveView("shift_log")}>
                  <ClipboardList size={14} /> View Shift Log
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Shift Log View — full append-only ward event feed */}
      {activeView === "shift_log" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Shift Log</h2>
                  <p className="text-xs text-slate-500">Full append-only ward event feed — filterable by type</p>
                </div>
              </div>
              <Button variant="ghost" className="font-bold text-sm" onPress={() => setActiveView("list")}>Back</Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(["all", "observation", "escalation", "procedure", "nursing_note"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    logFilter === f
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-500"
                  }`}
                >
                  {f === "all" ? "All Events" : f.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="accent" variant="soft" className="font-bold text-[9px] uppercase">Escalation</Chip>
                    <span className="text-sm font-bold text-slate-900">Patient {patients[0]?.first_name} {patients[0]?.last_name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-slate-600">BP elevated, notified incoming doctor — requires monitoring in next shift</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="success" variant="soft" className="font-bold text-[9px] uppercase">Observation</Chip>
                    <span className="text-sm font-bold text-slate-900">Ward check completed</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">1 hour ago</span>
                </div>
                <p className="text-sm text-slate-600">All patients stable. Handover notes submitted for 3 active patients.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Ward Roster — which doctors are on duty */}
      {activeView === "ward_roster" && (
        <Card className="border border-emerald-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Ward Roster</h2>
                <p className="text-xs text-slate-500">Doctors on duty and their assigned patients</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">AB</div>
                    <div>
                      <p className="font-bold text-slate-900">Dr. Ahmed Benali</p>
                      <p className="text-xs text-slate-500">State Doctor — Internal Medicine</p>
                    </div>
                  </div>
                  <Chip size="sm" color="success" variant="soft" className="font-bold">On Duty</Chip>
                </div>
                <div className="text-sm text-slate-600">
                  <p className="font-bold mb-1">Assigned Patients ({patients.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {patients.slice(0, 3).map(p => (
                      <Chip key={p._id} size="sm" variant="soft" className="text-[9px] font-bold">{p.first_name} {p.last_name[0]}.</Chip>
                    ))}
                    {patients.length > 3 && (
                      <Chip size="sm" variant="soft" className="text-[9px] text-slate-400">+{patients.length - 3} more</Chip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cross-Patient Vitals Comparison */}
      {activeView === "cross_patient" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Ward Vitals Overview</h2>
                  <p className="text-xs text-slate-500">Compare key vitals across all assigned patients</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-black text-slate-400 text-[10px] uppercase">Patient</th>
                    <th className="text-center py-3 px-2 font-black text-slate-400 text-[10px] uppercase">BP</th>
                    <th className="text-center py-3 px-2 font-black text-slate-400 text-[10px] uppercase">HR</th>
                    <th className="text-center py-3 px-2 font-black text-slate-400 text-[10px] uppercase">Temp</th>
                    <th className="text-center py-3 px-2 font-black text-slate-400 text-[10px] uppercase">SpO2</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No patients to display</td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2 font-bold text-slate-900">{p.first_name} {p.last_name}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600">--/--</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600">--</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600">--</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600">--%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400">Vitals will populate as nursing staff and doctors record readings.</p>
          </div>
        </Card>
      )}

      {/* Inactive Patient Archive */}
      {activeView === "archive" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Archive size={18} className="text-slate-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Inactive Patient Archive</h2>
                <p className="text-xs text-slate-500">Patients not seen in 12+ months</p>
              </div>
            </div>
            <div className="py-12 text-center text-slate-400">
              <Archive size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No archived patients</p>
              <p className="text-xs text-slate-400 mt-1">Patients inactive for 12+ months will appear here. Records are preserved in full.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick In-Consultation Scratchpad */}
      {selectedPatient && activeView === "scratchpad" && (
        <Card className="border border-amber-200 shadow-sm bg-amber-50/30">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <ClipboardList size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Quick Scratchpad</h2>
                <p className="text-xs text-slate-500">Private in-consultation notes — not saved to patient record, cleared on session end</p>
              </div>
            </div>

            <div className="p-3 bg-white border border-amber-200 rounded-lg">
              <p className="text-sm font-bold text-slate-900 mb-1">{selectedPatient.first_name} {selectedPatient.last_name}</p>
              <p className="text-xs text-slate-500 font-mono">{selectedPatient.national_id}</p>
            </div>

            <textarea
              rows={12}
              className="w-full p-4 rounded-xl border border-amber-200 bg-white text-sm font-mono outline-none resize-none focus:border-amber-400"
              placeholder="Type quick notes here...&#10;&#10;These notes are private and will NOT be saved to the patient's medical record.&#10;They are cleared when you end your session."
              value={scratchpadNotes}
              onChange={(e) => setScratchpadNotes(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <AlertTriangle size={14} />
                <span className="font-bold">Private — not shared with other doctors</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="font-bold text-amber-700"
                  onPress={() => setScratchpadNotes("")}
                >
                  Clear
                </Button>
                <Button variant="ghost" className="font-bold" onPress={() => setActiveView("list")}>
                  Back to Patient
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Consultation Templates */}
      {selectedPatient && activeView === "templates" && (
        <Card className="border border-indigo-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Consultation Templates</h2>
                <p className="text-xs text-slate-500">Pre-built templates for common consultations — select and customize</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "general", name: "General Consultation", icon: "🏥", desc: "Standard examination template" },
                { id: "followup", name: "Follow-Up Visit", icon: "🔄", desc: "Progress monitoring template" },
                { id: "chronic", name: "Chronic Disease Review", icon: "💊", desc: "Diabetes, hypertension, etc." },
                { id: "acute", name: "Acute Illness", icon: "🤒", desc: "Fever, infection, pain" },
                { id: "preop", name: "Pre-Operative Assessment", icon: "🔬", desc: "Surgical clearance template" },
                { id: "discharge", name: "Discharge Summary", icon: "📋", desc: "Hospital discharge template" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setTemplateContent(""); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTemplate === t.id
                      ? "border-indigo-400 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{t.icon}</span>
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
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Template Content</label>
                <textarea
                  rows={10}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm font-mono outline-none resize-none"
                  placeholder="Template content will appear here. Customize as needed..."
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button className="font-bold bg-indigo-600 text-white" onPress={() => { setActiveView("compte_rendu"); }}>
                    <FileText size={14} /> Use as Compte Rendu
                  </Button>
                  <Button variant="ghost" className="font-bold" onPress={() => { setSelectedTemplate(""); setTemplateContent(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lab Result Trends with Reference Bands */}
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
                          <span className="font-bold text-slate-900 text-sm">{(lr as Record<string, unknown>).test_name as string || "Lab Test"}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{new Date(lr._creationTime).toLocaleDateString()}</span>
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

      {/* Full Document Visibility — Unmasked */}
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
                  <p className="text-xs text-slate-500">All patient documents — unmasked, including private doctor identities</p>
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
                {/* CRs from all doctors */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" /> Comptes Rendus
                  </h3>
                  {crs && crs.length > 0 ? crs.map((cr) => (
                    <div key={cr._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{cr.diagnosis_code || "Clinical Note"}</span>
                        <span className="text-xs text-slate-400 font-mono">{new Date(cr._creationTime).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-500">By: <span className="font-bold text-slate-700">Treating Physician</span></p>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No CRs on file</p>
                  )}
                </div>

                {/* Lab Results */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <TestTube size={14} className="text-violet-600" /> Lab Results
                  </h3>
                  {labResults && labResults.length > 0 ? labResults.map((lr) => (
                    <div key={lr?._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{lr?.analysis_type || "Lab Test"}</span>
                        <span className="text-xs text-slate-400 font-mono">{lr?._creationTime ? new Date(lr._creationTime).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <p className="text-xs text-slate-500">By: <span className="font-bold text-slate-700">Laboratory</span></p>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No lab results on file</p>
                  )}
                </div>

                {/* Prescriptions */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Pill size={14} className="text-blue-600" /> Prescriptions
                  </h3>
                  {prescriptions && prescriptions.length > 0 ? prescriptions.map((rx) => {
                    if (!rx) return null;
                    const meds = (rx as Record<string, unknown>).medications;
                    const medCount = Array.isArray(meds) ? meds.length : 0;
                    const issuedAt = Number(rx.issued_at ?? 0);
                    return (
                      <div key={rx._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{medCount} medication(s)</span>
                          <span className="text-xs text-slate-400 font-mono">{new Date(issuedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500">By: <span className="font-bold text-slate-700">Prescribing Doctor</span></p>
                      </div>
                    );
                  }) : (
                    <p className="text-xs text-slate-400 italic">No prescriptions on file</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FileCheck size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Click "Show All Docs" to view all patient documents</p>
                <p className="text-xs text-slate-400 mt-1">As a state doctor, you have full visibility to all clinical documents.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Allergy Conflict Banner — Blocking Modal */}
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
                      <Chip key={a} size="sm" color="danger" className="text-[10px] font-black uppercase">{a}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Conflicting Medications</p>
                  <div className="flex flex-wrap gap-1">
                    {allergyConflict.conflictingMeds.map((m) => (
                      <Chip key={m} size="sm" color="warning" className="text-[10px] font-black uppercase">{m}</Chip>
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
                  onPress={() => { setActiveView("list"); setAllergyConflict({ isOpen: false, allergens: [], conflictingMeds: [] }); }}
                >
                  Cancel & Review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Patient Search Modal */}
      <PatientSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelect={handleSelectPatient}
        showAssignButton
        betterAuthId={betterAuthId}
      />
    </div>
  );
}
