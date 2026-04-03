"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import { Search, FileText, Download, CheckCircle2, Clock, Filter, Archive } from "lucide-react";

export default function ResultsArchivePage() {
  const archives = [
    { id: "RES-101", patient: "Amir K.", test: "Lipid Profile", date: "Mar 28, 2026", tech: "L. Mansouri", status: "signed" },
    { id: "RES-102", patient: "Fatima Z.", test: "CBC + Differential", date: "Mar 27, 2026", tech: "L. Mansouri", status: "signed" },
    { id: "RES-103", patient: "Yanis M.", test: "Thyroid Panel", date: "Mar 25, 2026", tech: "S. Haddad", status: "signed" },
    { id: "RES-104", patient: "Rania B.", test: "Urinalysis", date: "Mar 24, 2026", tech: "L. Mansouri", status: "signed" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Results Archive</h1>
          <p className="text-slate-500 font-medium mt-1">Access historical analytical reports and verified data</p>
        </div>
        <Button variant="secondary"><Archive size={18} /> Export Batch</Button>
      </div>

      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by patient, test, or result ID..." 
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary"><Filter size={18} /> Date Range</Button>
            <Button variant="secondary">All Tests</Button>
          </div>
        </div>
      </Card>

      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Analysis</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Patient Registry</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Verification</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archives.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{res.test}</div>
                    <div className="text-xs text-slate-400 font-mono">{res.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{res.patient}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {res.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <div className="text-sm font-medium">
                        <div className="text-slate-900">Digitally Signed</div>
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-tight">By {res.tech}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="primary" className="font-bold"><Download size={14} /> PDF</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
