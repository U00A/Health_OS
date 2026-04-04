"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { Users, Server, ShieldAlert, Activity, UserPlus, HardDrive, RefreshCw, Hospital, BedDouble, Stethoscope, UserCheck, Pill, Beaker } from "lucide-react";
import { useState } from "react";

export default function AdminPage() {
  const initStatus = useQuery(api.init.checkInit);
  const users = useQuery(api.adminUsers.listAllUsers);
  const wards = useQuery(api.wards.listAll);
  const beds = useQuery(api.beds.listAll);
  const admissions = useQuery(api.admissions.listAllActive);
  const prescriptions = useQuery(api.prescriptions.listAllActive);
  const labOrders = useQuery(api.labOrders.listAllPending);

  const seedUsers = useMutation(api.authSeeds.seedDemoUsers);
  const masterInit = useMutation(api.init.masterInit);
  const [seeding, setSeeding] = useState(false);
  const [initMessage, setInitMessage] = useState("");

  const handleSeedUsers = async () => {
    setSeeding(true);
    try {
      const result = await seedUsers();
      setInitMessage(result.message);
    } catch (e: unknown) {
      setInitMessage((e as Error).message);
    }
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