"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Pill, CheckCircle, Search, ShieldCheck } from "lucide-react";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";

export default function PharmacyInterface() {
  const betterAuthId = useBetterAuthId();
  const [patientId, setPatientId] = useState("");
  // Conditionally execute query if we have a plausible ID
  const prescriptions = useQuery(api.prescriptions.listByPatient, 
    patientId.length > 5 ? { patient_id: patientId as Id<"patients"> } : "skip"
  );
  
  const dispenseMutation = useMutation(api.dispenseRecords.dispense);

  const handleDispense = async (pid: Id<"prescriptions">) => {
    if (!betterAuthId) return;
    try {
      await dispenseMutation({ betterAuthId, prescription_id: pid, notes: "Verified and dispensed securely via POS terminal." });
      alert("Verification successful. Dispense record immutably locked.");
    } catch(e: any) {
      alert("Transaction verification failed: " + e.message);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex border-b border-slate-200 pb-6 items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <Pill className="text-emerald-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dispensary Terminal</h1>
          <p className="text-slate-500 font-medium">Verify & Dispense Secure Prescriptions</p>
        </div>
      </div>

      <Card className="border-l-4 border-l-emerald-500 max-w-xl shadow-lg shadow-emerald-100/50">
        <div className="p-6 space-y-4">
          <label className="block text-sm font-black uppercase tracking-widest text-slate-400">
            Patient Registry Scan
          </label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Search patient UID..." 
                className="w-full text-lg font-mono p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-slate-50 outline-none"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <Button 
              className="h-14 w-14 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-200" 
              isIconOnly
            >
              <Search size={24} />
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-6 max-w-3xl">
        {prescriptions === undefined && patientId.length > 5 ? (
          <div className="p-12 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 text-emerald-600 bg-emerald-50/50 h-48">
            <Spinner color="success" size="lg" />
            <span className="font-bold tracking-tight">Accessing secure records...</span>
          </div>
        ) : prescriptions?.length === 0 ? (
          <div className="p-8 border border-slate-200 border-dashed rounded-3xl bg-slate-50 flex items-center justify-center">
            <p className="text-slate-500 font-medium text-lg">No active prescriptions allocated to this registry ID.</p>
          </div>
        ) : (
          prescriptions?.map((p: Doc<"prescriptions">) => (
            <Card key={p._id} className="border border-slate-200 hover:border-emerald-300 transition-all shadow-sm group overflow-hidden">
              <div className="p-0">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Issued: <span className="text-slate-900 font-bold">{new Date(p.issued_at).toLocaleDateString()}</span>
                  </div>
                   <Chip 
                     color={p.status === 'active' ? 'accent' : p.status === 'dispensed' ? 'default' : 'danger'} 
                     variant="soft"
                     className="font-black uppercase tracking-widest text-[10px]"
                   >
                     {p.status}
                   </Chip>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4 mb-8">
                    {p.medications.map((m, idx) => (
                      <li key={idx} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Pill size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <strong className="block text-slate-900 text-lg font-bold">{m.name}</strong>
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{m.dose}</span>
                            <span className="text-slate-300">•</span>
                            <span>{m.frequency}</span>
                            <span className="text-slate-300">•</span>
                            <span>{m.duration}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {p.status === 'active' && (
                    <Button 
                      onPress={() => handleDispense(p._id)}
                      className="w-full h-14 bg-slate-900 text-white font-bold text-base rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.01] transition-transform"
                    >
                      <ShieldCheck size={20} className="text-emerald-400" /> Acknowledge & Authenticate Dispense
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
