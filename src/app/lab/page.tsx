"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Microscope, Beaker, FlaskConical, UploadCloud, FileText, Clock, CheckCircle2, Inbox } from "lucide-react";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { LabResultEntryForm } from "@/components/clinical/LabResultEntryForm";

export default function LabPage() {
  const betterAuthId = useBetterAuthId();
  const orders = useQuery(api.labOrders.listPendingOrders, betterAuthId ? { betterAuthId } : "skip");
  const updateStatus = useMutation(api.labOrders.updateStatus);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

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

      {/* Stats Bar */}
      {orders && (
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

      {/* Result Entry Form */}
      {selectedOrder && selectedOrderData && betterAuthId && (
        <LabResultEntryForm
          orderId={selectedOrder}
          analysisType={selectedOrderData.analysis_type}
          patientName={selectedOrderData.patientName}
          betterAuthId={betterAuthId}
          onSuccess={() => setSelectedOrder(null)}
          onCancel={() => setSelectedOrder(null)}
        />
      )}

      {/* Orders List */}
      {!selectedOrder && (
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
