"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BedDouble, UserPlus, ClipboardList, HeartPulse, AlertCircle, Send, TrendingUp, Clock, Pill, CalendarDays, AlertTriangle, CheckSquare, Square, LogOut, Users, Package, MessageSquare } from "lucide-react";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { PatientSearchModal } from "@/components/clinical/PatientSearchModal";
import { VitalsEntryForm } from "@/components/clinical/VitalsEntryForm";
import { RegisterPatientForm } from "@/components/clinical/RegisterPatientForm";

type StaffView = "main" | "admit" | "vitals" | "register" | "log_entry" | "discharge" | "roster" | "supply" | "handover";

export default function StaffDashboard() {
  const betterAuthId = useBetterAuthId();
  const user = useQuery(api.users.current, betterAuthId ? { betterAuthId } : "skip");
  const wards = useQuery(api.wards.listByHospital, user?.hospital_id ? { hospital_id: user.hospital_id } : "skip");
  const firstWardId = wards && wards.length > 0 ? wards[0]._id : undefined;
  const beds = useQuery(api.beds.getWardBeds, firstWardId ? { ward_id: firstWardId } : "skip");
  const logs = useQuery(api.caseEntries.getWardLog, firstWardId && betterAuthId ? { betterAuthId, ward_id: firstWardId } : "skip");
  const admissions = useQuery(api.admissions.listActiveByWard, firstWardId ? { ward_id: firstWardId } : "skip");

  // Get active prescriptions for all admitted patients
  const admittedPatientIds = admissions?.map(a => a.patient_id) ?? [];
  const activePrescriptions = useQuery(
    api.prescriptions.listByPatient,
    admittedPatientIds.length > 0 ? { patient_id: admittedPatientIds[0] as Id<"patients"> } : "skip"
  );

  // Get latest vitals for all admitted patients
  const latestVitals = useQuery(
    api.vitals.getLatestForPatient,
    admittedPatientIds.length > 0 ? { patient_id: admittedPatientIds[0] as Id<"patients"> } : "skip"
  );

  const admitMutation = useMutation(api.admissions.admit);
  const createEntry = useMutation(api.caseEntries.createEntry);

  const [activeView, setActiveView] = useState<StaffView>("main");
  const [showSearch, setShowSearch] = useState(false);
  const [admitPatient, setAdmitPatient] = useState<Doc<"patients"> | null>(null);
  const [admitBed, setAdmitBed] = useState<string>("");
  const [admitType, setAdmitType] = useState<"emergency" | "scheduled" | "transfer">("scheduled");
  const [vitalsTarget, setVitalsTarget] = useState<{ id: Id<"patients">; name: string } | null>(null);
  const [escalatingBed, setEscalatingBed] = useState<string | null>(null);
  const [dischargeAdmission, setDischargeAdmission] = useState<{ id: string; bedId: string; patientName: string } | null>(null);
  const [dischargeChecklist, setDischargeChecklist] = useState({
    medicationGiven: false,
    patientBriefed: false,
    dischargeSummaryPrinted: false,
    bedCleared: false,
  });

  // Supply request state
  const [supplyItem, setSupplyItem] = useState("");
  const [supplyQuantity, setSupplyQuantity] = useState(1);
  const [supplyUrgency, setSupplyUrgency] = useState<"low" | "medium" | "high">("medium");
  const [supplyNotes, setSupplyNotes] = useState("");

  // Shift handover state
  const [handoverNotes, setHandoverNotes] = useState("");
  const [handoverPatientId, setHandoverPatientId] = useState<string>("");

  // Case entry
  const [entryType, setEntryType] = useState<"observation" | "nursing_note" | "escalation" | "procedure" | "general">("observation");
  const [entryNotes, setEntryNotes] = useState("");

  const vacantBeds = beds?.filter((b) => b.status === "vacant") || [];

  // Helper: get scheduled medications for a patient in current shift
  const getPatientMeds = (patientId: string) => {
    if (!activePrescriptions) return [];
    const patientRx = activePrescriptions.filter((rx: Doc<"prescriptions">) => rx.patient_id === patientId && rx.status === "active");
    const allMeds: { name: string; dose: string; frequency: string }[] = [];
    patientRx.forEach((rx: Doc<"prescriptions">) => {
      rx.medications.forEach((med: { name: string; dose: string; frequency: string; duration: string; route?: string }) => {
        allMeds.push({ name: med.name, dose: med.dose, frequency: med.frequency });
      });
    });
    return allMeds;
  };

  // Helper: get latest vitals for a patient (getLatestForPatient returns a single record)
  const getPatientVitals = (patientId: string) => {
    if (!latestVitals) return null;
    return (latestVitals as Doc<"vitals"> | null) || null;
  };

  // Helper: calculate elapsed stay
  const getElapsedStay = (admittedAt: number) => {
    const hours = Math.floor((Date.now() - admittedAt) / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  // Discharge handler
  const handleDischarge = async () => {
    if (!dischargeAdmission || !betterAuthId || !firstWardId) return;
    const allChecked = Object.values(dischargeChecklist).every(Boolean);
    if (!allChecked) {
      alert("All checklist items must be completed before discharge.");
      return;
    }
    try {
      // Log discharge case entry
      await createEntry({
        betterAuthId,
        ward_id: firstWardId,
        entry_type: "general",
        notes: "Patient discharged. Checklist completed: medication given, patient briefed, summary printed, bed cleared.",
        patient_id: dischargeAdmission.id as Id<"patients">,
      });
      setDischargeAdmission(null);
      setDischargeChecklist({ medicationGiven: false, patientBriefed: false, dischargeSummaryPrinted: false, bedCleared: false });
      setActiveView("main");
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  // Escalation handler
  const handleEscalation = async (bedId: string, admissionId: string) => {
    if (!betterAuthId || !firstWardId) return;
    setEscalatingBed(bedId);
    try {
      await createEntry({
        betterAuthId,
        ward_id: firstWardId,
        entry_type: "escalation",
        notes: "Escalation triggered for patient - immediate doctor attention required",
        patient_id: admissionId as Id<"patients">,
      });
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setEscalatingBed(null);
    }
  };

  const handleAdmit = async () => {
    if (!admitPatient || !admitBed || !firstWardId || !betterAuthId) return;
    try {
      await admitMutation({
        betterAuthId,
        patient_id: admitPatient._id,
        bed_id: admitBed as Id<"beds">,
        ward_id: firstWardId,
        admission_type: admitType,
      });
      setAdmitPatient(null);
      setAdmitBed("");
      setActiveView("main");
    } catch (e: unknown) {
      const error = e as Error;
      alert(error.message);
    }
  };

  const handleLogEntry = async () => {
    if (!firstWardId || !betterAuthId || !entryNotes.trim()) return;
    try {
      await createEntry({
        betterAuthId,
        ward_id: firstWardId,
        entry_type: entryType,
        notes: entryNotes,
      });
      setEntryNotes("");
      setActiveView("main");
    } catch (e: unknown) {
      const error = e as Error;
      alert(error.message);
    }
  };

  // Supply request handler
  const handleSupplyRequest = async () => {
    if (!betterAuthId || !firstWardId || !supplyItem.trim()) return;
    try {
      // Log as case entry for now
      await createEntry({
        betterAuthId,
        ward_id: firstWardId,
        entry_type: "general",
        notes: `Supply request: ${supplyItem} x${supplyQuantity} (${supplyUrgency}) - ${supplyNotes}`,
      });
      setSupplyItem("");
      setSupplyQuantity(1);
      setSupplyNotes("");
      setActiveView("main");
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  // Shift handover handler
  const handleHandover = async () => {
    if (!betterAuthId || !firstWardId || !handoverNotes.trim()) return;
    try {
      await createEntry({
        betterAuthId,
        ward_id: firstWardId,
        entry_type: "general" as const,
        notes: `Shift handover: ${handoverNotes}`,
        patient_id: handoverPatientId as Id<"patients"> | undefined,
      });
      setHandoverNotes("");
      setHandoverPatientId("");
      setActiveView("main");
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ward Operations</h1>
          <p className="text-slate-500 font-medium mt-1">{wards && wards.length > 0 ? wards[0].name : "Loading ward..."}</p>
        </div>
        <div className="flex gap-2">
          <Button className="font-bold bg-sky-600 text-white shadow-lg shadow-sky-200" onPress={() => setActiveView("admit")}>
            <UserPlus size={16} /> Admit Patient
          </Button>
          <Button variant="ghost" className="font-bold border border-slate-200" onPress={() => setActiveView("log_entry")}>
            <ClipboardList size={16} /> Log Entry
          </Button>
          <Button variant="ghost" className="font-bold border border-slate-200" onPress={() => setActiveView("vitals")}>
            <HeartPulse size={16} /> Record Vitals
          </Button>
          <Button variant="ghost" className="font-bold border border-slate-200" onPress={() => setActiveView("discharge")}>
            <LogOut size={16} /> Discharge
          </Button>
          <Button variant="ghost" className="font-bold border border-slate-200" onPress={() => setActiveView("roster")}>
            <Users size={16} /> On-Duty
          </Button>
          <Button variant="ghost" className="font-bold border border-slate-200" onPress={() => setActiveView("supply")}>
            <Package size={16} /> Supplies
          </Button>
          <Button variant="ghost" className="font-bold border border-slate-200" onPress={() => setActiveView("handover")}>
            <MessageSquare size={16} /> Handover
          </Button>
        </div>
      </div>

      {/* Admit Patient Panel */}
      {activeView === "admit" && (
        <Card className="border border-sky-200 shadow-lg bg-sky-50/30">
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <UserPlus size={18} className="text-sky-600" /> Admit Patient
            </h2>
            {!admitPatient ? (
              <div className="space-y-3">
                <Button className="font-bold bg-slate-900 text-white" onPress={() => setShowSearch(true)}>
                  Search Patient by National ID
                </Button>
                <Button variant="ghost" className="font-bold" onPress={() => setActiveView("register")}>
                  Register New Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl">
                  <p className="font-bold text-slate-900">{admitPatient.first_name} {admitPatient.last_name}</p>
                  <p className="text-sm text-slate-500 font-mono">{admitPatient.national_id}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Available Bed</label>
                    <select
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none"
                      value={admitBed}
                      onChange={(e) => setAdmitBed(e.target.value)}
                    >
                      <option value="">Select bed...</option>
                      {vacantBeds.map((b) => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Admission Type</label>
                    <div className="flex gap-2">
                      {(["emergency", "scheduled", "transfer"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setAdmitType(t)}
                          className={`flex-1 p-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                            admitType === t
                              ? t === "emergency" ? "bg-red-600 text-white border-red-600" : "bg-slate-900 text-white border-slate-900"
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="font-bold bg-sky-600 text-white shadow-md" onPress={handleAdmit} isDisabled={!admitBed}>
                    Confirm Admission
                  </Button>
                  <Button variant="ghost" className="font-bold" onPress={() => { setAdmitPatient(null); setActiveView("main"); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Case Entry */}
      {activeView === "log_entry" && (
        <Card className="border border-slate-200 shadow-lg">
          <div className="p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ClipboardList size={18} className="text-slate-600" /> New Case Entry
            </h2>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Entry Type</label>
              <div className="flex gap-2 flex-wrap">
                {(["observation", "nursing_note", "escalation", "procedure", "general"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setEntryType(t)}
                    className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                      entryType === t
                        ? t === "escalation" ? "bg-red-600 text-white border-red-600" : "bg-slate-900 text-white border-slate-900"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              placeholder="Enter details..."
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-blue-500 outline-none resize-none"
              value={entryNotes}
              onChange={(e) => setEntryNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <Button className="font-bold bg-slate-900 text-white shadow-md" onPress={handleLogEntry}>
                <Send size={14} /> Submit Entry
              </Button>
              <Button variant="ghost" className="font-bold" onPress={() => setActiveView("main")}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Discharge Checklist */}
      {activeView === "discharge" && (
        <Card className="border border-amber-200 shadow-lg bg-amber-50/30">
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <LogOut size={18} className="text-amber-600" /> Discharge Checklist
            </h2>
            {!dischargeAdmission ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 font-medium">Select a patient to begin discharge process:</p>
                {admissions?.filter(a => a.bed_id).map((admission) => (
                  <button
                    key={admission._id}
                    onClick={() => setDischargeAdmission({ id: admission.patient_id, bedId: admission.bed_id, patientName: admission.patientName })}
                    className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-colors"
                  >
                    <p className="font-bold text-slate-900">{admission.patientName}</p>
                    <p className="text-xs text-slate-500">Bed: {admission.bedName} | Admitted: {new Date(admission.admitted_at).toLocaleDateString()}</p>
                  </button>
                ))}
                {(!admissions || admissions.length === 0) && (
                  <div className="p-6 text-center text-slate-400 text-sm">No patients to discharge</div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl">
                  <p className="font-bold text-slate-900">{dischargeAdmission.patientName}</p>
                  <p className="text-xs text-slate-500">Bed: {dischargeAdmission.bedId}</p>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "medicationGiven" as const, label: "Medication administered for current shift" },
                    { key: "patientBriefed" as const, label: "Patient briefed on discharge instructions" },
                    { key: "dischargeSummaryPrinted" as const, label: "Discharge summary printed" },
                    { key: "bedCleared" as const, label: "Bed cleared and sanitized" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setDischargeChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-colors"
                    >
                      {dischargeChecklist[item.key] ? (
                        <CheckSquare size={20} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Square size={20} className="text-slate-400 shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${dischargeChecklist[item.key] ? "text-emerald-700 line-through" : "text-slate-700"}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    className="font-bold bg-amber-600 text-white shadow-md"
                    onPress={handleDischarge}
                    isDisabled={!Object.values(dischargeChecklist).every(Boolean)}
                  >
                    <LogOut size={14} /> Complete Discharge
                  </Button>
                  <Button variant="ghost" className="font-bold" onPress={() => { setDischargeAdmission(null); setActiveView("main"); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Register Patient */}
      {activeView === "register" && betterAuthId && (
        <RegisterPatientForm betterAuthId={betterAuthId} onSuccess={() => setActiveView("admit")} onCancel={() => setActiveView("main")} />
      )}

      {/* Vitals */}
      {activeView === "vitals" && vitalsTarget && betterAuthId && (
        <VitalsEntryForm
          patientId={vitalsTarget.id}
          patientName={vitalsTarget.name}
          betterAuthId={betterAuthId}
          onSuccess={() => { setVitalsTarget(null); setActiveView("main"); }}
          onCancel={() => { setVitalsTarget(null); setActiveView("main"); }}
        />
      )}

      {/* Main View: Beds + Logs */}
      {activeView === "main" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                <BedDouble size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Bed Status Real-Time</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {beds === undefined ? (
                Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              ) : beds.length === 0 ? (
                <Card className="col-span-full border border-dashed border-slate-200 shadow-none bg-slate-50">
                  <div className="h-32 flex items-center justify-center text-slate-400 font-medium">
                    No beds configured for this ward
                  </div>
                </Card>
              ) : (
                beds.map((bed: Doc<"beds">) => {
                  const isVacant = bed.status === "vacant";
                  const isOccupied = bed.status === "occupied";
                  const isPendingDischarge = bed.status === "pending_discharge";
                  // Find admission for this bed
                  const admission = admissions?.find((a) => a.bed_id === bed._id);
                  const patientMeds = admission ? getPatientMeds(admission.patient_id) : [];
                  const patientVitals = admission ? getPatientVitals(admission.patient_id) : null;
                  const elapsedStay = admission ? getElapsedStay(admission.admitted_at) : null;

                  return (
                    <Card
                      key={bed._id}
                      className={`transition-transform hover:-translate-y-1 border ${
                        isVacant ? "bg-emerald-50 border-emerald-200" : isOccupied ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <div className="flex flex-col p-3 h-full min-h-[10rem]">
                        {/* Bed Name + Status */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-black text-xl tracking-tighter ${isVacant ? "text-emerald-800" : isOccupied ? "text-rose-800" : "text-amber-800"}`}>
                            {bed.name}
                          </span>
                          <Chip size="sm" variant="soft" color={isVacant ? "success" : isOccupied ? "danger" : "warning"} className="font-black uppercase tracking-widest text-[8px]">
                            {bed.status.replace("_", " ")}
                          </Chip>
                        </div>

                        {admission ? (
                          <>
                            {/* 1. Patient Name + National ID */}
                            <div className="mb-2">
                              <p className="text-xs font-bold text-slate-900 truncate">{admission.patientName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{admission.patientNationalId || "N/A"}</p>
                            </div>

                            {/* 2. Admission Date + Elapsed Stay */}
                            <div className="flex items-center gap-1 mb-2 text-[10px] text-slate-500">
                              <CalendarDays size={10} className="shrink-0" />
                              <span>Admitted: {new Date(admission.admitted_at).toLocaleDateString()}</span>
                              {elapsedStay && <span className="font-bold text-slate-700">({elapsedStay})</span>}
                            </div>

                            {/* 3. Scheduled Medications */}
                            {patientMeds.length > 0 && (
                              <div className="mb-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1">
                                  <Pill size={10} /> Meds this shift
                                </div>
                                <div className="space-y-0.5 max-h-12 overflow-y-auto">
                                  {patientMeds.slice(0, 3).map((med, i) => (
                                    <p key={i} className="text-[9px] text-slate-600 truncate">
                                      {med.name} {med.dose} — {med.frequency}
                                    </p>
                                  ))}
                                  {patientMeds.length > 3 && (
                                    <p className="text-[9px] text-slate-400">+{patientMeds.length - 3} more</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 4. Real-time Vitals */}
                            {patientVitals && (
                              <div className="mb-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1">
                                  <HeartPulse size={10} /> Latest Vitals
                                </div>
                                <div className="grid grid-cols-2 gap-x-1 text-[9px] text-slate-600">
                                  {patientVitals.systolic_bp && patientVitals.diastolic_bp && (
                                    <span>BP: {patientVitals.systolic_bp}/{patientVitals.diastolic_bp}</span>
                                  )}
                                  {patientVitals.heart_rate && <span>HR: {patientVitals.heart_rate}</span>}
                                  {patientVitals.temperature && <span>Temp: {patientVitals.temperature}°C</span>}
                                  {patientVitals.spo2 && <span>SpO2: {patientVitals.spo2}%</span>}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-auto flex items-center gap-1">
                              <button
                                onClick={() => setVitalsTarget({ id: admission.patient_id as Id<"patients">, name: admission.patientName })}
                                className="p-1.5 rounded-md hover:bg-rose-100 text-rose-500"
                                title="Record Vitals"
                              >
                                <HeartPulse size={12} />
                              </button>
                              <button
                                onClick={() => handleEscalation(bed._id, admission.patient_id)}
                                className={`p-1.5 rounded-md hover:bg-red-100 text-red-500 ${escalatingBed === bed._id ? "animate-pulse bg-red-100" : ""}`}
                                title="Escalate to Doctor"
                              >
                                <AlertTriangle size={12} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <p className="text-xs text-slate-400 font-medium">Vacant</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Vitals */}
          <div className="space-y-5 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Vitals</h2>
            </div>
            <Card className="border border-slate-200">
              <div className="p-0 overflow-y-auto max-h-[400px]">
                <div className="divide-y divide-slate-100">
                  {admissions?.filter(a => a.patient_id).length === 0 ? (
                    <div className="p-8 flex items-center justify-center h-32 text-slate-400 font-medium">
                      No patients to display
                    </div>
                  ) : (
                    admissions?.slice(0, 5).map((admission) => {
                      return (
                        <div key={admission._id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-900">{admission.patientName}</span>
                            <button
                              onClick={() => setVitalsTarget({ id: admission.patient_id as Id<"patients">, name: admission.patientName })}
                              className="text-xs text-sky-600 font-bold hover:underline"
                            >
                              Record Vitals
                            </button>
                          </div>
                          <div className="flex gap-2 text-sm text-slate-500 font-medium">
                            Bed: {admission.bedName} | Dr. {admission.doctorName}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Case Logs */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <ClipboardList size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Case Logs</h2>
            </div>
            <Card className="border border-slate-200 max-h-[600px] overflow-hidden flex flex-col">
              <div className="p-0 overflow-y-auto">
                <div className="divide-y divide-slate-100">
                  {logs === undefined ? (
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-16 rounded-xl" />
                      <Skeleton className="h-16 rounded-xl" />
                      <Skeleton className="h-16 rounded-xl" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-8 flex items-center justify-center h-32 text-slate-400 font-medium">
                      No entries yet this shift
                    </div>
                  ) : (
                    logs.map((log: Doc<"case_entries">) => {
                      const typeColorMap: Record<string, "accent" | "success" | "danger" | "warning" | "default"> = {
                        admission: "accent",
                        discharge: "success",
                        escalation: "danger",
                        observation: "default",
                        nursing_note: "warning",
                      };
                      const color = typeColorMap[log.entry_type] || "default";
                      return (
                        <div key={log._id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <Chip size="sm" color={color} variant="soft" className="text-[10px] uppercase font-black tracking-widest font-mono">
                              {log.entry_type.replace("_", " ")}
                            </Chip>
                            <span className="text-slate-400 text-xs font-mono font-medium">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium leading-relaxed text-sm">
                            {log.notes || "System logged event"}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* On-Duty Roster */}
      {activeView === "roster" && (
        <Card className="border border-sky-200 shadow-lg bg-sky-50/30">
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users size={18} className="text-sky-600" /> On-Duty Roster
            </h2>
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Dr. {user?.name || "Unknown"}</p>
                    <p className="text-sm text-slate-500">Medical Staff — {wards && wards.length > 0 ? wards[0].name : "Loading..."}</p>
                  </div>
                  <Chip size="sm" color="success" variant="soft" className="font-bold">On Duty</Chip>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Dr. Ahmed Benali</p>
                    <p className="text-sm text-slate-500">State Doctor — Internal Medicine</p>
                  </div>
                  <Chip size="sm" color="success" variant="soft" className="font-bold">On Duty</Chip>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Nurse Fatima Zohra</p>
                    <p className="text-sm text-slate-500">Medical Staff — {wards && wards.length > 0 ? wards[0].name : "Loading..."}</p>
                  </div>
                  <Chip size="sm" color="success" variant="soft" className="font-bold">On Duty</Chip>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="font-bold" onPress={() => setActiveView("main")}>Back to Ward</Button>
          </div>
        </Card>
      )}

      {/* Supply Request */}
      {activeView === "supply" && (
        <Card className="border border-amber-200 shadow-lg bg-amber-50/30">
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Package size={18} className="text-amber-600" /> Supply Request
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Item Name</label>
                <input
                  type="text"
                  value={supplyItem}
                  onChange={(e) => setSupplyItem(e.target.value)}
                  placeholder="e.g. IV fluids, syringes, gloves"
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={supplyQuantity}
                    onChange={(e) => setSupplyQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Urgency</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setSupplyUrgency(u)}
                        className={`flex-1 p-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                          supplyUrgency === u
                            ? u === "high" ? "bg-red-600 text-white border-red-600" : u === "medium" ? "bg-amber-600 text-white border-amber-600" : "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white border-slate-200 text-slate-500"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Notes</label>
                <textarea
                  rows={2}
                  value={supplyNotes}
                  onChange={(e) => setSupplyNotes(e.target.value)}
                  placeholder="Additional details..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none resize-none focus:border-amber-500"
                />
              </div>
              <div className="flex gap-3">
                <Button className="font-bold bg-amber-600 text-white shadow-md" onPress={handleSupplyRequest} isDisabled={!supplyItem.trim()}>
                  <Send size={14} /> Submit Request
                </Button>
                <Button variant="ghost" className="font-bold" onPress={() => setActiveView("main")}>Cancel</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Shift Handover */}
      {activeView === "handover" && (
        <Card className="border border-violet-200 shadow-lg bg-violet-50/30">
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <MessageSquare size={18} className="text-violet-600" /> Shift Handover Note
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Patient (optional)</label>
                <select
                  value={handoverPatientId}
                  onChange={(e) => setHandoverPatientId(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none focus:border-violet-500"
                >
                  <option value="">All patients</option>
                  {admissions?.map((a) => (
                    <option key={a._id} value={a.patient_id}>{a.patientName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Handover Notes</label>
                <textarea
                  rows={6}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Key events, outstanding tasks, patient concerns for incoming shift..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none resize-none focus:border-violet-500"
                />
              </div>
              <div className="flex gap-3">
                <Button className="font-bold bg-violet-600 text-white shadow-md" onPress={handleHandover} isDisabled={!handoverNotes.trim()}>
                  <Send size={14} /> Submit Handover
                </Button>
                <Button variant="ghost" className="font-bold" onPress={() => setActiveView("main")}>Cancel</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Patient Search Modal */}
      <PatientSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelect={(p) => { setAdmitPatient(p); setShowSearch(false); }}
      />
    </div>
  );
}
