"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import { Search, Plus, Filter, UserPlus, ArrowRight, UserRound, HeartPulse, History } from "lucide-react";

export default function PrivatePatientsPage() {
  const patients = [
    { id: "P-501", name: "Ahmed Belkacem", age: 45, lastVisit: "2 days ago", condition: "Hypertension", status: "follow-up" },
    { id: "P-502", name: "Samia Khelifi", age: 32, lastVisit: "1 week ago", condition: "Migraine", status: "recovered" },
    { id: "P-503", name: "Malek Mansouri", age: 58, lastVisit: "3 days ago", condition: "Diabetes Type 2", status: "follow-up" },
    { id: "P-504", name: "Ines Rahmani", age: 24, lastVisit: "Yesterday", condition: "Asthma", status: "stable" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-teal-600">Private Registry</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your private practice patient database</p>
        </div>
        <Button variant="primary" className="font-bold bg-teal-600 shadow-lg shadow-teal-100"><UserPlus size={18} /> Register Patient</Button>
      </div>

      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search private records..." 
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary"><Filter size={18} /> Condition</Button>
            <Button variant="secondary">Recent Only</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {patients.map((p) => (
          <Card key={p.id} className="border border-slate-200 shadow-sm hover:border-teal-300 transition-all group cursor-pointer">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 font-black text-xl border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-all">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-xl text-slate-900 tracking-tight">{p.name}</div>
                    <div className="text-sm font-bold text-slate-400">{p.age} years old • {p.id}</div>
                  </div>
                </div>
                <Chip size="sm" variant="soft" color="accent" className="font-black uppercase tracking-widest text-[9px] bg-teal-50 text-teal-700">
                  {p.status}
                </Chip>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <HeartPulse size={16} className="text-teal-500" />
                  <div className="text-sm font-bold text-slate-700">{p.condition}</div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <History size={16} className="text-slate-400" />
                  <div className="text-sm font-bold text-slate-500">Last Visit: {p.lastVisit}</div>
                </div>
              </div>
              <Button fullWidth variant="secondary" className="font-bold text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all"><ArrowRight size={16} /> Clinical Record</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
