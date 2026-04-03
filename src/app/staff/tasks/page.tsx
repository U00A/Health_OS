"use client";

import { useState } from "react";
import { Card, Button, Chip } from "@heroui/react";
import {
  ClipboardList, Clock, CheckCircle2, Circle, AlertCircle,
  Thermometer, Pill, FileText, UserRound, Plus, Activity
} from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

interface Task {
  id: string;
  title: string;
  patient: string;
  category: "vitals" | "medication" | "documentation" | "procedure";
  priority: "high" | "medium" | "low";
  due: string;
  completed: boolean;
}

export default function ShiftTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "T-01", title: "Record vital signs — 4-hour cycle", patient: "Amir K. (Bed 4A)", category: "vitals", priority: "high", due: "14:00", completed: false },
    { id: "T-02", title: "Administer IV Amoxicillin 1g", patient: "Fatima Z. (Bed 7B)", category: "medication", priority: "high", due: "14:30", completed: false },
    { id: "T-03", title: "Post-op wound dressing change", patient: "Yanis M. (Bed 2A)", category: "procedure", priority: "medium", due: "15:00", completed: false },
    { id: "T-04", title: "Complete nursing progress notes", patient: "Rania B. (Bed 9C)", category: "documentation", priority: "low", due: "16:00", completed: false },
    { id: "T-05", title: "Blood glucose monitoring (pre-meal)", patient: "Karim D. (Bed 3A)", category: "vitals", priority: "high", due: "12:00", completed: true },
    { id: "T-06", title: "Discharge medication reconciliation", patient: "Leila S. (Bed 1B)", category: "medication", priority: "medium", due: "11:00", completed: true },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const highPriorityCount = tasks.filter(t => t.priority === "high" && !t.completed).length;

  const categoryIcon = {
    vitals: Thermometer,
    medication: Pill,
    documentation: FileText,
    procedure: Activity,
  };

  const categoryColor = {
    vitals: "bg-rose-50 text-rose-600",
    medication: "bg-blue-50 text-blue-600",
    documentation: "bg-slate-100 text-slate-600",
    procedure: "bg-amber-50 text-amber-600",
  };

  const priorityColor = {
    high: "danger" as const,
    medium: "warning" as const,
    low: "default" as const,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shift Tasks</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your current shift assignments and clinical duties</p>
        </div>
        <Button variant="primary" className="font-bold shadow-lg shadow-sky-200 bg-sky-600"><Plus size={18} /> Add Task</Button>
      </div>

      {/* Shift Info Banner */}
      <Card className="bg-linear-to-r from-sky-600 to-blue-600 text-white border-none shadow-xl shadow-sky-200">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
              <Clock size={24} className="text-sky-200" />
            </div>
            <div>
              <div className="text-sky-100 font-bold text-sm">Current Shift</div>
              <div className="font-black text-2xl tracking-tight font-mono">07:00 — 19:00</div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/15">
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-200">Ward</div>
              <div className="font-bold text-lg">General ICU</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/15">
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-200">Supervisor</div>
              <div className="font-bold text-lg">Dr. Amara R.</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{pendingCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Pending Tasks</div>
            </div>
          </div>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{completedCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Completed</div>
            </div>
          </div>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{highPriorityCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">High Priority</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Task List */}
      <Tabs aria-label="Task categories">
        <Tab key="all" title={<span className="font-bold tracking-tight">All Tasks</span>}>
          <div className="flex flex-col gap-3 mt-4">
            {tasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => {
              const Icon = categoryIcon[task.category];
              return (
                <Card
                  key={task.id}
                  className={`border shadow-sm transition-all ${task.completed ? "border-slate-100 opacity-60" : "border-slate-200 hover:border-sky-200"}`}
                >
                  <div className="p-5 flex items-center gap-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 hover:border-sky-400 text-transparent hover:text-sky-400"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryColor[task.category]}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-lg tracking-tight ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
                        <UserRound size={14} className="shrink-0" />
                        <span className="truncate">{task.patient}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Chip
                        size="sm"
                        color={priorityColor[task.priority]}
                        variant="soft"
                        className="font-black uppercase tracking-widest text-[9px]"
                      >
                        {task.priority}
                      </Chip>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400 font-mono">
                        <Clock size={12} />
                        {task.due}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Tab>
        <Tab key="vitals" title={<span className="font-bold tracking-tight">Vitals</span>} />
        <Tab key="meds" title={<span className="font-bold tracking-tight">Medications</span>} />
        <Tab key="docs" title={<span className="font-bold tracking-tight">Documentation</span>} />
      </Tabs>
    </div>
  );
}
