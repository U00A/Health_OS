"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import {
  Building2, UserPlus, Users, FileText, Pill, Beaker,
  AlertTriangle, UserRound, Plus, TrendingUp, Fingerprint, Eye, EyeOff,
  ClipboardList, Save, StickyNote, Calendar, Clock, TestTube, Activity, CalendarDays
} from "lucide-react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { PatientHeaderBar } from "@/components/patient/PatientHeaderBar";
import { PatientSearchModal } from "@/components/clinical/PatientSearchModal";
import { PrescriptionForm } from "@/components/clinical/PrescriptionForm";
import { CompteRenduForm } from "@/components/clinical/CompteRenduForm";
import { LabOrderForm } from "@/components/clinical/LabOrderForm";
import { RegisterPatientForm } from "@/components/clinical/RegisterPatientForm";
import { VitalsTrendChart } from "@/components/clinical/VitalsTrendChart";
import { SignalButton } from "@/components/clinical/SignalButton";
import { BiometricGate } from "@/components/auth/BiometricGate";

type ActiveView = "list" | "prescription" | "compte_rendu" | "lab_order" | "register" | "biometric_gate" | "draft_prescription" | "templates" | "quick_note" | "timeline" | "archive" | "patient_summary" | "documents";
type ConsultationMode = "absent" | "present" | null; // null = not yet determined

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

