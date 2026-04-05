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

import { Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { VitalStatusDashboard } from "@/components/patient/VitalStatusDashboard";
import { HealthTimeline } from "@/components/patient/HealthTimeline";
import { VitalsTrendChart } from "@/components/clinical/VitalsTrendChart";
import { Suspense, useEffect } from "react";
import { useSearchParams, ReadonlyURLSearchParams, useRouter } from "next/navigation";
type PatientSection =
  | "dashboard"
  | "speciality"
  | "lab-results"
  | "imaging"
  | "comptes-rendus"
  | "timeline"
  | "medications"
  | "doctors"
  | "appointments"
  | "messages";

function PatientPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSection = (searchParams?.get("section") as PatientSection) || "dashboard";
  const authId = useBetterAuthId();
  const profile = useQuery(api.patients.getMyProfile, authId ? { betterAuthId: authId } : "skip");

  // Always call hooks at the top level
  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const labResults = useQuery(
    api.lab_results.listByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const doctors = useQuery(
    api.doctor_patients.listDoctorsForPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const compteRendus = useQuery(
    api.compte_rendus.listByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );
  const imagingFiles = useQuery(
    api.imaging_files.getFilesByPatient,
    profile ? { patient_id: profile._id as Id<"patients"> } : "skip"
  );

  // Redirect to signup if no profile
  useEffect(() => {
    if (profile === null) {
      router.push("/patient-signup");
    }
  }, [profile, router]);

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

  if (profile === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Spinner size="lg" />
          <span className="font-bold tracking-widest uppercase text-xs">Redirecting to Registration...</span>
        </div>
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

      {/* Main Section Content */}
      <div className="py-2">
        {renderSection(activeSection, patientId, labResults, imagingFiles, compteRendus, prescriptions, doctors, searchParams)}
      </div>

    </div>
  );
}

export default function PatientPortal() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Spinner size="lg" />
        <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Loading secure portal...</span>
      </div>
    }>
      <PatientPortalContent />
    </Suspense>
  );
}

