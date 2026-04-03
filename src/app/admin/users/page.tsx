"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import { Search, UserPlus, Filter, ShieldCheck, Mail, Shield } from "lucide-react";

export default function UserManagementPage() {
  const users = [
    { id: "U-101", name: "Dr. Amine Rahmani", email: "a.rahmani@hospital.dz", role: "medecin_etat", status: "active", verified: true },
    { id: "U-102", name: "Sarah Benali", email: "s.benali@hospital.dz", role: "pharmacy", status: "active", verified: true },
    { id: "U-103", name: "Mourad Kassimi", email: "m.kassimi@hospital.dz", role: "medical_staff", status: "pending", verified: false },
    { id: "U-104", name: "Lina Mansouri", email: "l.mansouri@hospital.dz", role: "laboratory", status: "active", verified: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage platform access and clinical roles</p>
        </div>
        <Button variant="primary" className="font-bold bg-slate-900"><UserPlus size={18} /> Add New User</Button>
      </div>

      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by name, email or ID..." 
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="font-bold"><Filter size={18} /> Filter</Button>
            <Button variant="secondary" className="font-bold">All Roles</Button>
          </div>
        </div>
      </Card>

      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">User</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Security Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail size={12} /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Chip size="sm" variant="soft" className="font-bold uppercase text-[10px]">
                      {u.role.replace('_', ' ')}
                    </Chip>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-sm font-medium text-slate-700 capitalize">{u.status}</span>
                      {u.verified && <ShieldCheck size={14} className="text-blue-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="ghost" className="font-bold text-slate-600">Edit</Button>
                    <Button size="sm" variant="danger" className="font-bold">Suspend</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
