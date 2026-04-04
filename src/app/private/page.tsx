"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import {
  Building2, UserPlus, Users, FileText, Pill, Beaker,
  AlertTriangle, UserRound, Plus, TrendingUp, Fingerprint, Eye, EyeOff,
  ClipboardList, Save, StickyNote, Calendar
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

type ActiveView = "list" | "prescription" | "compte_rendu" | "lab_order" | "register" | "biometric_gate" | "draft_prescription" | "templates" | "quick_note";
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
          <Button className="font-bold bg-teal-600 text-white shadow-md shadow-teal-200" onPress={() => setShowSearch(true)}>
            <UserPlus size={16} /> Enroll Patient
          </Button>
          <Button variant="ghost" className="font-bold text-teal-700 border border-teal-200" onPress={() => setActiveView("register")}>
            <Plus size={16} /> Register New
          </Button>
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
          <SignalButton patientId={selectedPatient._id as Id<"patients">} doctorBetterAuthId={betterAuthId} />
        </div>
      )}

      {/* Patient-Absent Mode Actions */}
      {selectedPatient && activeView === "list" && isAbsentMode && betterAuthId && (
        <div className="flex gap-3 flex-wrap">
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
              className="w-full p-4 rounded-xl border border-indigo-200 bg-white text-sm font-medium outline-none focus:border-indigo-400 min-h-[120px]"
              placeholder="Type your quick notes here..."
            />
            <div className="flex justify-end">
              <Button size="sm" className="font-bold bg-indigo-600 text-white">
                <Save size={14} /> Save Note
              </Button>
            </div>
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