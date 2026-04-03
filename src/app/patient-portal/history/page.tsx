"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import { FileText, Download, CheckCircle2, Clock, Calendar, Shield, Activity } from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

export default function PatientHistoryPage() {
  const records = [
    { id: "REC-992", type: "Clinical Report", provider: "Dr. Amara R.", date: "Mar 28, 2026", status: "verified" },
    { id: "REC-991", type: "Lab Results", provider: "Central Laboratory", date: "Mar 25, 2026", status: "verified" },
    { id: "REC-990", type: "Prescription", provider: "Dr. Amara R.", date: "Mar 20, 2026", status: "completed" },
    { id: "REC-989", type: "Imaging", provider: "Radiology Dept", date: "Mar 15, 2026", status: "verified" },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medical History</h1>
          <p className="text-slate-500 font-medium mt-1">Access your secure clinical records and analysis</p>
        </div>
        <Button variant="primary" className="font-bold"><Download size={18} /> Download Full PDF</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs aria-label="Records Filter">
            <Tab key="all" title={<span className="font-bold tracking-tight">All Records</span>}>
              <div className="flex flex-col gap-4 mt-6">
                {records.map((rec) => (
                  <Card key={rec.id} className="border border-slate-200 shadow-sm hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-black text-lg text-slate-900 tracking-tight">{rec.type}</div>
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                            <span>{rec.provider}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1"><Calendar size={12}/> {rec.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Chip size="sm" variant="soft" color="success" className="font-black uppercase tracking-widest text-[9px]">
                          {rec.status}
                        </Chip>
                        <Button isIconOnly variant="ghost" className="text-slate-300 group-hover:text-blue-600">
                          <Download size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Tab>
            <Tab key="reports" title={<span className="font-bold tracking-tight">Reports</span>} />
            <Tab key="lab" title={<span className="font-bold tracking-tight">Laboratory</span>} />
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold tracking-tight">Privacy Guard</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your medical data is encrypted using AES-256 protocols. Only authorized clinical staff with active assignments can access your detailed history.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <Activity size={16} className="text-emerald-400" />
                <div className="text-xs font-bold text-slate-300">Last accessed: Today, 10:45 AM</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
