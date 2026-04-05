"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Shield,
  Clock,
  Activity,
  Calendar,
  Users,
  MessageSquare,
  Download,
  Printer,
  Send,
  DownloadCloud,
  Beaker,
  Pill,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { Card, Button, Chip, Spinner, Skeleton } from "@heroui/react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";
import { Id } from "../../../convex/_generated/dataModel";
import { VitalsHistory } from "@/components/patient/VitalsHistory";
import { VitalStatusDashboard } from "@/components/patient/VitalStatusDashboard";
import { HealthTimeline } from "@/components/patient/HealthTimeline";
import { useState } from "react";

type PatientSection =
  | "dashboard"
  | "lab-results"
  | "imaging"
  | "comptes-rendus"
  | "timeline"
  | "medications"
  | "doctors"
  | "appointments"
  | "messages";

export default function PatientPortal() {
  const profile = useQuery(api.patients.getMyProfile, "skip");

  // Always call hooks at the top level
  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const labResults = useQuery(
    api.labResults.listByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const doctors = useQuery(
    api.doctorPatients.listDoctorsForPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const compteRendus = useQuery(
    api.compteRendus.listByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const imagingFiles = useQuery(
    api.imagingFiles.getFilesByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );

  // Early return for loading state
  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Spinner size="lg" />
          <span className="font-bold tracking-widest uppercase text-xs">Loading Secure Portal</span>
        </div>
      </div>
    );
  }

  // Early return for no profile
  if (profile === null) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="p-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
              <Shield size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Setup Needed</h2>
              <p className="text-slate-500 font-medium mt-2">Your profile has not been linked to any medical records yet.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Please contact the hospital administrator to complete your registration.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const patientId = profile._id as Id<"patients">;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Persistent Patient Header Bar */}
      <Card className="border border-slate-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50/50">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border">{profile.national_id}</span>
                  <span className="text-slate-300">•</span>
                  <span>DOB: {profile.dob}</span>
                  {profile.blood_type && (
                    <>
                      <span className="text-slate-300">•</span>
                      <Chip size="sm" color="danger" variant="soft" className="text-[9px] font-black uppercase">
                        {profile.blood_type}
                      </Chip>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {profile.allergies && profile.allergies.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  <AlertTriangle size={14} className="text-red-600 shrink-0" />
                  <div className="flex gap-1 flex-wrap">
                    {profile.allergies.map((a: string) => (
                      <Chip key={a} size="sm" color="danger" variant="soft" className="text-[9px] font-black uppercase">
                        {a}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <DownloadCloud size={14} className="text-slate-400" />
                <span className="font-mono">{profile.phone || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section Tabs */}
      <Card className="border border-slate-200 shadow-sm">
        <div className="px-2 pt-2 pb-0 overflow-x-auto">
          <Tabs aria-label="Patient sections">
            <Tab key="dashboard" title={<span className="flex items-center gap-1 text-xs"><Activity size={12} /> Vitals Dashboard</span>}>
              {renderSection("dashboard", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="timeline" title={<span className="flex items-center gap-1 text-xs"><Clock size={12} /> Health Timeline</span>}>
              {renderSection("timeline", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="lab-results" title={<span className="flex items-center gap-1 text-xs"><Beaker size={12} /> Lab Results</span>}>
              {renderSection("lab-results", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="imaging" title={<span className="flex items-center gap-1 text-xs"><DownloadCloud size={12} /> Imaging / Radio</span>}>
              {renderSection("imaging", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="comptes-rendus" title={<span className="flex items-center gap-1 text-xs"><ClipboardList size={12} /> Comptes Rendus</span>}>
              {renderSection("comptes-rendus", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="medications" title={<span className="flex items-center gap-1 text-xs"><Pill size={12} /> Medications</span>}>
              {renderSection("medications", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="doctors" title={<span className="flex items-center gap-1 text-xs"><Users size={12} /> Doctors</span>}>
              {renderSection("doctors", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="appointments" title={<span className="flex items-center gap-1 text-xs"><Calendar size={12} /> Appointments</span>}>
              {renderSection("appointments", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
            <Tab key="messages" title={<span className="flex items-center gap-1 text-xs"><MessageSquare size={12} /> Messages</span>}>
              {renderSection("messages", patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors)}
            </Tab>
          </Tabs>
        </div>
      </Card>

    </div>
  );
}

function renderSection(
  activeSection: PatientSection,
  patientId: Id<"patients">,
  labResults: unknown,
  imagingFiles: unknown,
  compteRendus: unknown,
  prescriptions: unknown,
  doctors: unknown
) {
  const labs = labResults as { _id: string; analysis_type: string; uploaded_at: number; values: Record<string, number | null> }[] | undefined;
  const images = imagingFiles as { _id: string; modality?: string; body_part: string; uploaded_at: number }[] | undefined;
  const crs = compteRendus as { _id: string; diagnosis_code?: string; treatment_plan?: string; _creationTime: number }[] | undefined;
  const rx = prescriptions as { _id: string; status: string; issued_at: number; doctorName?: string; medications: { name: string; dose: string; frequency: string; duration: string }[] }[] | undefined;
  const docs = doctors as { _id: string; name?: string; role?: string }[] | undefined;

  switch (activeSection) {
    case "dashboard":
      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Live Vitals Dashboard</h2>
                  <p className="text-xs text-slate-400">Real-time health monitoring with visual indicators</p>
                </div>
              </div>
              <VitalStatusDashboard patientId={patientId} />
            </div>
          </Card>
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Vitals Trends</h2>
              </div>
              <VitalsHistory patientId={patientId} />
            </div>
          </Card>
        </div>
      );

    case "timeline":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Health Timeline</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">Complete chronological history of all your health events</p>
            <HealthTimeline patientId={patientId} />
          </div>
        </Card>
      );

    case "lab-results":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                <Beaker size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Lab Results</h2>
            </div>
            {labs === undefined ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : labs.length === 0 ? (
              <div className="py-12 text-center">
                <Beaker size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No lab results on record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {labs.map((r) => (
                  <div key={r._id} className="border border-slate-100 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">{r.analysis_type}</div>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(r.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                    {r.values && typeof r.values === "object" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {Object.entries(r.values).map(
                          ([key, val]) =>
                            val !== null && (
                              <div key={key} className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-base font-bold font-mono text-slate-900">{val}</span>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      );

    case "imaging":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <DownloadCloud size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Imaging / Radio</h2>
            </div>
            {images === undefined ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : images.length === 0 ? (
              <div className="py-12 text-center">
                <DownloadCloud size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No imaging files on record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img) => (
                  <div key={img._id} className="border border-slate-100 rounded-xl p-4 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{img.modality || "Imaging"} — {img.body_part}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {new Date(img.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="font-bold text-blue-600">
                        <Download size={14} /> View
                      </Button>
                      <Button size="sm" variant="ghost" className="font-bold text-slate-600" onPress={() => window.print()}>
                        <Printer size={14} /> Print
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      );

    case "comptes-rendus":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <ClipboardList size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Comptes Rendus</h2>
            </div>
            {crs === undefined ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : crs.length === 0 ? (
              <div className="py-12 text-center">
                <ClipboardList size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No medical reports on record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {crs.map((cr) => (
                  <div key={cr._id} className="border border-slate-100 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-slate-900 text-sm">
                        {cr.diagnosis_code || "Clinical Consultation"}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(cr._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    {cr.treatment_plan && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cr.treatment_plan}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="ghost" className="font-bold text-slate-600" onPress={() => window.print()}>
                        <Printer size={14} /> Print Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      );

    case "medications":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Pill size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Medication Schedule</h2>
            </div>
            {rx === undefined ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : rx.filter((p) => p.status === "active").length === 0 ? (
              <div className="py-12 text-center">
                <Pill size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No active medications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rx
                  .filter((p) => p.status === "active")
                  .map((p) => (
                    <div key={p._id} className="border border-slate-100 rounded-xl p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <Clock size={12} />
                          <span>{new Date(p.issued_at).toLocaleDateString()}</span>
                          <span className="text-slate-300">•</span>
                          <span>Dr. {p.doctorName}</span>
                        </div>
                        <Chip size="sm" variant="soft" color="success" className="text-[9px] font-black uppercase tracking-widest">
                          Active
                        </Chip>
                      </div>
                      <ul className="space-y-2">
                        {p.medications.map((m, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Pill size={12} className="text-emerald-500 shrink-0" />
                            <span className="font-bold text-slate-900">{m.name}</span>
                            <span className="text-slate-400">—</span>
                            <span className="text-slate-600">{m.dose}, {m.frequency}, {m.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>
      );

    case "doctors":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Assigned Doctors</h2>
            </div>
            {docs === undefined ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : docs.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No doctors assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {docs.map((d) => (
                  <div key={d._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <span className="font-bold text-sm">{d.name?.[0] || "D"}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{d.name || "Doctor"}</p>
                      <p className="text-xs text-slate-500 font-medium capitalize">{d.role?.replace("_", " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      );

    case "appointments":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Upcoming Appointments</h2>
            </div>
            <div className="py-12 text-center">
              <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No upcoming appointments scheduled</p>
            </div>
          </div>
        </Card>
      );

    case "messages":
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Messages</h2>
            </div>
            <div className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/30">
              <h3 className="font-bold text-indigo-800 mb-3">Send Message to Your Doctor</h3>
              <p className="text-xs text-indigo-600 mb-4">Use this form to send a structured symptom update to your enrolled private doctor.</p>
              <div className="space-y-3">
                <select className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none">
                  <option value="">Select symptom type...</option>
                  <option value="pain">Pain</option>
                  <option value="fever">Fever</option>
                  <option value="fatigue">Fatigue</option>
                  <option value="nausea">Nausea</option>
                  <option value="breathing">Breathing Difficulty</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-600">Severity (1-5):</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} className={`w-8 h-8 rounded-lg font-bold text-sm border ${n <= 2 ? "bg-emerald-100 border-emerald-200 text-emerald-700" : n <= 3 ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-red-100 border-red-200 text-red-700"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <input type="text" placeholder="Duration (e.g., 3 days)" className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none" />
                <textarea placeholder="Additional notes (optional)" className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none min-h-[80px]" />
                <Button className="font-bold bg-indigo-600 text-white">
                  <Send size={14} /> Send Message
                </Button>
              </div>
            </div>
            <div className="py-8 text-center text-slate-400">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No messages yet</p>
            </div>
          </div>
        </Card>
      );

    default:
      return null;
  }
}
