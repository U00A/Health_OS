"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import {
  Search, Plus, Filter, Wallet, CreditCard, FileText,
  ArrowRight, Download, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Receipt, Calendar, DollarSign
} from "lucide-react";
import { Tabs, Tab } from "@/components/ui/ClientTabs";

export default function BillingPage() {
  const stats = [
    { label: "Total Revenue", value: "2,450,000 DA", icon: Wallet, color: "bg-emerald-50 text-emerald-600", change: "+12.5%" },
    { label: "Pending Payments", value: "185,000 DA", icon: Clock, color: "bg-amber-50 text-amber-600", change: "8 invoices" },
    { label: "Paid This Month", value: "890,000 DA", icon: CheckCircle2, color: "bg-blue-50 text-blue-600", change: "+8.2%" },
  ];

  const invoices = [
    { id: "INV-2026-042", patient: "Ahmed Belkacem", service: "Consultation + ECG", amount: "8,500 DA", date: "Mar 30, 2026", status: "paid", method: "Cash" },
    { id: "INV-2026-041", patient: "Samia Khelifi", service: "Follow-up Visit", amount: "4,000 DA", date: "Mar 28, 2026", status: "paid", method: "Bank Transfer" },
    { id: "INV-2026-040", patient: "Malek Mansouri", service: "Diabetes Management Plan", amount: "12,000 DA", date: "Mar 27, 2026", status: "pending", method: "—" },
    { id: "INV-2026-039", patient: "Ines Rahmani", service: "Asthma Treatment", amount: "6,500 DA", date: "Mar 25, 2026", status: "overdue", method: "—" },
    { id: "INV-2026-038", patient: "Karim Djelloul", service: "Annual Physical Exam", amount: "15,000 DA", date: "Mar 22, 2026", status: "paid", method: "Insurance" },
  ];

  const statusConfig: Record<string, { label: string; color: "success" | "warning" | "danger" | "default" }> = {
    paid: { label: "Paid", color: "success" },
    pending: { label: "Pending", color: "warning" },
    overdue: { label: "Overdue", color: "danger" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-teal-600">Billing & Invoices</h1>
          <p className="text-slate-500 font-medium mt-1">Manage financial records and payment tracking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="font-bold border border-slate-200"><Download size={18} /> Export CSV</Button>
          <Button variant="primary" className="font-bold bg-teal-600 shadow-lg shadow-teal-200"><Plus size={18} /> Create Invoice</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm hover:border-teal-200 transition-colors">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={22} />
                </div>
                <div className={`text-xs font-black uppercase tracking-widest ${
                  s.change.startsWith("+") ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {s.change}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search invoices by patient, ID, or service..."
              className="pl-9 bg-white border border-slate-200 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="font-bold"><Filter size={18} /> Date Range</Button>
            <Button variant="secondary" className="font-bold"><Calendar size={18} /> This Month</Button>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Tabs aria-label="Invoice Status Filter">
        <Tab key="all" title={<span className="font-bold tracking-tight">All Invoices</span>}>
          <Card className="border border-slate-200 shadow-sm overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Invoice ID</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Patient</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Service</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => {
                    const cfg = statusConfig[inv.status] ?? { label: inv.status, color: "default" as const };
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-sm text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 inline-block">
                            {inv.id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-700">{inv.patient}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600">{inv.service}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-slate-900 font-mono">{inv.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Chip
                            size="sm"
                            color={cfg.color}
variant="soft"
                            className="font-black uppercase tracking-widest text-[9px]"
                          >
                            {cfg.label}
                          </Chip>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="font-bold text-slate-600" isIconOnly>
                              <FileText size={16} />
                            </Button>
                            {inv.status === "pending" && (
                              <Button size="sm" variant="secondary" className="font-bold text-[10px] text-emerald-600"><CheckCircle2 size={14} /> Mark Paid</Button>
                            )}
                            <Button size="sm" variant="ghost" className="font-bold text-slate-400" isIconOnly>
                              <Download size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Tab>
        <Tab key="pending" title={<span className="font-bold tracking-tight">Pending</span>} />
        <Tab key="paid" title={<span className="font-bold tracking-tight">Paid</span>} />
        <Tab key="overdue" title={<span className="font-bold tracking-tight">Overdue</span>} />
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-slate-200 border-dashed bg-slate-50/50 shadow-none">
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Receipt size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">Generate Monthly Report</h3>
              <p className="text-sm text-slate-500 font-medium">Export comprehensive financial summary for tax purposes</p>
            </div>
            <Button variant="secondary" className="font-bold text-teal-600 shrink-0"><ArrowRight size={16} /> Generate</Button>
          </div>
        </Card>

        <Card className="border border-slate-200 border-dashed bg-slate-50/50 shadow-none">
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">Configure Payment Methods</h3>
              <p className="text-sm text-slate-500 font-medium">Set up accepted payment types and insurance providers</p>
            </div>
            <Button variant="secondary" className="font-bold text-blue-600 shrink-0"><ArrowRight size={16} /> Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
