"use client";

import { Card, Button, Chip, Input } from "@heroui/react";
import {
  Search, TestTube2, Beaker, Clock, CheckCircle2,
  ArrowRight, Filter, RefreshCw, Package, AlertCircle, ScanLine
} from "lucide-react";

export default function SampleTrackingPage() {
  const pipeline = [
    { label: "Received", value: 18, icon: Package, color: "bg-blue-50 text-blue-600", barColor: "bg-blue-500" },
    { label: "Processing", value: 7, icon: Beaker, color: "bg-violet-50 text-violet-600", barColor: "bg-violet-500" },
    { label: "Completed", value: 34, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", barColor: "bg-emerald-500" },
    { label: "Flagged", value: 2, icon: AlertCircle, color: "bg-rose-50 text-rose-600", barColor: "bg-rose-500" },
  ];

  const samples = [
    { barcode: "SMP-20260402-001", patient: "Amir K.", type: "Venous Blood", collected: "08:15 AM", received: "08:40 AM", status: "processing", tech: "L. Mansouri" },
    { barcode: "SMP-20260402-002", patient: "Fatima Z.", type: "Urine — Midstream", collected: "07:45 AM", received: "08:10 AM", status: "completed", tech: "L. Mansouri" },
    { barcode: "SMP-20260402-003", patient: "Yanis M.", type: "Venous Blood", collected: "09:00 AM", received: "09:22 AM", status: "received", tech: "—" },
    { barcode: "SMP-20260402-004", patient: "Rania B.", type: "Capillary Blood", collected: "09:30 AM", received: "09:45 AM", status: "processing", tech: "S. Haddad" },
    { barcode: "SMP-20260402-005", patient: "Karim D.", type: "CSF", collected: "10:00 AM", received: "10:15 AM", status: "flagged", tech: "L. Mansouri" },
    { barcode: "SMP-20260402-006", patient: "Leila S.", type: "Venous Blood", collected: "10:30 AM", received: "—", status: "received", tech: "—" },
  ];

  const statusConfig: Record<string, { label: string; color: "accent" | "warning" | "success" | "danger" | "default" }> = {
    received: { label: "Received", color: "accent" },
    processing: { label: "Processing", color: "warning" },
    completed: { label: "Completed", color: "success" },
    flagged: { label: "Flagged", color: "danger" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sample Tracking</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor specimen lifecycle from collection to result</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="font-bold border border-slate-200"><ScanLine size={18} /> Scan Barcode</Button>
          <Button variant="primary" className="font-bold bg-violet-600 shadow-lg shadow-violet-200"><TestTube2 size={18} /> Log Sample</Button>
        </div>
      </div>

      {/* Pipeline Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {pipeline.map((p, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color}`}>
                  <p.icon size={20} />
                </div>
                {i < pipeline.length - 1 && (
                  <ArrowRight size={16} className="text-slate-300 hidden md:block" />
                )}
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">{p.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{p.label}</div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${p.barColor}`} style={{ width: `${(p.value / 61) * 100}%` }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by barcode, patient, or sample type..."
              className="pl-9 bg-white border border-slate-200 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="font-bold"><Filter size={18} /> Status</Button>
            <Button variant="secondary" className="font-bold"><RefreshCw size={18} /> Refresh</Button>
          </div>
        </div>
      </Card>

      {/* Samples Table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Barcode</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Patient</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Specimen</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Timeline</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {samples.map((s) => {
                const cfg = statusConfig[s.status] ?? { label: s.status, color: "default" as const };
                return (
                  <tr key={s.barcode} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-sm text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {s.barcode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{s.patient}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">{s.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={12} className="text-slate-400" />
                          Collected: <span className="font-bold font-mono text-slate-700">{s.collected}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Package size={12} className="text-slate-400" />
                          Received: <span className="font-bold font-mono text-slate-700">{s.received}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Chip
                        size="sm"
                        color={cfg.color}
variant="soft"
                        className="font-black uppercase tracking-widest text-[9px]"
                      >
                        {cfg.label}
                      </Chip>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${s.tech === "—" ? "text-slate-300" : "text-slate-700"}`}>{s.tech}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