function renderSection(
  activeSection: PatientSection,
  patientId: Id<"patients">,
  labResults: unknown,
  imagingFiles: unknown,
  compteRendus: unknown,
  prescriptions: unknown,
  doctors: unknown,
  searchParams: ReadonlyURLSearchParams
) {
  const labs = labResults as { _id: string; analysis_type: string; uploaded_at: number; values: Record<string, number | null> }[] | undefined;
  const images = imagingFiles as { _id: string; modality?: string; body_part: string; uploaded_at: number }[] | undefined;
  const crs = compteRendus as { _id: string; diagnosis_code?: string; treatment_plan?: string; _creationTime: number }[] | undefined;
  const rx = prescriptions as { _id: string; status: string; issued_at: number; doctorName?: string; medications: { name: string; dose: string; frequency: string; duration: string }[] }[] | undefined;
  const docs = doctors as { _id: string; name?: string; role?: string }[] | undefined;

  switch (activeSection) {
    case "dashboard":
      return (
        <div className="space-y-6">
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
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Assigned Clinical Team</h2>
                    <p className="text-xs text-slate-400">Doctors currently overseeing your care</p>
                  </div>
                </div>
                {docs && docs.length > 0 ? (
                  <div className="space-y-3">
                    {docs.map(doc => (
                      <div key={doc._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                            {doc.name ? doc.name.split(' ').map(n=>n[0]).join('') : 'DR'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{doc.role?.replace('_', ' ') || 'Specialist'}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-indigo-600 font-medium">Message</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-sm">No doctors assigned yet.</div>
                )}
              </div>
            </Card>
          </div>

          <Card className="border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Vitals Trends</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VitalsTrendChart patientId={patientId} metric="weight" unit="kg" label="Weight Trend" normalRange={[50, 100]} />
                <VitalsTrendChart patientId={patientId} metric="systolic_bp" unit="mmHg" label="Systolic BP" normalRange={[90, 120]} />
                <VitalsTrendChart patientId={patientId} metric="heart_rate" unit="bpm" label="Heart Rate" normalRange={[60, 100]} />
                <VitalsTrendChart patientId={patientId} metric="respiratory_rate" unit="/min" label="Respiratory Rate" normalRange={[12, 20]} />
              </div>
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

    case "speciality":
      const specId = searchParams.get("id") || "";
      return (
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Activity size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 capitalize">{specId} Archive</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">Historical consultation records, prescriptions, and lab results for {specId}.</p>
            
            <div className="space-y-4">
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <ClipboardList size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium tracking-tight">No records found for this speciality.</p>
                <p className="text-xs text-slate-400 mt-2">Visits to a {specId} specialist will appear here.</p>
              </div>
            </div>
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
           <div className="p-6 space-y-5">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                   <Calendar size={20} />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold tracking-tight text-slate-900">Upcoming Appointments</h2>
                   <p className="text-xs text-slate-500">Your scheduled visits and follow-ups</p>
                 </div>
               </div>
             </div>

             {/* Upcoming Appointment Card */}
             <div className="space-y-3">
               <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                 <div className="flex items-center justify-between mb-3">
                   <Chip size="sm" color="success" variant="soft" className="text-[9px] font-black uppercase tracking-widest">
                     Next Appointment
                   </Chip>
                   <span className="text-xs text-slate-500 font-mono">Scheduled</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="p-3 bg-white rounded-lg">
                     <p className="text-xs text-slate-500 font-bold uppercase">Date</p>
                     <p className="font-bold text-slate-900">--/--/----</p>
                   </div>
                   <div className="p-3 bg-white rounded-lg">
                     <p className="text-xs text-slate-500 font-bold uppercase">Time</p>
                     <p className="font-bold text-slate-900">--:--</p>
                   </div>
                   <div className="p-3 bg-white rounded-lg">
                     <p className="text-xs text-slate-500 font-bold uppercase">Doctor</p>
                     <p className="font-bold text-slate-900">TBD</p>
                   </div>
                   <div className="p-3 bg-white rounded-lg">
                     <p className="text-xs text-slate-500 font-bold uppercase">Type</p>
                     <p className="font-bold text-slate-900">Follow-Up</p>
                   </div>
                 </div>
                 <p className="text-xs text-slate-500 italic">Appointments will be scheduled by your care team and appear here.</p>
               </div>

               <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                 <Calendar size={24} className="mx-auto mb-2 opacity-30" />
                 <p className="text-sm font-medium">No additional appointments</p>
               </div>
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
               <div>
                 <h2 className="text-lg font-bold tracking-tight text-slate-900">Messages</h2>
                 <p className="text-xs text-slate-500">Structured communication with your private doctor</p>
               </div>
             </div>

             {/* Message Inbox */}
             <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
               <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
               <p className="text-sm font-medium">No messages yet</p>
               <p className="text-xs text-slate-400 mt-1">Messages from your doctor will appear here.</p>
             </div>

             {/* Send Message Form */}
             <div className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/30">
               <h3 className="font-bold text-indigo-800 mb-3">Send Message to Your Doctor</h3>
               <p className="text-xs text-indigo-600 mb-4">Use this form to send a structured symptom update to your enrolled private doctor.</p>
               <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Recipient</label>
                   <select className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none">
                     <option value="">Select your doctor...</option>
                     {docs && docs.length > 0 ? docs.map((d) => (
                       <option key={d._id} value={d._id}>{d.name || "Doctor"}</option>
                     )) : (
                       <option value="" disabled>No doctors assigned</option>
                     )}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Message Type</label>
                   <select className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none">
                     <option value="">Select type...</option>
                     <option value="symptom_update">Symptom Update</option>
                     <option value="medication_question">Medication Question</option>
                     <option value="appointment_request">Appointment Request</option>
                     <option value="test_results">Test Results Inquiry</option>
                     <option value="general">General Inquiry</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Primary Symptom (if applicable)</label>
                   <select className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none">
                     <option value="">Select symptom type...</option>
                     <option value="pain">Pain</option>
                     <option value="fever">Fever</option>
                     <option value="fatigue">Fatigue</option>
                     <option value="nausea">Nausea</option>
                     <option value="breathing">Breathing Difficulty</option>
                     <option value="other">Other</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Severity (1-5)</label>
                   <div className="flex gap-2">
                     {[1, 2, 3, 4, 5].map((n) => (
                       <button key={n} className={`w-10 h-10 rounded-lg font-bold text-sm border transition-all ${n <= 2 ? "bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200" : n <= 3 ? "bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200" : "bg-red-100 border-red-200 text-red-700 hover:bg-red-200"}`}>
                         {n}
                       </button>
                     ))}
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Duration</label>
                   <input type="text" placeholder="e.g., 3 days, since last week" className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none" />
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
                   <textarea placeholder="Describe your symptoms or question in detail..." className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none min-h-[100px] resize-none" />
                 </div>
                 <Button className="font-bold bg-indigo-600 text-white">
                   <Send size={14} /> Send Message
                 </Button>
               </div>
             </div>
           </div>
         </Card>
       );

    default:
      return null;
  }
}
