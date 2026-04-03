"use client";

import { useState } from "react";
import { Card, Button, Chip, Input, Switch } from "@heroui/react";
import {
  Settings, Shield, Database, Globe, Clock, Lock,
  Mail, Server, RefreshCw, CheckCircle2, AlertTriangle,
  Save, Wifi, Key, HardDrive
} from "lucide-react";

export default function SystemSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const integrations = [
    { name: "LDAP Directory", status: "connected", icon: Key, desc: "Active Directory sync enabled", lastSync: "2 min ago" },
    { name: "SMTP Gateway", status: "connected", icon: Mail, desc: "Postfix relay configured", lastSync: "Active" },
    { name: "Backup Storage", status: "warning", icon: HardDrive, desc: "S3-compatible object store", lastSync: "23 hours ago" },
    { name: "External API", status: "disconnected", icon: Wifi, desc: "HL7 FHIR endpoint", lastSync: "Never" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Platform configuration and infrastructure policies</p>
        </div>
        <Button variant="primary" className="font-bold shadow-lg shadow-blue-200 bg-slate-900"><Save size={18} /> Save All Changes</Button>
      </div>

      {/* General Configuration */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Globe size={18} className="text-slate-400" /> General Configuration
        </h2>
        <Card className="border border-slate-200 shadow-sm">
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">Hospital Name</div>
                <div className="text-sm text-slate-500 font-medium">Primary institution identifier shown across the platform</div>
              </div>
              <Input
                defaultValue="Centre Hospitalier Universitaire (CHU)"
                className="max-w-sm bg-white border border-slate-200 shadow-sm"
              />
            </div>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">System Timezone</div>
                <div className="text-sm text-slate-500 font-medium">All timestamps and audit logs reference this zone</div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-w-sm w-full">
                <Clock size={16} className="text-slate-400 shrink-0" />
                <span className="font-bold text-slate-900 font-mono text-sm">Africa/Algiers (UTC+01:00)</span>
              </div>
            </div>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  Maintenance Mode
                  {maintenanceMode && (
                    <Chip size="sm" color="danger" variant="soft" className="font-black uppercase tracking-widest text-[9px]">Active</Chip>
                  )}
                </div>
                <div className="text-sm text-slate-500 font-medium">Restrict platform access to admin-only for scheduled maintenance</div>
              </div>
              <Switch
                isSelected={maintenanceMode}
                onChange={setMaintenanceMode}
                className="text-danger"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Security Policies */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield size={18} className="text-slate-400" /> Security Policies
        </h2>
        <Card className="border border-slate-200 shadow-sm">
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">Enforce Two-Factor Authentication</div>
                <div className="text-sm text-slate-500 font-medium">Require TOTP verification for all clinical user accounts</div>
              </div>
              <Switch isSelected={enforce2FA} onChange={setEnforce2FA} className="text-primary" />
            </div>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">Session Timeout</div>
                <div className="text-sm text-slate-500 font-medium">Auto-logout idle sessions after specified duration</div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-w-xs w-full">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <span className="font-bold text-slate-900 font-mono text-sm">30 minutes</span>
              </div>
            </div>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">Password Policy</div>
                <div className="text-sm text-slate-500 font-medium">Minimum requirements for account credential strength</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="soft" className="font-bold text-[10px] uppercase bg-slate-100 text-slate-600">Min 12 chars</Chip>
                <Chip size="sm" variant="soft" className="font-bold text-[10px] uppercase bg-slate-100 text-slate-600">Mixed case</Chip>
                <Chip size="sm" variant="soft" className="font-bold text-[10px] uppercase bg-slate-100 text-slate-600">Symbols req.</Chip>
              </div>
            </div>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">Immutable Audit Logging</div>
                <div className="text-sm text-slate-500 font-medium">Append-only logs for all data mutations and access events</div>
              </div>
              <Switch isSelected={auditLogging} onChange={setAuditLogging} className="text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Integrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database size={18} className="text-slate-400" /> Integrations & Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integ) => (
            <Card key={integ.name} className="border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    integ.status === "connected" ? "bg-emerald-50 text-emerald-600" :
                    integ.status === "warning" ? "bg-amber-50 text-amber-600" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    <integ.icon size={20} />
                  </div>
                  <Chip
                    size="sm"
                    color={integ.status === "connected" ? "success" : integ.status === "warning" ? "warning" : "default"}
                    variant="soft"
                    className="font-black uppercase tracking-widest text-[9px]"
                  >
                    {integ.status}
                  </Chip>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{integ.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-4">{integ.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <RefreshCw size={12} />
                    Last sync: {integ.lastSync}
                  </div>
                  <Button size="sm" variant="ghost" className="font-bold text-blue-600">Configure</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Server size={18} className="text-slate-400" /> Data Management
        </h2>
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HardDrive size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-900">Automated Backups</div>
                <div className="text-sm text-slate-500 font-medium">Daily encrypted snapshots at 02:00 UTC+1</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch isSelected={autoBackup} onChange={setAutoBackup} className="text-primary" />
              <Button size="sm" variant="secondary" className="font-bold"><RefreshCw size={14} /> Backup Now</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
