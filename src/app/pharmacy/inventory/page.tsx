"use client";

import { Card, Button, Input, Chip } from "@heroui/react";
import { Search, Package, AlertTriangle, RefreshCw, Plus, BarChart3, Pill } from "lucide-react";

export default function InventoryPage() {
  const stock = [
    { name: "Amoxicillin 500mg", category: "Antibiotics", stock: 1240, min: 500, status: "stable" },
    { name: "Paracetamol 1g", category: "Analgesics", stock: 3200, min: 1000, status: "stable" },
    { name: "Insulin Glargine", category: "Antidiabetics", stock: 45, min: 100, status: "critical" },
    { name: "Atorvastatin 20mg", category: "Cardiovascular", stock: 850, min: 400, status: "stable" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pharmaceutical Stock</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor inventory levels and supply chain alerts</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="font-bold bg-amber-50 text-amber-700"><AlertTriangle size={16} /> Low Stock Alerts</Button>
          <Button variant="primary" className="font-bold bg-emerald-600 shadow-lg shadow-emerald-200"><Plus size={18} /> Log Supply</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Total SKU Count</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">1,482</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Pill size={20} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Items Dispensed Today</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">342</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Reorder Points Met</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight text-amber-600">12</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search inventory..." 
              className="pl-9"
            />
          </div>
          <Button variant="ghost"><RefreshCw size={16} /> Sync with Central Supply</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Medication</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Stock Level</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stock.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-slate-900">{item.stock} units</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Threshold: {item.min}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Chip 
                      size="sm" 
                      color={item.status === 'critical' ? 'danger' : 'success'} 
                      variant="soft"
                      className="font-black uppercase tracking-widest text-[9px]"
                    >
                      {item.status}
                    </Chip>
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
