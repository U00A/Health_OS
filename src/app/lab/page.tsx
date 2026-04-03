"use client";

import { Card, Button, Chip } from "@heroui/react";
import { Microscope, Beaker, CheckCircle2, FlaskConical, UploadCloud, FileText } from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

export default function LabPage() {
  const orders = [
    { id: "ORD-1123", patient: "P-8814", test: "Complete Blood Count", priority: "routine", status: "pending", time: "10:30 AM" },
    { id: "ORD-1124", patient: "P-8812", test: "Lipid Panel", priority: "urgent", status: "processing", time: "11:15 AM" },
    { id: "ORD-1125", patient: "P-8219", test: "HbA1c", priority: "routine", status: "pending", time: "12:00 PM" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex border-b border-slate-200 pb-6 items-center gap-4">
        <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
          <Microscope className="text-violet-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laboratory Queue</h1>
          <p className="text-slate-500 font-medium mt-1">Manage analytical orders and result uploads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Tabs aria-label="Lab Orders">
            <Tab key="active" title={<span className="font-bold tracking-tight">Active Orders</span>}>
              <div className="flex flex-col gap-4 mt-4">
                {orders.map((o) => (
                  <Card key={o.id} className={`border ${o.priority === 'urgent' ? 'border-amber-300 shadow-amber-100' : 'border-slate-200'} shadow-sm hover:border-violet-300 transition-colors`}>
                    <div className="p-0">
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${o.status === 'processing' ? 'bg-violet-100 text-violet-600 animate-pulse-ring' : 'bg-slate-100 text-slate-500'}`}>
                            {o.test.includes("Blood") ? <TestTubeIcon /> : <FlaskConical size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900 text-lg">{o.test}</h3>
                              {o.priority === 'urgent' && (
                                <Chip size="sm" color="warning" className="font-black uppercase tracking-widest text-[9px] text-amber-900">Urgent</Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-xs">{o.id}</span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 font-mono text-xs"><FileText size={12}/> Patient: {o.patient}</span>
                              <span className="text-slate-300">•</span>
                              <span>{o.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                           {o.status === 'pending' ? (
<Button size="sm" className="w-full md:w-auto font-bold bg-slate-900 text-white">
                                <Beaker size={14} /> Start Analysis
                              </Button>
                           ) : (
<Button size="sm" className="w-full md:w-auto font-bold bg-slate-600 text-white">
                                <UploadCloud size={14} /> Upload Result
                              </Button>
                           )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Tab>
            <Tab key="completed" title={<span className="font-bold tracking-tight">Completed</span>} />
          </Tabs>
        </div>

        <div className="space-y-4">
           {/* Sidebar Stats */}
           <Card className="bg-violet-600 text-white border-none shadow-lg shadow-violet-200">
             <div className="p-6">
               <h3 className="text-violet-200 font-bold tracking-widest text-xs uppercase mb-4">Shift Output</h3>
               <div className="text-4xl font-black font-mono tracking-tight mb-1">42</div>
               <div className="text-sm font-medium text-violet-200 flex items-center gap-1"><CheckCircle2 size={14}/> Analyses Completed</div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

function TestTubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01v0a2.83 2.83 0 0 1 0-4L17 3"></path>
      <path d="m16 2 6 6"></path>
      <path d="M12 16H4"></path>
    </svg>
  );
}
