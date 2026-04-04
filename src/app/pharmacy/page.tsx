"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Pill, CheckCircle, ShieldCheck, AlertTriangle, Clock, Inbox, Ban, AlertCircle, Info } from "lucide-react";
import { Card, Button, Chip, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, TextArea } from "@heroui/react";
import { Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { checkAllInteractions } from "@/lib/drugInteractions";

export default function PharmacyInterface() {
  const betterAuthId = useBetterAuthId();
  const pendingQueue = useQuery(api.prescriptions.listPending, betterAuthId ? { betterAuthId } : "skip");
  const dispenseMutation = useMutation(api.dispenseRecords.dispense);
  const [verified, setVerified] = useState<Record<string, Set<number>>>({});
  const [dispensing, setDispensing] = useState<string | null>(null);
  const [blockedRx, setBlockedRx] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const toggleVerify = (pid: string, idx: number) => {
    setVerified((prev) => {
      const copy = { ...prev };
      const set = new Set(copy[pid] || []);
      if (set.has(idx)) set.delete(idx); else set.add(idx);
      copy[pid] = set;
      return copy;
    });
  };

  const allVerified = (pid: string, count: number) => (verified[pid]?.size || 0) === count;

  // Check drug interactions for a prescription
  const getInteractions = (medications: { name: string; dose: string; frequency: string; duration: string }[]) => {
    return checkAllInteractions(medications);
  };

  const handleDispense = async (pid: string) => {
    if (!betterAuthId) return;
    setDispensing(pid);
    try {
      await dispenseMutation({ betterAuthId, prescription_id: pid as Id<"prescriptions">, notes: "Verified and dispensed." });
    } catch (e: unknown) { alert("Dispense failed: " + (e as Error).message); }
    finally { setDispensing(null); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex border-b border-slate-200 pb-6 items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <Pill className="text-emerald-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dispensary Terminal</h1>
          <p className="text-slate-500 font-medium">{pendingQueue ? `${pendingQueue.length} pending` : "Loading..."}</p>
        </div>
      </div>

      <div className="space-y-6">
        {pendingQueue === undefined ? (
          <div className="p-12 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-4 text-emerald-600 bg-emerald-50/50">
            <Spinner color="success" size="lg" /><span className="font-bold">Loading queue...</span>
          </div>
        ) : pendingQueue.length === 0 ? (
          <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
            <div className="p-12 text-center">
              <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="font-bold text-slate-700 text-lg mb-2">Queue Empty</h3>
              <p className="text-slate-500 text-sm font-medium">New prescriptions appear here in real-time.</p>
            </div>
          </Card>
        ) : pendingQueue.map((p) => (
          <Card key={p._id} className="border border-slate-200 hover:border-emerald-300 transition-all shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="font-bold text-slate-900 text-lg">{p.patientName}</div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span className="font-mono bg-slate-100 px-2 rounded text-xs">{p.patientNationalId}</span>
                  <span className="text-slate-300">•</span>
                  <span>Dr. {p.doctorName}</span>
                  <span className="text-slate-300">•</span>
                  <Clock size={12} /><span>{new Date(p.issued_at).toLocaleDateString()}</span>
                </div>
              </div>
              {p.patientAllergies && p.patientAllergies.length > 0 && (
                <div className="flex items-center gap-1 bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl">
                  <AlertTriangle size={14} className="text-rose-600" />
                  {p.patientAllergies.map((a: string) => (
                    <Chip key={a} size="sm" color="danger" className="text-[9px] font-black uppercase tracking-widest">{a}</Chip>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5">
              <ul className="space-y-3 mb-6">
                {p.medications.map((m, idx) => {
                  const isV = verified[p._id]?.has(idx) || false;
                  return (
                    <li key={idx} onClick={() => toggleVerify(p._id, idx)}
                      className={`flex gap-4 items-center p-4 rounded-xl border cursor-pointer transition-all ${isV ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100 hover:border-emerald-200"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isV ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                        <CheckCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <strong className="block text-slate-900 font-bold">{m.name}</strong>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{m.dose}</span>
                          <span className="text-slate-300">•</span><span>{m.frequency}</span>
                          <span className="text-slate-300">•</span><span>{m.duration}</span>
                        </div>
                      </div>
                      <Chip size="sm" color={isV ? "success" : "default"} variant="soft" className="text-[9px] font-black uppercase tracking-widest">
                        {isV ? "Verified" : "Pending"}
                      </Chip>
                    </li>
                  );
                })}
              </ul>
              {/* Drug Interaction Check */}
              {(() => {
                const interactions = getInteractions(p.medications);
                const hasSevere = interactions.some(i => i.severity === "severe");
                const hasModerate = interactions.some(i => i.severity === "moderate");
                const hasMild = interactions.some(i => i.severity === "mild");

                return (
                  <>
                    {hasSevere && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Ban size={16} className="text-red-600" />
                          <span className="font-bold text-red-700 text-sm">SEVERE INTERACTION DETECTED</span>
                        </div>
                        {interactions.filter(i => i.severity === "severe").map((interaction, idx) => (
                          <p key={idx} className="text-xs text-red-600 mb-1">
                            {interaction.drug1} + {interaction.drug2}: {interaction.description}
                          </p>
                        ))}
                        <p className="text-xs text-red-500 font-bold mt-2">Dispensing blocked. Contact prescribing doctor.</p>
                      </div>
                    )}
                    {hasModerate && !hasSevere && (
                      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle size={16} className="text-amber-600" />
                          <span className="font-bold text-amber-700 text-sm">MODERATE INTERACTION</span>
                        </div>
                        {interactions.filter(i => i.severity === "moderate").map((interaction, idx) => (
                          <p key={idx} className="text-xs text-amber-600 mb-1">
                            {interaction.drug1} + {interaction.drug2}: {interaction.description}
                          </p>
                        ))}
                      </div>
                    )}
                    {hasMild && !hasModerate && !hasSevere && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Info size={14} className="text-blue-600" />
                          <span className="font-bold text-blue-700 text-xs">MILD INTERACTION</span>
                        </div>
                        {interactions.filter(i => i.severity === "mild").map((interaction, idx) => (
                          <p key={idx} className="text-[10px] text-blue-600">
                            {interaction.drug1} + {interaction.drug2}: {interaction.description}
                          </p>
                        ))}
                      </div>
                    )}

                    <Button onPress={() => handleDispense(p._id)}
                      isDisabled={!allVerified(p._id, p.medications.length) || dispensing === p._id || hasSevere}
                      className={`w-full h-14 font-bold text-base rounded-xl shadow-xl transition-transform ${
                        hasSevere
                          ? "bg-red-100 text-red-400 cursor-not-allowed shadow-none"
                          : allVerified(p._id, p.medications.length)
                          ? "bg-slate-900 text-white hover:scale-[1.01]"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      }`}>
                      <ShieldCheck size={20} className={allVerified(p._id, p.medications.length) && !hasSevere ? "text-emerald-400" : ""} />
                      {hasSevere ? "BLOCKED — Severe Interaction" : dispensing === p._id ? "Processing..." : allVerified(p._id, p.medications.length) ? "Acknowledge & Dispense" : `Verify all ${p.medications.length} lines`}
                    </Button>
                  </>
                );
              })()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
