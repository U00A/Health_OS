"use client";

import { useState } from "react";
import { LucideIcon, User, Shield, Stethoscope, Bed, Pill, FlaskConical, UserCheck, Copy, Check, ChevronRight } from "lucide-react";

interface DemoAccount {
  role: string;
  email: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const accounts: DemoAccount[] = [
  { role: "admin", email: "admin@hospital.local", label: "Administrator", icon: Shield, color: "bg-red-500" },
  { role: "patient", email: "ouanes461@gmail.com", label: "Patient", icon: User, color: "bg-emerald-500" },
  { role: "medecin_etat", email: "doctoretat@test.com", label: "State Doctor", icon: Stethoscope, color: "bg-blue-500" },
  { role: "private_doctor", email: "privatedoc@test.com", label: "Private Doctor", icon: UserCheck, color: "bg-indigo-500" },
  { role: "medical_staff", email: "staff@hospital.local", label: "Medical Staff", icon: Bed, color: "bg-purple-500" },
  { role: "pharmacy", email: "pharmacy@hospital.local", label: "Pharmacy", icon: Pill, color: "bg-pink-500" },
  { role: "laboratory", email: "lab@hospital.local", label: "Laboratory", icon: FlaskConical, color: "bg-amber-500" },
];

export function DemoCredentials({ onSelect }: { onSelect: (email: string, password: string) => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Demo Access Nodes
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {accounts.map((account) => (
          <div
            key={account.role}
            className="group relative flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => onSelect(account.email, "password123")}
          >
            {/* Hover Backdrop */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-50/0 via-blue-50/0 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Icon */}
            <div className={`shrink-0 w-10 h-10 rounded-xl ${account.color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
              <account.icon className="w-5 h-5" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {account.label}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  {account.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                {account.email}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(account.email);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                title="Copy Email"
              >
                {copied === account.email ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-center text-[10px] font-medium text-slate-400 italic">
        All demo accounts use <span className="text-slate-600 font-bold">password123</span>
      </p>
    </div>
  );
}
