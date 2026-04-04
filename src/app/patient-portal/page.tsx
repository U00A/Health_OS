"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Shield,
  AlertTriangle,
  FileText,
  Phone,
  Edit2,
  Check,
  LogOut,
  Pill,
  Beaker,
  Stethoscope,
  Clock,
  Activity,
  Upload,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Download,
} from "lucide-react";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { Id } from "../../../convex/_generated/dataModel";
import { VitalsHistory } from "@/components/patient/VitalsHistory";
import { VitalStatusDashboard } from "@/components/patient/VitalStatusDashboard";
import { DocumentUpload } from "@/components/patient/DocumentUpload";
import { PatientSidebar, type Section } from "@/components/patient/PatientSidebar";
import { HealthTimeline } from "@/components/patient/HealthTimeline";

export default function PatientPortal() {
  const { data: session } = authClient.useSession();
  const betterAuthId = session?.user?.id;
  const profile = useQuery(api.patients.getMyProfile, betterAuthId ? { betterAuthId } : "skip");
  const updateProfile = useMutation(api.patients.updateContactInfo);
  const seedData = useMutation(api.patients.seedDemoPatient);

  const prescriptions = useQuery(
    api.prescriptions.listByPatient,
    profile ? { patient_id: profile._id } : "skip"
  );
  const labResults = useQuery(
    api.labResults.listByPatient,
    profile ? { patient_id: profile._id } : "skip"
  );
  const doctors = useQuery(
    api.doctorPatients.listDoctorsForPatient,
    profile ? { patient_id: profile._id } : "skip"
  );
  const compteRendus = useQuery(
    api.compteRendus.listByPatient,
    profile ? { patient_id: profile._id } : "skip"
  );
  const imagingFiles = useQuery(
    api.imagingFiles.getFilesByPatient,
    profile ? { patient_id: profile._id } : "skip"
  );

  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  const startEditing = () => {
    if (profile) setPhone(profile.phone || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!betterAuthId) return;
    try {
      await updateProfile({ betterAuthId, phone });
      setIsEditing(false);
    } catch (e) {
      alert("Error: " + (e as Error).message);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Spinner size="lg" />
          <span className="font-bold tracking-widest uppercase text-xs">Loading Secure Portal</span>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="p-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
              <Shield size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registration Complete</h2>
              <p className="text-slate-500 font-medium mt-2">Your secure medical account is active.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                A clinical administrator must link your account to your hospital profile before records appear.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="secondary"
                className="w-full font-bold"
                onPress={() => betterAuthId && void seedData({ betterAuthId }).then(() => window.location.reload())}
              >
                Generate Demo Data
              </Button>
              <Button variant="ghost" className="w-full font-bold border-none text-rose-600" onPress={handleSignOut}>
                <LogOut size={16} /> Secure Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const patientId = profile._id as Id<"patients">;

  // Render the active section content
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Live Vitals Dashboard</h2>
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
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Vitals History</h2>
                </div>
                <VitalsHistory patientId={patientId} />
              </div>
            </Card>
          </div>
        );

      case "specialities":
        return (
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Stethoscope size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Speciality Archive</h2>
              </div>
              <p className="text-sm text-slate-500">Browse your medical history by speciality. Expand a speciality to see the doctors who treated you.</p>
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
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Lab Results</h2>
              </div>
              {labResults === undefined ? (
                <div className="py-6 text-center text-slate-400 text-sm">Loading results...</div>
              ) : labResults.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm font-medium">No lab results on record.</div>
              ) : (
                <div className="space-y-3">
                  {labResults.map((r) => (
                    <div key={r._id} className="border border-slate-100 rounded-xl p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-slate-900">{r.analysis_type}</div>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(r.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                      {r.values && typeof r.values === "object" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(r.values as Record<string, number | null>).map(
                            ([key, val]) =>
                              val !== null && (
                                <div key={key} className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-lg font-bold font-mono text-slate-900">{val}</span>
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
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Imaging / Radio</h2>
              </div>
              {imagingFiles === undefined ? (
                <div className="py-6 text-center text-slate-400 text-sm">Loading imaging files...</div>
              ) : imagingFiles.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm font-medium">No imaging files on record.</div>
              ) : (
                <div className="space-y-3">
                  {imagingFiles.map((img) => (
                    <div key={img._id} className="border border-slate-100 rounded-xl p-4 bg-white flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{img.modality || "Imaging"}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          {new Date(img._creationTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="font-bold text-blue-600">
                        <Download size={14} /> View
                      </Button>
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
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Comptes Rendus</h2>
              </div>
              {compteRendus === undefined ? (
                <div className="py-6 text-center text-slate-400 text-sm">Loading reports...</div>
              ) : compteRendus.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm font-medium">No medical reports on record.</div>
              ) : (
                <div className="space-y-3">
                  {compteRendus.map((cr) => (
                    <div key={cr._id} className="border border-slate-100 rounded-xl p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-slate-900 text-sm">
                          {cr.diagnosis_code || "Clinical Consultation"}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(cr._creationTime).toLocaleDateString()}
                        </span>
                      </div>
                      {cr.treatment_plan && (
                        <p className="text-xs text-slate-600 mt-2">{cr.treatment_plan}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );

      case "timeline":
        return (
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Health Timeline</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6">Complete chronological history of all your health events</p>
              <HealthTimeline patientId={patientId} />
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
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Upcoming Appointments</h2>
              </div>
              <div className="py-12 text-center text-slate-400">
                <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No upcoming appointments scheduled</p>
              </div>
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
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Medication Schedule</h2>
              </div>
              {prescriptions === undefined ? (
                <div className="py-6 text-center text-slate-400 text-sm">Loading medications...</div>
              ) : prescriptions.filter((p) => p.status === "active").length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm font-medium">No active medications.</div>
              ) : (
                <div className="space-y-3">
                  {prescriptions
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
                          <Chip
                            size="sm"
                            variant="soft"
                            color="success"
                            className="text-[9px] font-black uppercase tracking-widest"
                          >
                            Active
                          </Chip>
                        </div>
                        <ul className="space-y-2">
                          {p.medications.map((m, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Pill size={12} className="text-emerald-500 shrink-0" />
                              <span className="font-bold text-slate-900">{m.name}</span>
                              <span className="text-slate-400">—</span>
                              <span className="text-slate-600">
                                {m.dose}, {m.frequency}, {m.duration}
                              </span>
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
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Assigned Doctors</h2>
              </div>
              {doctors === undefined ? (
                <div className="py-6 text-center text-slate-400 text-sm">Loading...</div>
              ) : doctors.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm font-medium">No doctors assigned yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doctors.map(
                    (d) =>
                      d && (
                        <div
                          key={d._id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{d.name || "Doctor"}</p>
                            <p className="text-xs text-slate-500 font-medium capitalize">
                              {d.role?.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </Card>
        );

      case "messages":
        return (
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Messages</h2>
              </div>
              <div className="py-12 text-center text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No messages yet</p>
              </div>
            </div>
          </Card>
        );

      case "notifications":
        return (
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Notifications</h2>
              </div>
              <p className="text-sm text-slate-500">Check the bell icon in the header for your latest notifications.</p>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      {/* Left Sidebar */}
      <PatientSidebar patientId={patientId} activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Persistent Patient Header Bar */}
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="font-mono">{profile.national_id}</span>
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
            <div className="flex items-center gap-3">
              {profile.allergies && profile.allergies.length > 0 && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                  <AlertTriangle size={14} className="text-rose-600" />
                  <div className="flex gap-1 flex-wrap">
                    {profile.allergies.map((a: string) => (
                      <Chip key={a} size="sm" color="danger" variant="soft" className="text-[9px] font-black uppercase">
                        {a}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-32 p-1.5 rounded-md border border-slate-200 text-sm font-mono focus:border-blue-500 outline-none"
                    />
                    <button onClick={handleSave} className="text-blue-600 hover:text-blue-700">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-500">
                      <Edit2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={startEditing} className="text-sm font-mono text-slate-600 hover:text-slate-900">
                    {profile.phone || "Not set"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Content */}
        {renderSection()}
      </main>
    </div>
  );
}