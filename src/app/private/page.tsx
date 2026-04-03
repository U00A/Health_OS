"use client";

import { Card, Button } from "@heroui/react";
import { Building2, Plus, Users, Wallet, Calendar } from "lucide-react";

export default function PrivatePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex border-b border-slate-200 pb-6 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
            <Building2 className="text-teal-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Private Practice</h1>
            <p className="text-slate-500 font-medium mt-1">Autonomous clinic management workspace</p>
          </div>
        </div>
        <Button variant="primary" className="bg-teal-600 font-bold shadow-lg shadow-teal-200"><Plus size={18} /> New Patient</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-200 shadow-sm hover:border-teal-300 transition-colors cursor-pointer group">
          <div className="p-6 flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={24} className="text-teal-600" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Patient Registry</h3>
              <p className="text-sm text-slate-500 font-medium">Browse private patient records</p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200 shadow-sm hover:border-teal-300 transition-colors cursor-pointer group">
          <div className="p-6 flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={24} className="text-slate-600" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Appointments</h3>
              <p className="text-sm text-slate-500 font-medium">Schedule and manage bookings</p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200 shadow-sm hover:border-teal-300 transition-colors cursor-pointer group">
          <div className="p-6 flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet size={24} className="text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Billing & Invoices</h3>
              <p className="text-sm text-slate-500 font-medium">Manage financial records</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="pt-4">
         <Card className="border border-slate-200 border-dashed bg-slate-50 shadow-none">
           <div className="p-12 text-center flex items-center justify-center">
              <div className="max-w-md">
                 <h4 className="font-bold text-slate-900 text-lg mb-2">Workspace Zero</h4>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                   Your private practice data is cryptographically isolated from the main hospital node. Search for an existing record or create a new patient to begin.
                 </p>
                 <Button variant="ghost" className="font-bold text-slate-700 border-slate-200 bg-white">
                    Import Global Registry ID
                 </Button>
              </div>
           </div>
         </Card>
      </div>
    </div>
  );
}
