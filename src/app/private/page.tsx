"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import {
  Building2, UserPlus, Users, Search, FileText, Pill, Beaker,
  AlertTriangle, UserRound, Plus
} from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { PatientHeaderBar } from "@/components/patient/PatientHeaderBar";
import { PatientSearchModal } from "@/components/clinical/PatientSearchModal";
import { PrescriptionForm } from "@/components/clinical/PrescriptionForm";
import { CompteRenduForm } from "@/components/clinical/CompteRenduForm";
import { LabOrderForm } from "@/components/clinical/LabOrderForm";
import { RegisterPatientForm } from "@/components/clinical/RegisterPatientForm";

type ActiveView = "list" | "prescription" | "compte_rendu" | "lab_order" | "register";

export default function PrivatePage() {
  const betterAuthId = useBetterAuthId();
  const patients = useQuery(
    api.doctorPatients.listMyPatients,
    betterAuthId ? { betterAuthId } : "skip"
  );
  const [selectedPatient, setSelectedPatient] = useState<Doc<"patients"> | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [showSearch, setShowSearch] = useState(false);

  const handleSelectPatient = (p: Doc<"patients">) => {
    setSelectedPatient(p);
    setActiveView("list");
  };

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
              {patients ? `${patients.length} enrolled patients` : "Loading..."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="font-bold bg-teal-600 text-white shadow-md shadow-teal-200"
            onPress={() => setShowSearch(true)}
          >
            <UserPlus size={16} /> Enroll Patient
          </Button>
          <Button
            variant="ghost"
            className="font-bold text-teal-700 border border-teal-200"
            onPress={() => setActiveView("register")}
          >
            <Plus size={16} /> Register New
          </Button>
        </div>
      </div>

      {/* Patient Header */}
      {selectedPatient && (
        <PatientHeaderBar
          patient={selectedPatient}
          onClose={() => { setSelectedPatient(null); setActiveView("list"); }}
        />
      )}

      {/* Action Buttons */}
      {selectedPatient && activeView === "list" && (
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
        </div>
      )}

      {/* Forms */}
      {selectedPatient && activeView === "prescription" && betterAuthId && (
        <PrescriptionForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {selectedPatient && activeView === "compte_rendu" && betterAuthId && (
        <CompteRenduForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {selectedPatient && activeView === "lab_order" && betterAuthId && (
        <LabOrderForm patient={selectedPatient} betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}
      {activeView === "register" && betterAuthId && (
        <RegisterPatientForm betterAuthId={betterAuthId} onSuccess={() => setActiveView("list")} onCancel={() => setActiveView("list")} />
      )}

      {/* Patient List */}
      {activeView === "list" && !selectedPatient && (
        <div className="space-y-4">
          {patients === undefined ? (
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
              <Card
                key={p._id}
                isPressable
                onPress={() => handleSelectPatient(p as unknown as Doc<"patients">)}
                className="border border-slate-200 shadow-sm hover:border-teal-300 transition-all group cursor-pointer"
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
                          {p.allergies.map((a: string) => (
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
              </Card>
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
