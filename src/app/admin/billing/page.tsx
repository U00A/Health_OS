"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { DollarSign, UserSearch, Plus, Calendar, Clock, CheckCircle, XCircle, BarChart3, FileText, Printer, Download } from "lucide-react";

export default function AdminBillingPage() {
  const betterAuthId = useBetterAuthId();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState<string | null>(null);

  const admissions = useQuery(
    api.billing.getAdmissions,
    betterAuthId ? { betterAuthId, status: "active" } : "skip"
  );
  const stats = useQuery(
    api.billing.getStats,
    betterAuthId ? { betterAuthId } : "skip"
  );
  const searchPatients = useQuery(
    api.billing.searchPatients,
    betterAuthId && searchQuery.length >= 2 ? { betterAuthId, query: searchQuery } : "skip"
  );

  const createBilling = useMutation(api.billing.createBillingEntry);
  const updateBillingStatus = useMutation(api.billing.updateBillingStatus);
  const [showNewBilling, setShowNewBilling] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<"consultation" | "lab" | "imaging" | "bed_day" | "pharmacy" | "other">("consultation");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending" | "waived">("pending");

  const selectedAdmissionData = admissions?.find((a) => a._id === selectedAdmission);

  const handleCreateBilling = async () => {
    if (!betterAuthId || !selectedAdmission || !amount) return;
    try {
      // Find the patient from admission data
      const patientId = selectedAdmissionData?.patient_id;
      if (!patientId) return;

      await createBilling({
        betterAuthId,
        patient_id: patientId as Id<"patients">,
        admission_id: selectedAdmission as Id<"admissions">,
        service_category: serviceCategory,
        amount: parseFloat(amount),
        payment_status: paymentStatus,
      });
      setAmount("");
      setShowNewBilling(false);
    } catch (e) {
      alert("Failed to create billing entry: " + (e as Error).message);
    }
  };

  const handleUpdateStatus = async (billingId: Id<"billing_records">, status: "paid" | "pending" | "waived") => {
    if (!betterAuthId) return;
    try {
      await updateBillingStatus({ betterAuthId, billing_id: billingId, payment_status: status });
    } catch (e) {
      alert("Failed to update: " + (e as Error).message);
    }
  };

  if (admissions === undefined || stats === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administration — Billing</h1>
          <p className="text-slate-500 font-medium mt-1">Civil and billing data management</p>
        </div>
        <Button
          className="font-bold bg-emerald-600 text-white shadow-md shadow-emerald-200"
          onPress={() => setShowNewBilling(!showNewBilling)}
        >
          <Plus size={16} /> New Billing Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-600 text-white border-none shadow-lg shadow-emerald-200">
          <div className="p-4 text-center">
            <div className="text-3xl font-black font-mono">{stats.totalAdmissions}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 mt-1">Total Admissions</div>
          </div>
        </Card>
        <Card className="border border-blue-200 bg-blue-50">
          <div className="p-4 text-center">
            <div className="text-3xl font-black font-mono text-blue-700">{stats.admissionsThisMonth}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-1">This Month</div>
          </div>
        </Card>
        <Card className="border border-amber-200 bg-amber-50">
          <div className="p-4 text-center">
            <div className="text-3xl font-black font-mono text-amber-700">{stats.activeAdmissions}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mt-1">Active</div>
          </div>
        </Card>
        <Card className="border border-slate-200 bg-white">
          <div className="p-4 text-center">
            <div className="text-3xl font-black font-mono text-slate-900">{stats.avgStayDays}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Avg Stay (days)</div>
          </div>
        </Card>
      </div>

      {/* Search Patients */}
      <Card className="border border-slate-200 shadow-sm">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <UserSearch size={20} className="text-slate-500" />
            <h3 className="font-bold text-slate-900">Search Patients</h3>
          </div>
          <input
            type="text"
            placeholder="Search by name or national ID..."
            className="w-full p-3 rounded-lg border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length >= 2 && searchPatients !== undefined && (
            <div className="mt-3 space-y-2">
              {searchPatients.length === 0 ? (
                <p className="text-sm text-slate-400">No patients found</p>
              ) : (
                searchPatients.map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-900">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-slate-500 font-mono">{p.national_id} • {p.wilaya}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>

      {/* New Billing Form */}
      {showNewBilling && (
        <Card className="border border-emerald-200 shadow-lg bg-emerald-50/30">
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-600" /> New Billing Entry
            </h3>

            {/* Select Admission */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Admission</label>
              <select
                className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none"
                value={selectedAdmission || ""}
                onChange={(e) => setSelectedAdmission(e.target.value)}
              >
                <option value="">Select admission...</option>
                {admissions?.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.patientName} — Bed {a.bedName} — {new Date(a.admitted_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Category */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Service Category</label>
              <div className="flex gap-2 flex-wrap">
                {(["consultation", "lab", "imaging", "bed_day", "pharmacy", "other"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setServiceCategory(cat)}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                      serviceCategory === cat
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    {cat.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Amount (DZD)</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm font-mono focus:border-emerald-500 outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Payment Status</label>
                <div className="flex gap-2">
                  {(["pending", "paid", "waived"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPaymentStatus(s)}
                      className={`flex-1 p-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                        paymentStatus === s
                          ? s === "paid" ? "bg-emerald-600 text-white border-emerald-600"
                          : s === "waived" ? "bg-slate-500 text-white border-slate-500"
                          : "bg-amber-500 text-white border-amber-500"
                          : "bg-white border-slate-200 text-slate-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="font-bold bg-emerald-600 text-white shadow-md" onPress={handleCreateBilling} isDisabled={!selectedAdmission || !amount}>
                <CheckCircle size={14} /> Create Entry
              </Button>
              <Button variant="ghost" className="font-bold" onPress={() => { setShowNewBilling(false); setSelectedAdmission(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Document Generation */}
      <Card className="border border-slate-200 shadow-sm">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={20} className="text-slate-500" />
            <h3 className="font-bold text-slate-900">Document Generation</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Generate civil administrative documents as printable PDFs</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Admission Certificate</p>
                <p className="text-xs text-slate-500">Patient name, ward, admission date</p>
              </div>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Printer size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Discharge Summary</p>
                <p className="text-xs text-slate-500">Civil header only, no clinical content</p>
              </div>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/30 transition-all text-left"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Download size={18} className="text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Billing Statement</p>
                <p className="text-xs text-slate-500">Full billing history with payment status</p>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* Active Admissions */}
      <Card className="border border-slate-200 shadow-sm">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} className="text-slate-500" />
            <h3 className="font-bold text-slate-900">Active Admissions</h3>
          </div>
          <div className="space-y-3">
            {admissions.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No active admissions</p>
            ) : (
              admissions.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">{a.patientName}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="font-mono">{a.patientNationalId}</span>
                      <span>•</span>
                      <span>Bed: {a.bedName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {new Date(a.admitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="soft" color="success" className="font-bold text-[9px] uppercase tracking-wider">
                      {a.status.replace("_", " ")}
                    </Chip>
                    <Button size="sm" variant="ghost" className="font-bold text-slate-500" onPress={() => window.print()}>
                      <Printer size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}