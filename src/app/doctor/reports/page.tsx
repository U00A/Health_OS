"use client";

import { Card, Button, Chip, Input } from "@heroui/react";
import {
  FileText, Search, Filter, PenLine, CheckCircle2,
  Clock, Download, Eye, FileSignature, BarChart3, AlertCircle
} from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

export default function ClinicalReportsPage() {
  const stats = [
    { label: "Reports Written", value: "128", icon: FileText, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Review", value: "5", icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Signed & Sealed", value: "123", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  ];

  const reports = [
    { id: "CR-4401", patient: "Amir K.", diagnosis: "I21.9", title: "Acute MI — Post-PCI Follow-up", date: "Mar 30, 2026", status: "signed" },
    { id: "CR-4402", patient: "Fatima Z.", diagnosis: "J44.1", title: "COPD Exacerbation Assessment", date: "Mar 29, 2026", status: "signed" },
    { id: "CR-4403", patient: "Yanis M.", diagnosis: "—", title: "Initial Consultation — Lipid Panel Review", date: "Mar 28, 2026", status: "draft" },
    { id: "CR-4404", patient: "Rania B.", diagnosis: "E11.65", title: "Diabetes Annual Review", date: "Mar 27, 2026", status: "pending_review" },
    { id: "CR-4405", patient: "Karim D.", diagnosis: "K21.0", title: "GERD Management Plan", date: "Mar 26, 2026", status: "signed" },
  ];

  const statusConfig: Record<string, { label: string; color: "success" | "warning" | "default" }> = {
    signed: { label: "Signed", color: "success" },
    draft: { label: "Draft", color: "default" },
    pending_review: { label: "Pending Review", color: "warning" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Author, review, and sign medical reports</p>
        </div>
        <Button variant="primary" className="font-bold shadow-lg shadow-blue-200">
          <PenLine size={18} /> New Report
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm">
            <div className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{s.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search reports by patient, diagnosis code, or title..."
              className="pl-9 bg-white border border-slate-200 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="font-bold"><Filter size={18} /> Date Range</Button>
            <Button variant="secondary" className="font-bold">All Statuses</Button>
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Tabs aria-label="Report Status Filter">
        <Tab key="all" title={<span className="font-bold tracking-tight">All Reports</span>}>
          <Card className="border border-slate-200 shadow-sm overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Report</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Patient</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">ICD-10</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => {
                    const cfg = statusConfig[r.status] ?? { label: r.status, color: "default" as const };
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{r.title}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <span className="font-mono">{r.id}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1"><Clock size={11} /> {r.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-700">{r.patient}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-mono font-bold ${r.diagnosis === "—" ? "text-slate-300" : "text-slate-600 bg-slate-100 px-2 py-0.5 rounded"}`}>
                            {r.diagnosis}
                          </span>
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
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="font-bold text-slate-600" isIconOnly>
                              <Eye size={16} />
                            </Button>
                            {r.status === "draft" && (
                              <Button size="sm" variant="ghost" className="font-bold text-blue-600" isIconOnly>
                                <PenLine size={16} />
                              </Button>
                            )}
                            {r.status === "pending_review" && (
                              <Button size="sm" variant="secondary" className="font-bold text-emerald-600">
                                <CheckCircle2 size={16} /> Sign
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="font-bold text-slate-400" isIconOnly>
                              <Download size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Tab>
        <Tab key="drafts" title={<span className="font-bold tracking-tight">Drafts</span>} />
        <Tab key="pending" title={<span className="font-bold tracking-tight">Pending Review</span>} />
      </Tabs>
    </div>
  );
}
