"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import { Search, UserRound, FileText, Activity, Pill, Beaker, UserPlus, AlertTriangle } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { PatientHeaderBar } from "@/components/patient/PatientHeaderBar";
import { PatientSearchModal } from "@/components/clinical/PatientSearchModal";
import { PrescriptionForm } from "@/components/clinical/PrescriptionForm";
import { CompteRenduForm } from "@/components/clinical/CompteRenduForm";
import { LabOrderForm } from "@/components/clinical/LabOrderForm";

type ActiveView = "list" | "prescription" | "compte_rendu" | "lab_order";

export default function DoctorPage() {
  const betterAuthId = useBetterAuthId();
  const patients = useQuery(
    api.doctorPatients.listMyPatients,
    betterAuthId ? { betterAuthId } : "skip"
  );
  const [selectedPatient, setSelectedPatient] = useState<Doc<"patients"> | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [showSearch, setShowSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const filteredPatients = patients?.filter(
    (p) =>
      !searchFilter ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.national_id.includes(searchFilter)
  );

  const handleSelectPatient = (p: Doc<"patients">) => {
    setSelectedPatient(p);
    setActiveView("list");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            {patients ? `${patients.length} active patients` : "Loading..."}
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
          <Button
            className="font-bold bg-indigo-600 text-white shadow-md shadow-indigo-200"
            onPress={() => setActiveView("compte_rendu")}
          >
            <FileText size={14} /> Write Compte Rendu
          </Button>
          <Button
            className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200"
            onPress={() => setActiveView("prescription")}
          >
            <Pill size={14} /> Write Prescription
          </Button>
          <Button
            className="font-bold bg-violet-600 text-white shadow-md shadow-violet-200"
            onPress={() => setActiveView("lab_order")}
          >
            <Beaker size={14} /> Order Lab
          </Button>
        </div>
      )}

      {/* Forms */}
      {selectedPatient && activeView === "prescription" && betterAuthId && (
        <PrescriptionForm
          patient={selectedPatient}
          betterAuthId={betterAuthId}
          onSuccess={() => setActiveView("list")}
          onCancel={() => setActiveView("list")}
        />
      )}
      {selectedPatient && activeView === "compte_rendu" && betterAuthId && (
        <CompteRenduForm
          patient={selectedPatient}
          betterAuthId={betterAuthId}
          onSuccess={() => setActiveView("list")}
          onCancel={() => setActiveView("list")}
        />
      )}
      {selectedPatient && activeView === "lab_order" && betterAuthId && (
        <LabOrderForm
          patient={selectedPatient}
          betterAuthId={betterAuthId}
          onSuccess={() => setActiveView("list")}
          onCancel={() => setActiveView("list")}
        />
      )}

      {/* Patient List */}
      {activeView === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {patients === undefined ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))
            ) : filteredPatients && filteredPatients.length === 0 ? (
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
              filteredPatients?.map((p) => (
                <Card
                  key={p._id}
                  isPressable
                  onPress={() => handleSelectPatient(p as unknown as Doc<"patients">)}
                  className={`border shadow-sm hover:border-blue-300 transition-all group cursor-pointer ${
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
                            {p.allergies.map((a: string) => (
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
                </Card>
              ))
            )}
          </div>

          {/* Sidebar stats */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200 border-none">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={24} className="text-blue-200" />
                  <h3 className="text-lg font-bold tracking-tight">Shift Status</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20">
                    <span className="text-sm font-medium text-blue-100">Active Patients</span>
                    <span className="font-black font-mono text-2xl">{patients?.length || 0}</span>
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
