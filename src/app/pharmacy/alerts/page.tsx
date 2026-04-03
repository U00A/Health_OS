"use client";

import { useState } from "react";
import { Card, Button, Chip } from "@heroui/react";
import {
  AlertTriangle, ShieldAlert, AlertCircle, CheckCircle2,
  Info, Bell, BellOff, Pill, X
} from "lucide-react";

interface Alert {
  id: string;
  severity: "critical" | "moderate" | "low";
  drugA: string;
  drugB: string;
  patient: string;
  description: string;
  recommendation: string;
  timestamp: string;
  acknowledged: boolean;
}

export default function DrugInteractionsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "DIA-001", severity: "critical", drugA: "Warfarin", drugB: "Aspirin",
      patient: "Amir K.", description: "Major bleeding risk — concurrent anticoagulant and antiplatelet therapy.",
      recommendation: "Discontinue one agent or consult hematology for INR-adjusted dosing.",
      timestamp: "12 min ago", acknowledged: false
    },
    {
      id: "DIA-002", severity: "critical", drugA: "Metformin", drugB: "IV Contrast",
      patient: "Fatima Z.", description: "Risk of lactic acidosis — hold metformin 48h before and after contrast.",
      recommendation: "Temporarily suspend Metformin. Schedule contrast after washout period.",
      timestamp: "45 min ago", acknowledged: false
    },
    {
      id: "DIA-003", severity: "moderate", drugA: "Lisinopril", drugB: "Spironolactone",
      patient: "Yanis M.", description: "Hyperkalemia risk — dual RAAS blockade may elevate serum potassium.",
      recommendation: "Monitor serum K+ within 72 hours. Consider dose reduction.",
      timestamp: "1 hour ago", acknowledged: false
    },
    {
      id: "DIA-004", severity: "moderate", drugA: "Ciprofloxacin", drugB: "Theophylline",
      patient: "Rania B.", description: "CYP1A2 inhibition — fluoroquinolone increases theophylline concentration.",
      recommendation: "Reduce theophylline dose by 30% or switch antibiotic class.",
      timestamp: "2 hours ago", acknowledged: true
    },
    {
      id: "DIA-005", severity: "low", drugA: "Omeprazole", drugB: "Clopidogrel",
      patient: "Karim D.", description: "Minor CYP2C19 interaction — PPI may reduce antiplatelet efficacy.",
      recommendation: "Consider switching to Pantoprazole if clinically relevant.",
      timestamp: "3 hours ago", acknowledged: true
    },
  ]);

  const acknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const moderateCount = activeAlerts.filter(a => a.severity === "moderate").length;
  const lowCount = activeAlerts.filter(a => a.severity === "low").length;

  const sevCfg = {
    critical: { color: "danger" as const, bg: "bg-rose-50 border-rose-200", iconBg: "bg-rose-100 text-rose-600", icon: ShieldAlert, bar: "bg-rose-500" },
    moderate: { color: "warning" as const, bg: "bg-amber-50/50 border-amber-200", iconBg: "bg-amber-100 text-amber-600", icon: AlertTriangle, bar: "bg-amber-500" },
    low: { color: "default" as const, bg: "bg-blue-50/30 border-blue-200", iconBg: "bg-blue-100 text-blue-600", icon: Info, bar: "bg-blue-500" },
  };

  const renderAlert = (alert: Alert) => {
    const cfg = sevCfg[alert.severity];
    const Icon = cfg.icon;
    return (
      <Card key={alert.id} className={`border shadow-sm overflow-hidden ${alert.acknowledged ? "opacity-60 border-slate-200" : cfg.bg}`}>
        <div className={`h-1 ${cfg.bar}`} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Chip size="sm" color={cfg.color} variant="soft" className="font-black uppercase tracking-widest text-[9px]">{alert.severity}</Chip>
                  <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-1">{alert.timestamp}</div>
              </div>
            </div>
            {alert.acknowledged ? (
              <Chip size="sm" variant="soft" color="success" className="font-bold text-[10px] uppercase">Acknowledged</Chip>
            ) : (
              <Button size="sm" variant="secondary" className="font-bold" onPress={() => acknowledge(alert.id)}>Acknowledge</Button>
            )}
          </div>
          <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl border border-slate-100">
            <Pill size={16} className="text-slate-500" />
            <span className="font-bold text-slate-900">{alert.drugA}</span>
            <div className="w-6 h-px bg-slate-300 relative"><X size={12} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-rose-400" /></div>
            <Pill size={16} className="text-slate-500" />
            <span className="font-bold text-slate-900">{alert.drugB}</span>
            <span className="ml-auto text-sm text-slate-500 font-medium">Patient: <strong className="text-slate-900">{alert.patient}</strong></span>
          </div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">{alert.description}</p>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Clinical Recommendation</div>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">{alert.recommendation}</p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Drug Interaction Alerts</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time contraindication and interaction monitoring</p>
        </div>
          <div className="flex gap-3">
          <Button variant="secondary" className="font-bold border border-slate-200"><BellOff size={16} /> Mute Low</Button>
          <Button variant="danger" className="font-bold"><AlertTriangle size={16} /> {activeAlerts.length} Active</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-rose-200 shadow-sm bg-rose-50/30">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><ShieldAlert size={20} /></div>
            <div><div className="text-2xl font-black text-slate-900 font-mono">{criticalCount}</div><div className="text-xs font-bold uppercase tracking-widest text-slate-400">Critical</div></div>
          </div>
        </Card>
        <Card className="border border-amber-200 shadow-sm bg-amber-50/30">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><AlertTriangle size={20} /></div>
            <div><div className="text-2xl font-black text-slate-900 font-mono">{moderateCount}</div><div className="text-xs font-bold uppercase tracking-widest text-slate-400">Moderate</div></div>
          </div>
        </Card>
        <Card className="border border-blue-200 shadow-sm bg-blue-50/30">
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Info size={20} /></div>
            <div><div className="text-2xl font-black text-slate-900 font-mono">{lowCount}</div><div className="text-xs font-bold uppercase tracking-widest text-slate-400">Low Risk</div></div>
          </div>
        </Card>
      </div>

      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><AlertCircle size={18} className="text-rose-500" /> Active Alerts</h2>
          <div className="flex flex-col gap-4">{activeAlerts.map(renderAlert)}</div>
        </div>
      )}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Acknowledged</h2>
          <div className="flex flex-col gap-4">{acknowledgedAlerts.map(renderAlert)}</div>
        </div>
      )}
    </div>
  );
}
