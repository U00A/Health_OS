"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, Button, Chip, Spinner, Skeleton } from "@heroui/react";
import { Users, Server, ShieldAlert, Activity, UserPlus, HardDrive, RefreshCw, Hospital, BedDouble, Stethoscope, UserCheck, Pill, Beaker, FileText, Search, CalendarDays, DollarSign } from "lucide-react";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { useState } from "react";

type AdminTab = "console" | "patients" | "admissions" | "billing";

export default function AdminPage() {
  const betterAuthId = useBetterAuthId();
  const initStatus = useQuery(api.init.checkInit);
  const users = useQuery(api.admin_users.listAllUsers);
  const patients = useQuery(api.patients.listAll, betterAuthId ? { betterAuthId } : "skip");
  const wards = useQuery(api.wards.listAll);
  const beds = useQuery(api.beds.listAll);
  const admissions = useQuery(api.admissions.listAllActive);
  const prescriptions = useQuery(api.prescriptions.listAllActive);
  const labOrders = useQuery(api.lab_orders.listAllPending);
  const [activeTab, setActiveTab] = useState<AdminTab>("console");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Fetch data for selected patient history
  const selectedPatientCivil = useQuery(
    api.billing.getPatientCivilData,
    selectedPatientId && betterAuthId ? { patient_id: selectedPatientId as Id<"patients">, betterAuthId } : "skip"
  );
  const selectedPatientAdmissions = useQuery(
    api.admissions.listByPatient,
    selectedPatientId ? { patient_id: selectedPatientId as Id<"patients"> } : "skip"
  );
  const selectedPatientBilling = useQuery(
    api.billing.getPatientBilling,
    selectedPatientId && betterAuthId ? { patient_id: selectedPatientId as Id<"patients">, betterAuthId } : "skip"
  );

  // Auth seeds removed - now using Convex-based signup
  const seedUsers = () => {};
  const masterInit = useMutation(api.init.masterInit);
  const [seeding, setSeeding] = useState(false);
  const [initMessage, setInitMessage] = useState("");

  const handleSeedUsers = async () => {
    setSeeding(true);
    setInitMessage("Seed demo functionality - create users via signup instead");
    setSeeding(false);
  };

  const handleMasterInit = async () => {
    setSeeding(true);
    try {
      const result = await masterInit({ resetFirst: false });
      setInitMessage(result.message);
      window.location.reload();
    } catch (e: unknown) {
      setInitMessage((e as Error).message);
    }
    setSeeding(false);
  };

  const handleResetAndInit = async () => {
    if (!confirm("This will DELETE ALL DATA and re-seed. Continue?")) return;
    setSeeding(true);
    try {
      const result = await masterInit({ resetFirst: true });
      setInitMessage(result.message);
      window.location.reload();
    } catch (e: unknown) {
      setInitMessage((e as Error).message);
    }
    setSeeding(false);
  };

  const stats = [
    { label: "Users", value: initStatus?.counts.users?.toString() || "0", icon: Users, color: "primary" },
    { label: "Patients", value: initStatus?.counts.patients?.toString() || "0", icon: UserCheck, color: "success" },
    { label: "Wards", value: initStatus?.counts.wards?.toString() || "0", icon: Hospital, color: "warning" },
    { label: "Beds", value: initStatus?.counts.beds?.toString() || "0", icon: BedDouble, color: "default" },
    { label: "Active Admissions", value: admissions?.length?.toString() || "0", icon: Activity, color: "danger" },
    { label: "Active Prescriptions", value: prescriptions?.length?.toString() || "0", icon: Pill, color: "accent" },
    { label: "Pending Lab Orders", value: labOrders?.length?.toString() || "0", icon: Beaker, color: "warning" },
    { label: "Specialities", value: initStatus?.counts.specialities?.toString() || "0", icon: Stethoscope, color: "primary" },
  ];

  // Filter admissions by search query
  const filteredAdmissions = admissions?.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.patientName?.toLowerCase().includes(q) ||
      a.patientNationalId?.includes(q)
    );
  }) || [];

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700 border-red-200",
    medecin_etat: "bg-blue-100 text-blue-700 border-blue-200",
    private_doctor: "bg-teal-100 text-teal-700 border-teal-200",
    medical_staff: "bg-sky-100 text-sky-700 border-sky-200",
    pharmacy: "bg-emerald-100 text-emerald-700 border-emerald-200",
    laboratory: "bg-violet-100 text-violet-700 border-violet-200",
    patient: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    medecin_etat: "State Doctor",
    private_doctor: "Private Doctor",
    medical_staff: "Medical Staff",
    pharmacy: "Pharmacy",
    laboratory: "Laboratory",
    patient: "Patient",
  };

  if (initStatus === undefined || users === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Spinner size="lg" />
          <span className="font-bold tracking-widest uppercase text-xs">Loading Admin Console</span>
        </div>
      </div>
    );
  }





  return (
    <div className="space-y-8 animate-fade-in">
...
      {/* Patient History Modal */}
      {selectedPatientId && selectedPatientCivil && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl tracking-tight">
                    {selectedPatientCivil.first_name} {selectedPatientCivil.last_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-0.5">
                    Civil Registry Record — ID: {selectedPatientCivil.national_id}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="font-bold text-slate-400 hover:text-slate-900" onPress={() => setSelectedPatientId(null)}>
                Close
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Civil Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPatientCivil.dob}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                  <p className="text-sm font-bold text-slate-900 capitalize">{selectedPatientCivil.sex || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPatientCivil.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Commune/Wilaya</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPatientCivil.commune}, {selectedPatientCivil.wilaya}</p>
                </div>
              </div>

              {/* Admission History */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <CalendarDays size={16} className="text-blue-500" />
                  Admission History
                </h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 font-bold text-slate-500">Admitted</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500">Discharged</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500">Type</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPatientAdmissions || selectedPatientAdmissions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No admission records found</td>
                        </tr>
                      ) : (
                        selectedPatientAdmissions.map((a) => (
                          <tr key={a._id} className="border-b border-slate-50 last:border-none">
                            <td className="px-4 py-3 font-medium">{new Date(a.admitted_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-medium">{a.discharged_at ? new Date(a.discharged_at).toLocaleDateString() : "—"}</td>
                            <td className="px-4 py-3 capitalize">{a.admission_type}</td>
                            <td className="px-4 py-3">
                              <Chip size="sm" color={a.status === "active" ? "success" : "default"} variant="soft" className="font-bold">
                                {a.status}
                              </Chip>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Billing Records */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-500" />
                  Billing History
                </h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 font-bold text-slate-500">Date</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500">Category</th>
                        <th className="text-right px-4 py-3 font-bold text-slate-500">Amount</th>
                        <th className="text-center px-4 py-3 font-bold text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPatientBilling || selectedPatientBilling.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No billing records found</td>
                        </tr>
                      ) : (
                        selectedPatientBilling.map((b) => (
                          <tr key={b._id} className="border-b border-slate-50 last:border-none">
                            <td className="px-4 py-3 font-medium">{new Date(b.billing_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 capitalize">{b.service_category}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">{b.amount.toLocaleString()} DZD</td>
                            <td className="px-4 py-3 text-center">
                              <Chip size="sm" color={b.payment_status === "paid" ? "success" : b.payment_status === "pending" ? "warning" : "default"} variant="soft" className="font-bold">
                                {b.payment_status}
                              </Chip>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button className="font-bold border border-slate-200" variant="ghost" onPress={() => setSelectedPatientId(null)}>Close Record</Button>
              <Button className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200" onPress={() => alert("Generating Full Billing Statement (PDF)...")}>
                <FileText size={16} /> Print Statement
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
            <Server className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Console</h1>
            <p className="text-slate-500 font-medium mt-1">
              {initStatus.isSeeded ? "Platform seeded and operational" : "Platform not initialized — run seed first"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="ghost"
            className="font-bold border border-slate-200"
            onPress={handleSeedUsers}
            isDisabled={seeding}
          >
            <RefreshCw size={16} /> Seed Users
          </Button>
          <Button
            className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200"
            onPress={handleMasterInit}
            isDisabled={seeding}
          >
            <UserPlus size={16} /> Full Init
          </Button>
          <Button
            variant="ghost"
            className="font-bold border border-red-200 text-red-600"
            onPress={handleResetAndInit}
            isDisabled={seeding}
          >
            <ShieldAlert size={16} /> Reset & Re-seed
          </Button>
        </div>
      </div>

      {/* Init Message */}
      {initMessage && (
        <Card className="border border-blue-200 bg-blue-50">
          <div className="p-4">
            <p className="text-sm font-medium text-blue-700">{initMessage}</p>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { key: "console" as const, label: "Console", icon: Server },
          { key: "patients" as const, label: "Patients", icon: UserCheck },
          { key: "admissions" as const, label: "Admissions", icon: CalendarDays },
          { key: "billing" as const, label: "Billing", icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Patients Tab - Civil Registry (Section 5) */}
      {activeTab === "patients" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search civil registry by name or national ID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-slate-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients === undefined ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            ) : patients.filter(p => !searchQuery || `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || p.national_id.includes(searchQuery)).length === 0 ? (
              <Card className="col-span-full border border-dashed border-slate-200 shadow-none bg-slate-50">
                <div className="p-12 text-center">
                  <UserCheck size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-700 text-lg mb-2">No Records Match Search</h3>
                  <p className="text-slate-500 text-sm font-medium">Try a different name or ID.</p>
                </div>
              </Card>
            ) : (
              patients
                .filter(p => !searchQuery || `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || p.national_id.includes(searchQuery))
                .map((p) => (
                <Card key={p._id} className="border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-lg">{p.first_name} {p.last_name}</h3>
                      <Chip size="sm" color="default" variant="soft" className="font-black text-[9px] uppercase tracking-widest">CIVIL DATA</Chip>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">National ID</span>
                        <span className="font-mono font-bold text-slate-900">{p.national_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date of Birth</span>
                        <span className="font-bold text-slate-900">{p.dob}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Address</span>
                        <span className="font-bold text-slate-900">{p.commune}, {p.wilaya}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <Button size="sm" className="flex-1 font-bold bg-blue-600 text-white shadow-sm shadow-blue-100" onPress={() => alert("Generating Admission Certificate (PDF)...")}>
                        <FileText size={14} /> Certificate
                      </Button>
                      <Button size="sm" variant="ghost" className="flex-1 font-bold text-slate-600 border border-slate-200" onPress={() => setSelectedPatientId(p._id)}>
                        <CalendarDays size={14} /> History
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Admissions Tab - Civil Data Only (Section 5) */}
      {activeTab === "admissions" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name or national ID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-slate-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAdmissions.length === 0 ? (
              <Card className="col-span-full border border-dashed border-slate-200 shadow-none bg-slate-50">
                <div className="p-12 text-center">
                  <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-700 text-lg mb-2">No Admissions Found</h3>
                  <p className="text-slate-500 text-sm font-medium">Admissions will appear here when patients are admitted.</p>
                </div>
              </Card>
            ) : (
              filteredAdmissions.map((a) => (
                <Card key={a._id} className="border border-slate-200 shadow-sm">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-lg">{a.patientName}</h3>
                      <Chip size="sm" color="success" variant="soft" className="font-bold">Active</Chip>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">National ID</span>
                        <span className="font-mono font-bold text-slate-900">{a.patientNationalId || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Admission Date</span>
                        <span className="font-bold text-slate-900">{new Date(a.admitted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ward</span>
                        <span className="font-bold text-slate-900">{"wardName" in a ? String((a as Record<string, unknown>).wardName) || "N/A" : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bed</span>
                        <span className="font-bold text-slate-900">{a.bedName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Admission Type</span>
                        <span className="font-bold text-slate-900 capitalize">{a.admission_type || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Billing Tab - Civil Data Only (Section 5) */}
      {activeTab === "billing" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <DollarSign size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Admissions</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{admissions?.length || 0}</p>
              <p className="text-xs text-slate-400 mt-1">This month</p>
            </Card>
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <BedDouble size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Avg Stay</span>
              </div>
              <p className="text-3xl font-black text-slate-900">--</p>
              <p className="text-xs text-slate-400 mt-1">Days per admission</p>
            </Card>
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <Activity size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Occupancy</span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {beds ? Math.round((beds.filter((b: { status: string }) => b.status === "occupied").length / beds.length) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">Current rate</p>
            </Card>
          </div>
          <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
            <div className="p-12 text-center">
              <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="font-bold text-slate-700 text-lg mb-2">Billing Module</h3>
              <p className="text-slate-500 text-sm font-medium">Billing entries linked to admissions will appear here. Service categories only — no clinical detail.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  s.color === "primary" ? "bg-blue-50 text-blue-600" :
                  s.color === "success" ? "bg-emerald-50 text-emerald-600" :
                  s.color === "warning" ? "bg-amber-50 text-amber-600" :
                  s.color === "danger" ? "bg-rose-50 text-rose-600" :
                  s.color === "accent" ? "bg-violet-50 text-violet-600" :
                  "bg-slate-50 text-slate-600"
                }`}>
                  <s.icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HardDrive size={18} className="text-slate-400" /> Platform Users
          </h2>
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-4 py-3">Name</th>
                    <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-4 py-3">Email</th>
                    <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-4 py-3">Role</th>
                    <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm font-medium">
                        No users found. Click &ldquo;Seed Users&rdquo; or &ldquo;Full Init&rdquo; to populate.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                        <td className="font-bold text-slate-900 px-4 py-3 text-sm">{user.name || "—"}</td>
                        <td className="font-mono text-xs text-slate-500 px-4 py-3">{user.email || "—"}</td>
                        <td className="px-4 py-3">
                          <Chip
                            size="sm"
                            variant="soft"
                            className={`font-bold uppercase tracking-wider text-[9px] border ${roleColors[user.role || "patient"] || "bg-slate-100 text-slate-600"}`}
                          >
                            {roleLabels[user.role || "patient"] || user.role}
                          </Chip>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <div className={`w-2 h-2 rounded-full ${user.betterAuthId ? "bg-emerald-500" : "bg-slate-300"}`} />
                            <span className={user.betterAuthId ? "text-slate-900" : "text-slate-400"}>
                              {user.betterAuthId ? "Active" : "Pending Auth"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Audit Log */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity size={18} className="text-slate-400" /> System Status
          </h2>
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Platform Seeded</p>
                <Chip
                  size="sm"
                  color={initStatus.isSeeded ? "success" : "danger"}
                  variant="soft"
                  className="font-bold uppercase tracking-wider"
                >
                  {initStatus.isSeeded ? "Yes" : "No"}
                </Chip>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Role Distribution</p>
                <div className="space-y-2">
                  {Object.entries(initStatus.roles).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 capitalize">{role.replace("_", " ")}</span>
                      <span className="text-sm font-bold font-mono text-slate-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Bed Occupancy</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">
                    {beds?.filter((b: { status: string }) => b.status === "vacant").length || 0} vacant
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm font-bold text-rose-600">
                    {beds?.filter((b: { status: string }) => b.status === "occupied").length || 0} occupied
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm font-bold text-amber-600">
                    {beds?.filter((b: { status: string }) => b.status === "pending_discharge").length || 0} pending
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
