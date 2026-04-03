"use client";

import { Card, Button, Chip } from "@heroui/react";
import { Users, Server, ShieldAlert, Activity, UserPlus, HardDrive, RefreshCw } from "lucide-react";

export default function AdminPage() {
  // Static mockup data since admin backend might not be fully fleshed out yet.
  const stats = [
    { label: "Total Nodes", value: "2,847", icon: Server, color: "primary", progress: 99.9 },
    { label: "Active Sessions", value: "1,204", icon: Users, color: "success", progress: 65 },
    { label: "System Load", value: "34%", icon: Activity, color: "warning", progress: 34 },
    { label: "Security Alerts", value: "0", icon: ShieldAlert, color: "default", progress: 0 },
  ];

  const recentUsers = [
    { id: "USR-9921", name: "Dr. Amara R.", role: "doctor", status: "active", lastLogin: "2 mins ago" },
    { id: "USR-9922", name: "K. Yassine", role: "pharmacy", status: "active", lastLogin: "15 mins ago" },
    { id: "USR-9923", name: "S. Leila", role: "staff", status: "offline", lastLogin: "3 hours ago" },
    { id: "USR-9924", name: "System Sync", role: "admin", status: "active", lastLogin: "Just now" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Console</h1>
          <p className="text-slate-500 font-medium mt-1">Platform monitor and access management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="font-bold border border-slate-200 bg-white text-slate-600" isIconOnly>
            <RefreshCw size={18} className="text-slate-500" />
          </Button>
          <Button variant="primary" className="font-bold shadow-lg shadow-blue-200 bg-slate-900 flex gap-2">
            <UserPlus size={18} />
            Provision User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  s.color === "primary" ? "bg-blue-50 text-blue-600" :
                  s.color === "success" ? "bg-emerald-50 text-emerald-600" :
                  s.color === "warning" ? "bg-amber-50 text-amber-600" :
                  "bg-slate-50 text-slate-600"
                }`}>
                  <s.icon size={20} />
                </div>
                {s.progress > 50 && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">{s.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
              </div>
              <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.progress}%` }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HardDrive size={18} className="text-slate-400" /> Infrastructure Nodes
          </h2>
          <Card className="border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-3 py-3">Node ID</th>
                  <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-3 py-3">Name</th>
                  <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-3 py-3">Role Group</th>
                  <th className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] text-left px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                    <td className="font-mono text-xs text-slate-500 px-3 py-3">{user.id}</td>
                    <td className="font-bold text-slate-900 px-3 py-3">{user.name}</td>
                    <td className="px-3 py-3">
                      <Chip size="sm" variant="soft" className="font-bold uppercase tracking-widest text-[9px] bg-slate-100 text-slate-600">
                        {user.role}
                      </Chip>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className={user.status === 'active' ? 'text-slate-900' : 'text-slate-400'}>
                          {user.status === 'active' ? 'Synthesized' : 'Offline'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity size={18} className="text-slate-400" /> Audit Log
          </h2>
          <Card className="border border-slate-200 shadow-sm">
            <div className="p-0">
              <div className="divide-y divide-slate-100">
                {[
                  { action: "Auth sync completed", time: "2 min ago", type: "system" },
                  { action: "Failed login attempt (IP: 192.168.x)", time: "15 min ago", type: "warn" },
                  { action: "DB snapshot created", time: "1 hour ago", type: "info" },
                  { action: "Role 'doctor' permissions updated", time: "3 hours ago", type: "admin" }
                ].map((log, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-700">{log.action}</span>
                      <span className="text-[10px] font-mono font-medium text-slate-400">{log.time}</span>
                    </div>
                    <Chip size="sm" variant="soft" color={
                      log.type === 'warn' ? 'danger' :
                      log.type === 'system' ? 'success' :
                      'default'
                    } className="text-[9px] uppercase tracking-widest font-black text-slate-500 border-none px-0">
                      SYS_{log.type.toUpperCase()}
                    </Chip>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
