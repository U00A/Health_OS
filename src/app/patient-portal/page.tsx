"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { User, Shield, AlertTriangle, FileText, Phone, Edit2, Check, LogOut, Pill, Beaker, Stethoscope, Clock, Activity, Upload, FileText as FileTextIcon, Eye } from "lucide-react";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { Id } from "../../../convex/_generated/dataModel";
import { VitalsHistory } from "@/components/patient/VitalsHistory";
import { VitalStatusDashboard } from "@/components/patient/VitalStatusDashboard";
import { DocumentUpload } from "@/components/patient/DocumentUpload";

export default function PatientPortal() {
  const { data: session } = authClient.useSession();
  const betterAuthId = session?.user?.id;
  const profile = useQuery(api.patients.getMyProfile, betterAuthId ? { betterAuthId } : "skip");
  const updateProfile = useMutation(api.patients.updateContactInfo);
  const seedData = useMutation(api.patients.seedDemoPatient);

  // Live data queries - only run when we have a patient profile
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

  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    if (profile) setPhone(profile.phone || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!betterAuthId) return;
    try {
      await updateProfile({ betterAuthId, phone });
      setIsEditing(false);
    } catch (e) { alert("Error: " + (e as Error).message); }
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
              <Button variant="secondary" className="w-full font-bold"
                onPress={() => betterAuthId && void seedData({ betterAuthId }).then(() => window.location.reload())}>
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Chip size="sm" className="bg-white/20 text-white font-mono uppercase tracking-widest text-[10px] mb-4 border-none">
              Verified Patient
            </Chip>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
              Welcome back, {profile.first_name}
            </h1>
            <div className="flex flex-wrap gap-4 mt-4 text-blue-100 font-medium font-mono text-sm">
              <span className="flex items-center gap-1.5"><User size={16} /> {profile.national_id}</span>
              <span className="text-blue-400">•</span>
              <span>DOB: {profile.dob}</span>
              {profile.blood_type && <><span className="text-blue-400">•</span><span>{profile.blood_type}</span></>}
            </div>
          </div>
          <Button variant="ghost" className="text-white border-white/20 font-bold" onPress={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 md:-mt-8 relative z-20 space-y-6">
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><Phone size={20} /></div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Contact Info</h2>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Phone</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input autoFocus type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 p-3 rounded-lg border border-slate-200 font-mono text-lg focus:border-blue-500 outline-none" />
                  </div>
                ) : (
                  <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">{profile.phone || "Not set"}</div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onPress={() => setIsEditing(false)} className="font-bold">Cancel</Button>
                    <Button className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200" onPress={handleSave}>
                      <Check size={16} /> Save
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="font-bold text-blue-600" onPress={startEditing}>
                    <Edit2 size={16} /> Edit
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Allergies */}
          <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Clinical Overview</h2>
              </div>
              {profile.allergies && profile.allergies.length > 0 ? (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3">
                  <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <strong className="text-rose-900 font-bold block mb-2">Active Allergy Alerts</strong>
                    <div className="flex gap-1 flex-wrap">
                      {profile.allergies.map((a: string) => (
                        <Chip key={a} size="sm" color="danger" variant="soft" className="text-[9px] font-black uppercase tracking-widest">{a}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-2 text-emerald-700 text-sm font-medium">
                  <Check size={16} /> No critical allergies on file.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Vital Status Dashboard */}
        {profile && (
          <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
            <div className="p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center"><Activity size={20} /></div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Vital Status Dashboard</h2>
                  <p className="text-xs text-slate-400">Real-time health monitoring with visual indicators</p>
                </div>
              </div>
              <VitalStatusDashboard patientId={profile._id as Id<"patients">} />
            </div>
          </Card>
        )}

        {/* Vitals History */}
        {profile && (
          <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
            <div className="p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center"><Activity size={20} /></div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Vitals History</h2>
              </div>
              <VitalsHistory patientId={profile._id as Id<"patients">} />
            </div>
          </Card>
        )}

        {/* Assigned Doctors */}
        <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Stethoscope size={20} /></div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">My Doctors</h2>
            </div>
            {doctors === undefined ? (
              <div className="py-6 text-center text-slate-400 text-sm">Loading...</div>
            ) : doctors.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm font-medium">No doctors assigned yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctors.map((d) => d && (
                  <div key={d._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={16} />
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

        {/* Prescriptions */}
        <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Pill size={20} /></div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Prescriptions</h2>
            </div>
            {prescriptions === undefined ? (
              <div className="py-6 text-center text-slate-400 text-sm">Loading prescriptions...</div>
            ) : prescriptions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm font-medium">No prescriptions on record.</div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((p) => (
                  <div key={p._id} className="border border-slate-100 rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Clock size={12} /><span>{new Date(p.issued_at).toLocaleDateString()}</span>
                        <span className="text-slate-300">•</span>
                        <span>Dr. {p.doctorName}</span>
                      </div>
                      <Chip size="sm" variant="soft"
                        color={p.status === "active" ? "accent" : p.status === "dispensed" ? "success" : p.status === "partially_dispensed" ? "warning" : "danger"}
                        className="text-[9px] font-black uppercase tracking-widest">
                        {p.status.replace("_", " ")}
                      </Chip>
                    </div>
                    <ul className="space-y-2">
                      {p.medications.map((m, i) => (
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

        {/* Document Upload */}
        {profile && (
          <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
            <div className="p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center"><Upload size={20} /></div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">My Documents</h2>
                  <p className="text-xs text-slate-400">Upload and manage your medical documents</p>
                </div>
              </div>
              <DocumentUpload patientId={profile._id as Id<"patients">} />
            </div>
          </Card>
        )}

        {/* Lab Results */}
        <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center"><Beaker size={20} /></div>
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
                      <span className="text-xs text-slate-400 font-mono">{new Date(r.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    {r.values && typeof r.values === "object" && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(r.values as Record<string, number | null>).map(([key, val]) => val !== null && (
                          <div key={key} className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{key.replace(/_/g, " ")}</span>
                            <span className="text-lg font-bold font-mono text-slate-900">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
