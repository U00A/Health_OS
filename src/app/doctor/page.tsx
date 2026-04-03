"use client";

import { Card, Button, Chip, Input } from "@heroui/react";
import { Search, UserRound, FileText, Activity, StickyNote, CalendarPlus } from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

export default function DoctorPage() {
  const patients = [
    { id: "P-8812", name: "Amir K.", age: 45, status: "stable", condition: "Post-op observation" },
    { id: "P-8813", name: "Fatima Z.", age: 62, status: "critical", condition: "Acute myocardial infarction" },
    { id: "P-8814", name: "Yanis M.", age: 28, status: "review", condition: "Awaiting lab results" },
    { id: "P-8815", name: "Rania B.", age: 34, status: "stable", condition: "Routine checkup" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your patients and reviews</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search patient UID or name..." 
              className="w-full md:w-64 bg-white border border-slate-200 shadow-sm pl-9"
            />
          </div>
          <Button variant="primary" className="font-bold shadow-md shadow-blue-200" isIconOnly>
            <CalendarPlus size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs aria-label="Patient categories">
            <Tab key="all" title={<span className="font-bold tracking-tight">My Patients</span>}>
              <div className="flex flex-col gap-4 mt-4">
                {patients.map((p) => (
                  <Card key={p.id} className="border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group cursor-pointer">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                          <UserRound size={20} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 rounded-md">{p.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <span>{p.age} yrs</span>
                            <span className="text-slate-300">•</span>
                            <span>{p.condition}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto">
                        <Chip 
                          size="sm" 
                          color={p.status === 'critical' ? 'danger' : p.status === 'review' ? 'warning' : 'success'} 
                          className="font-black uppercase tracking-widest text-[10px] sm:mb-2"
                        >
                          {p.status}
                        </Chip>
                        <Button size="sm" variant="ghost" className="font-bold text-blue-600"><FileText size={14} /> Open Chart</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Tab>
            <Tab key="consults" title={<span className="font-bold tracking-tight">Pending Consults</span>} />
            <Tab key="discharged" title={<span className="font-bold tracking-tight">Discharged</span>} />
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200 border-none">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity size={24} className="text-blue-200" />
                <h3 className="text-lg font-bold tracking-tight">On-Call Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20">
                  <span className="text-sm font-medium text-blue-100">Current Shift</span>
                  <span className="font-bold font-mono">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/20">
                  <span className="text-sm font-medium text-blue-100">Ward Assignment</span>
                  <span className="font-bold">Cardiology ICU</span>
                </div>
              </div>
            </div>
          </Card>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <StickyNote size={18} className="text-amber-500" /> Quick Notes
            </h3>
            <Card className="border border-slate-200 shadow-sm bg-amber-50/30">
              <div className="text-sm font-medium text-slate-600 leading-relaxed italic p-5">
                &quot;Follow up on Yanis&apos;s lipid panel results by 14:00. Ensure Dr. Salim reviews the ECG for Fatima before discharge.&quot;
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
