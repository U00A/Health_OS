"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Microscope, Beaker, FlaskConical, UploadCloud, FileText, Clock, CheckCircle2, Inbox, AlertTriangle, AlertCircle, TrendingUp, BarChart3, ClipboardList, TestTube, Grid3X3 } from "lucide-react";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { LabResultEntryForm } from "@/components/clinical/LabResultEntryForm";

export default function LabPage() {
  const betterAuthId = useBetterAuthId();
  const orders = useQuery(api.lab_orders.listPendingOrders, betterAuthId ? { betterAuthId } : "skip");
  const completedResults = useQuery(api.lab_results.listByLab, betterAuthId ? { betterAuthId } : "skip");
  const updateStatus = useMutation(api.lab_orders.updateStatus);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedCompletedResult, setSelectedCompletedResult] = useState<string | null>(null);
  const [showCriticalAlert, setShowCriticalAlert] = useState<{ patientName: string; analysisType: string; values: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "completed" | "stats" | "batch">("queue");
  const [amendmentOrderId, setAmendmentOrderId] = useState<string | null>(null);
 
  const selectedOrderData = orders?.find((o) => o._id === selectedOrder);

  const getElapsedTime = (orderedAt: number) => {
    const mins = Math.floor((Date.now() - orderedAt) / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  const handleStartAnalysis = async (orderId: string) => {
    if (!betterAuthId) return;
    try {
      await updateStatus({ betterAuthId, order_id: orderId as any, status: "in_progress" });
    } catch (e: unknown) { alert((e as Error).message); }
  };

  const handleCriticalValueAlert = (patientName: string, analysisType: string, values: string) => {
    setShowCriticalAlert({ patientName, analysisType, values });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex border-b border-slate-200 pb-6 items-center gap-4">
        <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
          <Microscope className="text-violet-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laboratory Queue</h1>
          <p className="text-slate-500 font-medium mt-1">
            {orders ? `${orders.length} active orders` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { key: "queue" as const, label: "Order Queue", icon: Inbox },
          { key: "batch" as const, label: "Batch Entry", icon: Grid3X3 },
          { key: "completed" as const, label: "Completed", icon: CheckCircle2 },
          { key: "stats" as const, label: "Workload Stats", icon: BarChart3 },
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

      {/* Stats Bar */}
      {orders && activeTab === "queue" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-violet-600 text-white border-none shadow-lg shadow-violet-200">
            <div className="p-4 text-center">
              <div className="text-3xl font-black font-mono">{orders.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-200 mt-1">Active Orders</div>
            </div>
          </Card>
          <Card className="border border-amber-200 bg-amber-50">
            <div className="p-4 text-center">
              <div className="text-3xl font-black font-mono text-amber-700">
                {orders.filter((o) => o.urgency === "urgent" || o.urgency === "stat").length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mt-1">Urgent/STAT</div>
            </div>
          </Card>
          <Card className="border border-slate-200 bg-white">
            <div className="p-4 text-center">
              <div className="text-3xl font-black font-mono text-slate-900">
                {orders.filter((o) => o.status === "pending").length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Pending</div>
            </div>
          </Card>
          <Card className="border border-blue-200 bg-blue-50">
            <div className="p-4 text-center">
              <div className="text-3xl font-black font-mono text-blue-700">
                {orders.filter((o) => o.status === "in_progress").length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-1">In Progress</div>
            </div>
          </Card>
        </div>
      )}

      {/* Critical Value Alert Modal */}
      {showCriticalAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-700 text-lg">CRITICAL VALUE DETECTED</h3>
                <p className="text-sm text-red-500">Immediate attention required</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 font-medium">Patient</p>
                <p className="font-bold text-slate-900">{showCriticalAlert.patientName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 font-medium">Analysis</p>
                <p className="font-bold text-slate-900">{showCriticalAlert.analysisType}</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-500 font-medium">Critical Values</p>
                <p className="font-bold text-red-700 text-sm">{showCriticalAlert.values}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 font-bold bg-red-600 text-white"
                onPress={() => {
                  // In production, this would fire a real-time alert to the ordering doctor
                  setShowCriticalAlert(null);
                }}
              >
                <AlertCircle size={16} /> Alert Ordering Doctor
              </Button>
              <Button variant="ghost" className="font-bold" onPress={() => setShowCriticalAlert(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Result Entry Form */}
      {selectedOrder && selectedOrderData && betterAuthId && activeTab === "queue" && (
        <LabResultEntryForm
          orderId={selectedOrder}
          analysisType={selectedOrderData.analysis_type}
          patientName={selectedOrderData.patientName}
          betterAuthId={betterAuthId}
          onSuccess={() => setSelectedOrder(null)}
          onCancel={() => setSelectedOrder(null)}
          onCriticalAlert={handleCriticalValueAlert}
        />
      )}

      {/* Completed Orders Tab */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            Completed Results
          </h2>
          {completedResults === undefined ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : completedResults.length === 0 ? (
            <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
              <div className="p-12 text-center">
                <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 text-lg mb-2">No Completed Results</h3>
                <p className="text-slate-500 text-sm font-medium">Completed results will appear here.</p>
              </div>
            </Card>
          ) : (
            completedResults.map((r) => (
              <Card key={r._id} className="border border-emerald-200 shadow-sm">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{(r as any).patientName || "Unknown Patient"}</p>
                      <p className="text-xs text-slate-500">Uploaded {new Date(r.uploaded_at).toLocaleString()}</p>
                      {r.is_amendment && (
                        <Chip size="sm" color="warning" variant="soft" className="text-[9px] font-black uppercase mt-1">Amendment</Chip>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="font-bold text-violet-600" onPress={() => setAmendmentOrderId(r.order_id)}>
                      <FileText size={14} /> Amend
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Amendment Form */}
      {amendmentOrderId && (
        <Card className="border border-amber-200 shadow-lg bg-amber-50/30">
          <div className="p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <FileText size={18} className="text-amber-600" /> Amend Result
            </h2>
            <p className="text-sm text-slate-600">Submit a correction. The original result will be preserved and the amendment will be linked.</p>
            <LabResultEntryForm
              orderId={amendmentOrderId}
              analysisType="Amendment"
              patientName="Amendment"
              betterAuthId={betterAuthId!}
              onSuccess={() => { setAmendmentOrderId(null); }}
              onCancel={() => setAmendmentOrderId(null)}
              onCriticalAlert={handleCriticalValueAlert}
            />
          </div>
        </Card>
      )}

      {/* Workload Stats Tab */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-violet-600" />
            Daily Workload Summary
          </h2>
          {orders && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border border-slate-200 bg-white">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Completed Today</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{completedResults?.length || 0}</div>
                </div>
              </Card>
              <Card className="border border-slate-200 bg-white">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Avg Turnaround</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">--</div>
                </div>
              </Card>
              <Card className="border border-slate-200 bg-white">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Critical Alerts</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900">0</div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Batch Entry Tab */}
      {activeTab === "batch" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Grid3X3 size={20} className="text-violet-600" />
            Batch Result Entry
          </h2>
          <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
            <div className="p-12 text-center">
              <Grid3X3 size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="font-bold text-slate-700 text-lg mb-2">Batch Entry Grid</h3>
              <p className="text-slate-500 text-sm font-medium">Select a panel type and enter results for multiple patients simultaneously.</p>
              <div className="mt-6 max-w-md mx-auto space-y-4">
                <select className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none">
                  <option value="">Select panel type...</option>
                  <option value="cbc">Complete Blood Count (CBC)</option>
                  <option value="metabolic">Metabolic Panel</option>
                  <option value="lipid">Lipid Panel</option>
                  <option value="glucose">Blood Glucose</option>
                </select>
                <Button className="w-full font-bold bg-violet-600 text-white" isDisabled>
                  Load Patient Grid
                </Button>
                <p className="text-xs text-slate-400">Pending orders for the selected panel will appear in a grid for rapid entry.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Orders List */}
      {!selectedOrder && activeTab === "queue" && (
        <div className="space-y-4">
          {orders === undefined ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : orders.length === 0 ? (
            <Card className="border border-dashed border-slate-200 shadow-none bg-slate-50">
              <div className="p-12 text-center">
                <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 text-lg mb-2">No Active Orders</h3>
                <p className="text-slate-500 text-sm font-medium">Orders appear here in real-time when doctors submit them.</p>
              </div>
            </Card>
          ) : (
            orders.map((o) => {
              const elapsed = getElapsedTime(o.ordered_at);
              const isUrgent = o.urgency === "urgent" || o.urgency === "stat";
              const isProcessing = o.status === "in_progress";
              return (
                <Card key={o._id} className={`border shadow-sm hover:border-violet-300 transition-colors ${isUrgent ? "border-amber-300 shadow-amber-100" : "border-slate-200"}`}>
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isProcessing ? "bg-violet-100 text-violet-600 animate-pulse" : "bg-slate-100 text-slate-500"}`}>
                        <FlaskConical size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-lg">{o.analysis_type}</h3>
                          {isUrgent && (
                            <Chip size="sm" color={o.urgency === "stat" ? "danger" : "warning"} className="font-black uppercase tracking-widest text-[9px]">
                              {o.urgency}
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><FileText size={12} /> {o.patientName}</span>
                          <span className="text-slate-300">•</span>
                          <span>Dr. {o.doctorName}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`flex items-center gap-1 font-mono text-xs ${isUrgent ? "text-amber-600 font-bold" : ""}`}>
                            <Clock size={12} /> {elapsed}
                          </span>
                        </div>
                        {o.clinical_notes && (
                          <p className="text-xs text-slate-400 mt-1 italic">Note: {o.clinical_notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {o.status === "pending" ? (
                        <Button size="sm" className="font-bold bg-slate-900 text-white" onPress={() => handleStartAnalysis(o._id)}>
                          <Beaker size={14} /> Start Analysis
                        </Button>
                      ) : (
                        <Button size="sm" className="font-bold bg-violet-600 text-white" onPress={() => setSelectedOrder(o._id)}>
                          <UploadCloud size={14} /> Upload Result
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