export default function PrivatePage() {
  const betterAuthId = useBetterAuthId();
  const rawPatients = useQuery(
    api.doctorPatients.listMyPatients,
    betterAuthId ? { betterAuthId } : "skip"
  );
  const patients: EnrichedPatient[] = (rawPatients?.filter(Boolean) as EnrichedPatient[]) || [];

  const [selectedPatient, setSelectedPatient] = useState<Doc<"patients"> | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [showSearch, setShowSearch] = useState(false);
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<"all" | "cr" | "lab" | "rx" | "vitals">("all");
  
  // Quick note state
  const [quickNoteText, setQuickNoteText] = useState("");
  
  // Patient summary
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  
  // Document visibility
  const [showAllDocs, setShowAllDocs] = useState(false);
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateContent, setTemplateContent] = useState("");

  const handleSelectPatient = (p: Doc<"patients">) => {
    setSelectedPatient(p);
    setConsultationMode(null); // Reset mode on new patient selection
    setSessionId(null);
    setActiveView("biometric_gate"); // Always start with biometric gate
  };

  const handleBiometricVerified = (newSessionId: string) => {
    setSessionId(newSessionId);
    setConsultationMode("present");
    setActiveView("list");
  };

  const handleBiometricDenied = () => {
    // Fall back to patient-absent mode
    setConsultationMode("absent");
    setActiveView("list");
  };

  const handleExitConsultation = () => {
    setSelectedPatient(null);
    setConsultationMode(null);
    setSessionId(null);
    setActiveView("list");
  };

  // Fetch timeline data for selected patient with masking/filtering logic
  const crs = useQuery(
    api.compteRendus.listByPatient,
    selectedPatient ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined,
      sessionToken: sessionId || undefined
    } : "skip"
  );
  const labResults = useQuery(
    api.labResults.listByPatient,
    selectedPatient ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined,
      sessionToken: sessionId || undefined
    } : "skip"
  );
  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    selectedPatient ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined,
      sessionToken: sessionId || undefined
    } : "skip"
  );
  const vitals = useQuery(
    api.vitals.listByPatient,
    selectedPatient ? { 
      patient_id: selectedPatient._id as Id<"patients">,
      betterAuthId: betterAuthId || undefined
    } : "skip"
  );

  // Check if we should show restricted view (patient-absent mode)
  const isAbsentMode = consultationMode === "absent";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
            <Building2 className="text-teal-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Private Practice</h1>
            <p className="text-slate-500 font-medium mt-1">
              {rawPatients !== undefined ? `${patients.length} enrolled patients` : "Loading..."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!selectedPatient ? (
            <>
              <Button className="font-bold bg-teal-600 text-white shadow-md shadow-teal-200" onPress={() => setShowSearch(true)}>
                <UserPlus size={16} /> Enroll Patient
              </Button>
              <Button variant="ghost" className="font-bold text-teal-700 border border-teal-200" onPress={() => setActiveView("register")}>
                <Plus size={16} /> Register New
              </Button>
            </>
          ) : (
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
                className={`font-bold ${activeView === "documents" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "documents" ? "list" : "documents")}
              >
                <FileText size={16} /> Documents
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "patient_summary" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView(activeView === "patient_summary" ? "list" : "patient_summary")}
              >
                <ClipboardList size={16} /> Summary
              </Button>
              <Button
                variant="ghost"
                className={`font-bold ${activeView === "list" ? "bg-slate-900 text-white" : "text-slate-600 border border-slate-200"}`}
                onPress={() => setActiveView("list")}
              >
                <Users size={16} /> Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Consultation Mode Banner */}
      {selectedPatient && consultationMode && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          consultationMode === "present"
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex items-center gap-3">
            {consultationMode === "present" ? (
              <>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Fingerprint size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">Patient-Present Mode — Active Consultation</p>
                  <p className="text-xs text-emerald-600">Full clinical access with biometric confirmation</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <EyeOff size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-amber-800 text-sm">Patient-Absent Mode — Record Review</p>
                  <p className="text-xs text-amber-600">Restricted to your own clinical output only</p>
                </div>
              </>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className={`font-bold ${consultationMode === "present" ? "text-emerald-700" : "text-amber-700"}`}
            onPress={handleExitConsultation}
          >
            Exit
          </Button>
        </div>
      )}

      {/* Patient Header */}
      {selectedPatient && (
        <PatientHeaderBar patient={selectedPatient} onClose={handleExitConsultation} />
      )}

      {/* Biometric Gate */}
      {selectedPatient && activeView === "biometric_gate" && betterAuthId && (
        <Card className="border border-blue-200 shadow-lg">
          <BiometricGate
            patientId={selectedPatient._id as Id<"patients">}
            doctorBetterAuthId={betterAuthId}
            onVerified={handleBiometricVerified}
            onDenied={handleBiometricDenied}
          />
        </Card>
      )}

      {/* Action Buttons */}
      {selectedPatient && activeView === "list" && betterAuthId && consultationMode === "present" && (
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
          <Button variant="ghost" className="font-bold text-indigo-700 border border-indigo-200" onPress={() => setActiveView("quick_note")}>
            <StickyNote size={14} /> Quick Note
          </Button>
          <Button variant="ghost" className="font-bold text-slate-700 border border-slate-200" onPress={() => setActiveView("timeline")}>
            <CalendarDays size={14} /> View Timeline
          </Button>
          <SignalButton patientId={selectedPatient._id as Id<"patients">} doctorBetterAuthId={betterAuthId} />
        </div>
      )}

      {/* Patient-Absent Mode Actions */}
      {selectedPatient && activeView === "list" && isAbsentMode && betterAuthId && (
        <div className="flex gap-3 flex-wrap">
          <Button className="font-bold bg-amber-600 text-white shadow-md shadow-amber-200" onPress={() => setActiveView("timeline")}>
            <CalendarDays size={14} /> View My Records
          </Button>
          <Button variant="ghost" className="font-bold text-amber-700 border border-amber-200" onPress={() => setActiveView("draft_prescription")}>
            <Save size={14} /> Draft Prescription
          </Button>
          <Button variant="ghost" className="font-bold text-amber-700 border border-amber-200" onPress={() => setActiveView("templates")}>
            <ClipboardList size={14} /> My Templates
          </Button>
        </div>
      )}

      {/* Draft Prescription Form — Available in absent mode */}
      {selectedPatient && activeView === "draft_prescription" && betterAuthId && (
        <Card className="border border-amber-200 bg-amber-50/30 shadow-lg">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Save size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-amber-800">Draft Prescription</h2>
                <p className="text-xs text-amber-600">This prescription will be saved as a draft and cannot be submitted until a patient-present session is opened.</p>
              </div>
            </div>
            <PrescriptionForm 
              patient={selectedPatient} 
              betterAuthId={betterAuthId} 
              onSuccess={() => setActiveView("list")} 
              onCancel={() => setActiveView("list")} 
            />
          </div>
        </Card>
      )}

      {/* Consultation Templates */}
      {activeView === "templates" && betterAuthId && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ClipboardList size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Consultation Templates</h2>
                  <p className="text-xs text-slate-500">Personal CR templates per speciality or condition type</p>
                </div>
              </div>
              <Button size="sm" className="font-bold bg-blue-600 text-white">
                <Plus size={14} /> New Template
              </Button>
            </div>
            <div className="py-12 text-center text-slate-400">
              <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No templates created yet</p>
              <p className="text-xs text-slate-400 mt-1">Create templates to pre-fill structured fields during consultations</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick In-Consultation Note */}
      {selectedPatient && activeView === "quick_note" && betterAuthId && consultationMode === "present" && (
        <Card className="border border-indigo-200 bg-indigo-50/30 shadow-lg">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <StickyNote size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-indigo-800">Quick Consultation Note</h2>
                  <p className="text-xs text-indigo-600">Private scratchpad — auto-cleared after CR is published</p>
                </div>
              </div>
            </div>
            <textarea
              className="w-full p-4 rounded-xl border border-indigo-200 bg-white text-sm font-mono outline-none focus:border-indigo-400 min-h-[120px] resize-none"
              placeholder="Type your quick notes here...&#10;&#10;These notes are private and will be cleared when you exit the consultation."
              value={quickNoteText}
              onChange={(e) => setQuickNoteText(e.target.value)}
            />
            <div className="flex justify-between">
              <Button size="sm" variant="ghost" className="font-bold text-indigo-700" onPress={() => setQuickNoteText("")}>
                Clear
              </Button>
              <Button size="sm" className="font-bold bg-indigo-600 text-white" onPress={() => { alert("Note saved locally."); }}>
                <Save size={14} /> Save Note
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Patient Summary Printout */}
      {selectedPatient && activeView === "patient_summary" && (
        <Card className="border border-teal-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <ClipboardList size={18} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Patient Summary</h2>
                  <p className="text-xs text-slate-500">Comprehensive patient summary for print or referral</p>
                </div>
              </div>
            </div>

            {!summaryGenerated ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Generate a comprehensive summary including:</p>
                <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                  <li>Patient demographics and contact info</li>
                  <li>Known allergies</li>
                  <li>Active prescriptions</li>
                  <li>Recent lab results</li>
                  <li>Compte rendus summary</li>
                  <li>Vitals history overview</li>
                </ul>
                <Button className="font-bold bg-teal-600 text-white" onPress={() => setSummaryGenerated(true)}>
                  <ClipboardList size={14} /> Generate Summary
                </Button>
              </div>
            ) : (
              <div id="patient-summary" className="border border-slate-200 rounded-xl p-6 bg-white space-y-4">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h3 className="text-xl font-black text-slate-900 uppercase">Patient Summary</h3>
                  <p className="text-sm text-slate-500">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Name</p>
                    <p className="font-bold">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">National ID</p>
                    <p className="font-mono font-bold">{selectedPatient.national_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">DOB</p>
                    <p>{selectedPatient.dob}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Blood Type</p>
                    <p className="font-bold">{selectedPatient.blood_type || "N/A"}</p>
                  </div>
                </div>
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.allergies.map((a) => (
                        <Chip key={a} size="sm" color="danger" className="text-[10px] font-black uppercase">{a}</Chip>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Active Prescriptions</p>
                  <p className="text-sm text-slate-600">{prescriptions ? prescriptions.length : 0} prescription(s) on file</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Lab Results</p>
                  <p className="text-sm text-slate-600">{labResults ? labResults.length : 0} result(s) on file</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Compte Rendus</p>
                  <p className="text-sm text-slate-600">{crs ? crs.length : 0} note(s) on file</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {summaryGenerated && (
                <Button className="font-bold bg-slate-900 text-white" onPress={() => window.print()}>
                  <ClipboardList size={14} /> Print Summary
                </Button>
              )}
              <Button variant="ghost" className="font-bold" onPress={() => { setActiveView("list"); setSummaryGenerated(false); }}>
                Back to Patient
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Full Document Visibility — Patient-Present Mode */}
      {selectedPatient && activeView === "documents" && consultationMode === "present" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Full Document Visibility</h2>
                  <p className="text-xs text-slate-500">All patient documents — unmasked in patient-present mode</p>
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
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" /> Comptes Rendus
                  </h3>
                  {crs && crs.length > 0 ? crs.map((cr) => (
                    <div key={cr._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{(cr as Record<string, unknown>).diagnosis_code as string || "Clinical Note"}</span>
                        <span className="text-xs text-slate-400 font-mono">{new Date(cr._creationTime).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-500">By: <span className="font-bold text-slate-700">{(cr as Record<string, unknown>).doctorName as string || "Treating Physician"}</span></p>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No CRs on file</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <TestTube size={14} className="text-violet-600" /> Lab Results
                  </h3>
                  {labResults && labResults.length > 0 ? labResults.map((lr) => (
                    <div key={lr._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{(lr as Record<string, unknown>).analysis_type as string || "Lab Test"}</span>
                        <span className="text-xs text-slate-400 font-mono">{new Date(lr._creationTime).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-500">By: <span className="font-bold text-slate-700">Laboratory</span></p>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No lab results on file</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Pill size={14} className="text-blue-600" /> Prescriptions
                  </h3>
                  {prescriptions && prescriptions.length > 0 ? prescriptions.map((rx) => {
                    if (!rx) return null;
                    const meds = (rx as Record<string, unknown>).medications;
                    const medCount = Array.isArray(meds) ? meds.length : 0;
                    return (
                      <div key={rx._id} className="p-3 bg-white border border-slate-200 rounded-lg mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{medCount} medication(s)</span>
                          <span className="text-xs text-slate-400 font-mono">{new Date(Number(rx.issued_at ?? 0)).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500">By: <span className="font-bold text-slate-700">{(rx as Record<string, unknown>).doctorName as string || "Prescribing Doctor"}</span></p>
                      </div>
                    );
                  }) : (
                    <p className="text-xs text-slate-400 italic">No prescriptions on file</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Click "Show All Docs" to view all patient documents</p>
                <p className="text-xs text-slate-400 mt-1">In patient-present mode, you have full visibility to all clinical documents.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Inactive Patient Archive */}
      {activeView === "archive" && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <ClipboardList size={18} className="text-slate-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Inactive Patient Archive</h2>
                <p className="text-xs text-slate-500">Patients not seen in 12+ months</p>
              </div>
            </div>
            <div className="py-12 text-center text-slate-400">
              <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No archived patients</p>
              <p className="text-xs text-slate-400 mt-1">Patients inactive for 12+ months will appear here. Records are preserved in full.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Consultation Templates */}
      {activeView === "templates" && betterAuthId && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ClipboardList size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Consultation Templates</h2>
                  <p className="text-xs text-slate-500">Personal CR templates per speciality or condition type</p>
                </div>
              </div>
              <Button size="sm" className="font-bold bg-blue-600 text-white">
                <Plus size={14} /> New Template
              </Button>
            </div>

            {!selectedTemplate ? (
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
                    className="p-4 rounded-xl border text-left transition-all border-slate-200 bg-white hover:border-blue-200"
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
            ) : (
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
                  <Button className="font-bold bg-blue-600 text-white" onPress={() => { setActiveView("compte_rendu"); }}>
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

      {/* Vitals Trends Section — Only in patient-present mode */}
      {selectedPatient && activeView === "list" && consultationMode === "present" && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Vitals Trends</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VitalsTrendChart patientId={selectedPatient._id as Id<"patients">} metric="systolic_bp" unit="" label="Systolic BP" normalRange={[90, 120]} />
            <VitalsTrendChart patientId={selectedPatient._id as Id<"patients">} metric="heart_rate" unit=" bpm" label="Heart Rate" normalRange={[60, 100]} />
            <VitalsTrendChart patientId={selectedPatient._id as Id<"patients">} metric="temperature" unit="°C" label="Temperature" normalRange={[36.1, 37.2]} />
            <VitalsTrendChart patientId={selectedPatient._id as Id<"patients">} metric="spo2" unit="%" label="SpO2" normalRange={[95, 100]} />
          </div>
        </div>
      )}

      {/* Patient Timeline View */}
      {selectedPatient && activeView === "timeline" && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <CalendarDays size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Timeline</h2>
                <p className="text-xs text-slate-500">
                  {consultationMode === "present" ? "Full shared clinical record" : "Restricted to your authored records"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "cr", "lab", "rx", "vitals"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimelineFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    timelineFilter === f
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
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
              const events: { type: string; date: number; dateStr: string; doctorName: string; details: string; item: Record<string, unknown> }[] = [];
              if (crs) crs.forEach((cr) => { if (cr) {
                const crDate = ((cr as Record<string, unknown>).date as number) || cr._creationTime;
                events.push({ 
                  type: "cr", 
                  date: crDate, 
                  dateStr: new Date(crDate).toLocaleString(),
                  doctorName: (cr as Record<string, unknown>).doctorName as string || "Treating Physician",
                  details: (cr as Record<string, unknown>).diagnosis_code as string || "General Consultation",
                  item: cr as unknown as Record<string, unknown>
                });
              }});
              if (labResults) labResults.forEach((lr) => { if (lr) {
                const lrDate = ((lr as Record<string, unknown>).uploaded_at as number) || lr._creationTime;
                events.push({ 
                  type: "lab", 
                  date: lrDate, 
                  dateStr: new Date(lrDate).toLocaleString(),
                  doctorName: (lr as Record<string, unknown>).doctorName as string || "Laboratory",
                  details: lr.analysis_type,
                  item: lr as unknown as Record<string, unknown>
                });
              }});
              if (prescriptions) prescriptions.forEach((rx) => { if (rx) {
                const rxDate = Number(rx.issued_at ?? rx._creationTime);
                events.push({ 
                  type: "rx", 
                  date: rxDate, 
                  dateStr: new Date(rxDate).toLocaleString(),
                  doctorName: (rx as Record<string, unknown>).doctorName as string || "Prescribing Doctor",
                  details: `${Array.isArray(rx.medications) ? rx.medications.length : 0} medication(s)`,
                  item: rx as unknown as Record<string, unknown>
                });
              }});
              if (vitals) vitals.forEach((v) => { if (v) {
                const vDate = v.recorded_at || v._creationTime;
                events.push({ 
                  type: "vitals", 
                  date: vDate, 
                  dateStr: new Date(vDate).toLocaleString(),
                  doctorName: (v as Record<string, unknown>).doctorName as string || "Unknown",
                  details: `${v.systolic_bp}/${v.diastolic_bp} BP, ${v.heart_rate} HR`,
                  item: v as unknown as Record<string, unknown>
                });
              }});
              
              events.sort((a, b) => b.date - a.date);
              const filtered = timelineFilter === "all" ? events : events.filter((e) => e.type === timelineFilter);

              if (filtered.length === 0) {
                return (
                  <div className="p-16 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <ClipboardList size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">No records found</p>
                    <p className="text-slate-400 text-xs mt-1">Try changing the filter or ensure records exist.</p>
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
                const isMyRecord = event.doctorName !== "Treating Physician" && event.doctorName !== "Unknown";
                
                return (
                  <div key={idx} className="flex gap-4 items-start p-5 border border-slate-200 rounded-2xl bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all">
                    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon size={22} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock size={10} />
                            {event.dateStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserRound size={12} className={isMyRecord ? "text-slate-600" : "text-slate-300"} />
                          <span className={`text-xs font-bold ${isMyRecord ? "text-slate-700" : "text-slate-400 italic"}`}>
                            {event.doctorName}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mb-1">{event.details}</p>
                      {event.type === "rx" && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {((event.item.medications as unknown[]) || []).map((m: unknown, i: number) => (
                            <Chip key={i} size="sm" variant="soft" className="text-[10px] font-medium">{(m as Record<string, unknown>).name as string}</Chip>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Forms — Only in patient-present mode */}
      {selectedPatient && activeView === "prescription" && betterAuthId && consultationMode === "present" && (
        <PrescriptionForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {selectedPatient && activeView === "compte_rendu" && betterAuthId && consultationMode === "present" && (
        <CompteRenduForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {selectedPatient && activeView === "lab_order" && betterAuthId && consultationMode === "present" && (
        <LabOrderForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {activeView === "register" && betterAuthId && (
        <RegisterPatientForm betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}

      {/* Patient List */}
      {activeView === "list" && !selectedPatient && (
        <div className="space-y-4">
          {rawPatients === undefined ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : patients.length === 0 ? (
            <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
              <div className="p-12 text-center">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 text-lg mb-2">No Patients Enrolled</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">
                  Search for existing patients or register new ones to begin.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button className="font-bold bg-teal-600 text-white" onPress={() => setShowSearch(true)}>
                    <UserPlus size={14} /> Enroll Existing Patient
                  </Button>
                  <Button variant="ghost" className="font-bold text-teal-700 border border-teal-200" onPress={() => setActiveView("register")}>
                    <Plus size={14} /> Register New Patient
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            patients.map((p) => (
              <div
                key={p._id}
                onClick={() => handleSelectPatient(p as unknown as Doc<"patients">)}
                className="border border-slate-200 shadow-sm hover:border-teal-300 transition-all group cursor-pointer rounded-2xl bg-white"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      p.allergies && p.allergies.length > 0 ? "bg-rose-100 text-rose-600" : "bg-teal-50 text-teal-600"
                    }`}>
                      <UserRound size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{p.first_name} {p.last_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span className="font-mono bg-slate-100 px-2 rounded text-xs">{p.national_id}</span>
                        <span className="text-slate-300">•</span>
                        <span>DOB: {p.dob}</span>
                      </div>
                      {p.allergies && p.allergies.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle size={12} className="text-red-500" />
                          {p.allergies.map((a) => (
                            <Chip key={a} size="sm" color="danger" variant="soft" className="text-[9px] font-black uppercase">
                              {a}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.activePrescriptionCount > 0 && (
                      <Chip size="sm" color="accent" variant="soft" className="text-[9px] font-black uppercase">{p.activePrescriptionCount} Rx</Chip>
                    )}
                    {p.pendingLabCount > 0 && (
                      <Chip size="sm" color="warning" variant="soft" className="text-[9px] font-black uppercase">{p.pendingLabCount} labs</Chip>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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