"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import {
  Search, Filter, Calendar, Clock,
  ArrowRight, UserRound, BedDouble, FileText,
  UserPlus, UserCheck, LogOut, Activity
} from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

export default function WardHistoryPage() {
  const history = [
    { id: "LOG-881", type: "admission", patient: "Amir K.", bed: "ICU-4A", timestamp: "Mar 30, 2026 09:15", actor: "Dr. Amara R.", notes: "Post-surgical monitoring required" },
    { id: "LOG-880", type: "discharge", patient: "Fatima Z.", bed: "ICU-7B", timestamp: "Mar 30, 2026 08:30", actor: "Dr. Salim B.", notes: "Stable condition, follow-up in 2 weeks" },
    { id: "LOG-879", type: "bed_transfer", patient: "Yanis M.", bed: "ICU-2A → ICU-3C", timestamp: "Mar 29, 2026 16:45", actor: "Nurse L. Mansouri", notes: "Transferred for specialized cardiac monitoring" },
    { id: "LOG-878", type: "shift_start", patient: "—", bed: "—", timestamp: "Mar 29, 2026 07:00", actor: "Dr. Amara R.", notes: "Morning shift started — 12 beds occupied" },
    { id: "LOG-877", type: "escalation", patient: "Rania B.", bed: "ICU-9C", timestamp: "Mar 28, 2026 22:30", actor: "Night Nurse S. Haddad", notes: "Patient vitals deteriorating, escalated to senior physician" },
    { id: "LOG-876", type: "discharge", patient: "Karim D.", bed: "ICU-3A", timestamp: "Mar 28, 2026 14:00", actor: "Dr. Salim B.", notes: "Recovery complete, discharged to home care" },
  ];

  const typeConfig: Record<string, { label: string; icon: any; color: "accent" | "success" | "danger" | "warning" | "default" }> = {
    admission: { label: "Admission", icon: UserPlus, color: "accent" },
    discharge: { label: "Discharge", icon: UserCheck, color: "success" },
    bed_transfer: { label: "Bed Transfer", icon: BedDouble, color: "warning" },
    shift_start: { label: "Shift Start", icon: Clock, color: "default" },
    escalation: { label: "Escalation", icon: Activity, color: "danger" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ward History</h1>
          <p className="text-slate-500 font-medium mt-1">Historical log of admissions, discharges, and ward events</p>
        </div>
        <Button variant="secondary" className="font-bold border border-slate-200"><Calendar size={18} /> Export Report</Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">47</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Admissions</div>
            </div>
          </div>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">39</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Discharges</div>
            </div>
          </div>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BedDouble size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">12</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Transfers</div>
            </div>
          </div>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">3</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Escalations</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by patient, actor, or event type..."
              className="pl-9 bg-white border border-slate-200 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="font-bold"><Filter size={18} /> Event Type</Button>
            <Button variant="secondary" className="font-bold"><Calendar size={18} /> Date Range</Button>
          </div>
        </div>
      </Card>

      {/* History Timeline */}
      <Tabs aria-label="History Filter">
        <Tab key="all" title={<span className="font-bold tracking-tight">All Events</span>}>
          <div className="flex flex-col gap-3 mt-4">
            {history.map((log) => {
              const cfg = typeConfig[log.type] ?? { label: log.type, icon: FileText, color: "default" as const };
              const Icon = cfg.icon;
              return (
                <Card key={log.id} className="border border-slate-200 shadow-sm hover:border-sky-200 transition-all">
                  <div className="p-5 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-${cfg.color === 'accent' ? 'blue' : cfg.color === 'success' ? 'emerald' : cfg.color === 'danger' ? 'rose' : cfg.color === 'warning' ? 'amber' : 'slate'}-50 text-${cfg.color === 'accent' ? 'blue' : cfg.color === 'success' ? 'emerald' : cfg.color === 'danger' ? 'rose' : cfg.color === 'warning' ? 'amber' : 'slate'}-600`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-black text-lg text-slate-900 tracking-tight">
                          {cfg.label}
                          {log.patient !== "—" && <span className="text-slate-500 font-medium ml-2">— {log.patient}</span>}
                        </div>
                        <Chip
                          size="sm"
                          color={cfg.color}
variant="soft"
                          className="font-black uppercase tracking-widest text-[9px]"
                        >
                          {cfg.label}
                        </Chip>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <UserRound size={14} className="text-slate-400" />
                          <span>{log.actor}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" />
                          <span className="font-mono">{log.timestamp}</span>
                        </div>
                        {log.bed !== "—" && (
                          <div className="flex items-center gap-1.5">
                            <BedDouble size={14} className="text-slate-400" />
                            <span>{log.bed}</span>
                          </div>
                        )}
                      </div>
                      {log.notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Tab>
        <Tab key="admissions" title={<span className="font-bold tracking-tight">Admissions</span>} />
        <Tab key="discharges" title={<span className="font-bold tracking-tight">Discharges</span>} />
        <Tab key="transfers" title={<span className="font-bold tracking-tight">Transfers</span>} />
      </Tabs>
    </div>
  );
}
