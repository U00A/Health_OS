"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import { Search, Calendar, Clock, UserRound, Filter, ChevronRight, CheckCircle2 } from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

export default function AppointmentsPage() {
  const appointments = [
    { id: "A-101", patient: "Amir K.", time: "09:00 AM", date: "Today", type: "Follow-up", status: "confirmed" },
    { id: "A-102", patient: "Fatima Z.", time: "10:30 AM", date: "Today", type: "Initial Consult", status: "confirmed" },
    { id: "A-103", patient: "Yanis M.", time: "02:00 PM", date: "Today", type: "Lab Review", status: "pending" },
    { id: "A-104", patient: "Rania B.", time: "04:30 PM", date: "Today", type: "Routine", status: "confirmed" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Schedule</h1>
          <p className="text-slate-500 font-medium mt-1">Manage appointments and patient consultations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="font-bold border border-slate-200">Weekly View</Button>
          <Button variant="primary" className="font-bold shadow-lg shadow-blue-200"><Calendar size={18} /> New Appointment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="p-6 border border-slate-200 shadow-sm h-fit">
          <h2 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6">Calendar Select</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }).map((_, i) => (
                <button key={i} className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${i === 1 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Tabs aria-label="Appointment Status">
            <Tab key="today" title={<span className="font-bold tracking-tight">Today</span>}>
              <div className="flex flex-col gap-4 mt-6">
                {appointments.map((appt) => (
                  <Card key={appt.id} className="border border-slate-200 shadow-sm hover:border-blue-200 transition-all group cursor-pointer">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Start</span>
                          <span className="text-sm font-black text-slate-900 group-hover:text-blue-600">{appt.time.split(' ')[0]}</span>
                        </div>
                        <div>
                          <div className="font-black text-xl text-slate-900 tracking-tight mb-1">{appt.patient}</div>
                          <div className="flex items-center gap-3">
                            <Chip size="sm" variant="soft" className="font-bold text-[10px] uppercase bg-slate-100 text-slate-500">
                              {appt.type}
                            </Chip>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Clock size={12} /> {appt.time}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Chip 
                          size="sm" 
                          color={appt.status === 'confirmed' ? 'success' : 'warning'} 
                          variant="soft"
                          className="font-black uppercase tracking-widest text-[9px]"
                        >
                          {appt.status}
                        </Chip>
                        <Button isIconOnly variant="ghost" className="text-slate-400 group-hover:text-blue-600 transition-colors">
                          <ChevronRight size={20} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Tab>
            <Tab key="upcoming" title={<span className="font-bold tracking-tight">Upcoming</span>} />
            <Tab key="cancelled" title={<span className="font-bold tracking-tight">Cancelled</span>} />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
