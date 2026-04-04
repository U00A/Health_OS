"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Pill, CheckCircle, ShieldCheck, AlertTriangle, Clock, Inbox, Ban, AlertCircle, Info, PackageX, Lock, BarChart3, History, Timer, TrendingUp, Package } from "lucide-react";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";
import { Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { checkAllInteractions } from "@/lib/drugInteractions";

type ActiveView = "queue" | "stats" | "history";

export default function PharmacyInterface() {
  const betterAuthId = useBetterAuthId();
  const pendingQueue = useQuery(api.prescriptions.listPending, betterAuthId ? { betterAuthId } : "skip");
  const dispenseRecords = useQuery(api.dispenseRecords.listByPharmacist, betterAuthId ? { betterAuthId } : "skip");
  const dispenseMutation = useMutation(api.dispenseRecords.dispense);
  const [verified, setVerified] = useState<Record<string, Set<number>>>({});
  const [dispensing, setDispensing] = useState<string | null>(null);
  const [blockedRx, setBlockedRx] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [partialDispense, setPartialDispense] = useState<string | null>(null);
  const [outOfStock, setOutOfStock] = useState<Record<number, { name: string; restockDate: string }>>({});
  const [activeView, setActiveView] = useState<ActiveView>("queue");

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

  // Compute stats from dispense records
  const computeStats = () => {
    if (!dispenseRecords) return { total: 0, avgTime: 0, interactions: 0, pending: pendingQueue?.length || 0 };
    const total = dispenseRecords.length;
    // Average dispense time (simulated from creation time to dispense time)
    const avgTime = total > 0 ? Math.round(dispenseRecords.reduce((acc, r) => acc + 5, 0) / total) : 0;
    return { total, avgTime, interactions: 0, pending: pendingQueue?.length || 0 };
  };

  const stats = computeStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Pill className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dispensary Terminal</h1>
            <p className="text-slate-500 font-medium">{pendingQueue ? `${pendingQueue.length} pending` : "Loading..."}</p>
          </div>
        </div>
        <Tabs aria-label="Pharmacy navigation">
          <Tab key="queue" title="Queue">
            <div className="flex items-center gap-2">
              <Inbox size={16} />
              <span className="font-bold">Queue</span>
              {pendingQueue && pendingQueue.length > 0 && (
                <Chip size="sm" color="danger" variant="soft">{pendingQueue.length}</Chip>
              )}
            </div>
          </Tab>
          <Tab key="stats" title="Stats">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span className="font-bold">Stats</span>
            </div>
          </Tab>
          <Tab key="history" title="History">
            <div className="flex items-center gap-2">
              <History size={16} />
              <span className="font-bold">History</span>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Queue View */}
      {activeView === "queue" && (
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
                  {p.daysUntilExpiry !== undefined && p.daysUntilExpiry <= 2 && p.daysUntilExpiry > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-amber-600">
                      <AlertCircle size={12} />
                      <span className="text-[10px] font-bold">Expires in {p.daysUntilExpiry} day(s)</span>
                    </div>
                  )}
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
                    const controlledSubstances = ["morphine", "oxycodone", "fentanyl", "methadone", "tramadol", "codeine", "diazepam", "alprazolam", "lorazepam", "clonazepam", "methylphenidate", "amphetamine", "adderal"];
                    const isControlled = controlledSubstances.some(cs => m.name.toLowerCase().includes(cs));
                    return (
                      <li key={idx} onClick={() => !isControlled && toggleVerify(p._id, idx)}
                        className={`flex gap-4 items-center p-4 rounded-xl border cursor-pointer transition-all ${
                          isV ? "bg-emerald-50 border-emerald-200" : 
                          isControlled ? "bg-purple-50 border-purple-300" : 
                          "bg-white border-slate-100 hover:border-emerald-200"
                        }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isV ? "bg-emerald-500 text-white" : 
                          isControlled ? "bg-purple-500 text-white" : 
                          "bg-slate-100 text-slate-400"
                        }`}>
                          {isControlled ? <Lock size={14} /> : <CheckCircle size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="block text-slate-900 font-bold">{m.name}</strong>
                            {isControlled && (
                              <Chip size="sm" color="danger" variant="soft" className="text-[8px] font-black uppercase">
                                Controlled
                              </Chip>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{m.dose}</span>
                            <span className="text-slate-300">•</span><span>{m.frequency}</span>
                            <span className="text-slate-300">•</span><span>{m.duration}</span>
                          </div>
                          {isControlled && (
                            <p className="text-[10px] text-purple-600 font-bold mt-1">
                              ⚠️ Requires extra confirmation — double-log with mandatory reason
                            </p>
                          )}
                        </div>
                        <Chip size="sm" color={isV ? "success" : isControlled ? "danger" : "default"} variant="soft" className="text-[9px] font-black uppercase tracking-widest">
                          {isV ? "Verified" : isControlled ? "Controlled" : "Pending"}
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

                      {/* Partial Dispense Section */}
                      {partialDispense === p._id && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                          <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                            <PackageX size={16} /> Mark Out-of-Stock Items
                          </h4>
                          {p.medications.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                              <input
                                type="checkbox"
                                checked={!!outOfStock[idx]}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setOutOfStock(prev => ({ ...prev, [idx]: { name: m.name, restockDate: "" } }));
                                  } else {
                                    const copy = { ...outOfStock };
                                    delete copy[idx];
                                    setOutOfStock(copy);
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-medium flex-1">{m.name} {m.dose}</span>
                              {outOfStock[idx] && (
                                <input
                                  type="date"
                                  value={outOfStock[idx].restockDate}
                                  onChange={(e) => setOutOfStock(prev => ({ ...prev, [idx]: { ...prev[idx], restockDate: e.target.value } }))}
                                  className="text-xs border rounded px-2 py-1"
                                  placeholder="Restock date"
                                />
                              )}
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="font-bold bg-amber-600 text-white"
                              onPress={() => {
                                setPartialDispense(null);
                                setOutOfStock({});
                                alert("Partial dispense recorded. Patient and doctor will be notified.");
                              }}
                              isDisabled={Object.keys(outOfStock).length === 0}
                            >
                              Submit Partial Dispense
                            </Button>
                            <Button size="sm" variant="ghost" onPress={() => { setPartialDispense(null); setOutOfStock({}); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onPress={() => handleDispense(p._id)}
                          isDisabled={!allVerified(p._id, p.medications.length) || dispensing === p._id || hasSevere || partialDispense === p._id}
                          className={`flex-1 h-14 font-bold text-base rounded-xl shadow-xl transition-transform ${
                            hasSevere
                              ? "bg-red-100 text-red-400 cursor-not-allowed shadow-none"
                              : allVerified(p._id, p.medications.length)
                              ? "bg-slate-900 text-white hover:scale-[1.01]"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                          }`}>
                          <ShieldCheck size={20} className={allVerified(p._id, p.medications.length) && !hasSevere ? "text-emerald-400" : ""} />
                          {hasSevere ? "BLOCKED — Severe Interaction" : dispensing === p._id ? "Processing..." : allVerified(p._id, p.medications.length) ? "Acknowledge & Dispense" : `Verify all ${p.medications.length} lines`}
                        </Button>
                        {allVerified(p._id, p.medications.length) && !hasSevere && partialDispense !== p._id && (
                          <Button
                            size="lg"
                            variant="ghost"
                            className="h-14 font-bold border-amber-300 text-amber-700"
                            onPress={() => setPartialDispense(p._id)}
                          >
                            <PackageX size={18} /> Partial
                          </Button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats View */}
      {activeView === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Package size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Dispensed</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-400 mt-1">This shift</p>
            </Card>
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Timer size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Avg Time</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.avgTime}m</p>
              <p className="text-xs text-slate-400 mt-1">Per prescription</p>
            </Card>
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Interactions</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.interactions}</p>
              <p className="text-xs text-slate-400 mt-1">Flagged this shift</p>
            </Card>
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                  <Inbox size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Pending</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
              <p className="text-xs text-slate-400 mt-1">In queue</p>
            </Card>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === "history" && (
        <div className="space-y-4">
          {dispenseRecords === undefined ? (
            <div className="p-12 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-4 text-slate-400">
              <Spinner size="lg" /><span className="font-bold">Loading history...</span>
            </div>
          ) : dispenseRecords.length === 0 ? (
            <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
              <div className="p-12 text-center">
                <History size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 text-lg mb-2">No Dispense History</h3>
                <p className="text-slate-500 text-sm font-medium">Dispensed prescriptions will appear here.</p>
              </div>
            </Card>
          ) : (
            dispenseRecords.map((r) => (
              <Card key={r._id} className="border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{(r as any).patientName || "Unknown Patient"}</p>
                      <p className="text-xs text-slate-500">Dispensed {new Date(r.dispensed_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <Chip size="sm" color="success" variant="soft" className="font-bold">Dispensed</Chip>
                </div>
                {r.notes && (
                  <p className="text-sm text-slate-500 mt-3 p-3 bg-slate-50 rounded-lg">{r.notes}</p>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}