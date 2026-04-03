"use client";

import { useState } from "react";
import { Card, Button, Chip, Switch } from "@heroui/react";
import {
  User, Shield, Bell, Lock, Download, LogOut,
  Mail, Phone, Calendar, FileText, Eye, EyeOff,
  CheckCircle2, AlertCircle, Settings
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function PatientSettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [labAlerts, setLabAlerts] = useState(true);
  const [prescriptionAlerts, setPrescriptionAlerts] = useState(true);
  const [shareWithDoctor, setShareWithDoctor] = useState(true);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your profile, privacy, and notification preferences</p>
        </div>
      </div>

      {/* Personal Information (Read-Only) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User size={18} className="text-slate-400" /> Personal Information
        </h2>
        <Card className="border border-slate-200 shadow-sm">
          <div className="divide-y divide-slate-100">
            {[
              { label: "Full Name", value: "Amir Khaled", icon: User },
              { label: "National ID", value: "1990 0542 1234 56", icon: Shield },
              { label: "Date of Birth", value: "15 June 1990", icon: Calendar },
              { label: "Email", value: "amir.k@example.com", icon: Mail },
              { label: "Phone", value: "+213 555 123 456", icon: Phone },
            ].map((field) => (
              <div key={field.label} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <field.icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{field.label}</div>
                    <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">{field.value}</div>
                  </div>
                </div>
                <Chip size="sm" variant="soft" className="font-bold text-[9px] uppercase bg-slate-50 text-slate-400">
                  <Lock size={10} className="mr-1" /> Read-only
                </Chip>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <AlertCircle size={14} className="text-slate-400 shrink-0" />
              To update personal details, contact your hospital administrator or visit the registration desk.
            </p>
          </div>
        </Card>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bell size={18} className="text-slate-400" /> Notifications
        </h2>
        <Card className="border border-slate-200 shadow-sm">
          <div className="divide-y divide-slate-100">
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Email Notifications</div>
                <div className="text-sm text-slate-500 font-medium">Receive updates about appointments and results via email</div>
              </div>
              <Switch isSelected={emailNotifs} onChange={setEmailNotifs} className="text-primary" />
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">SMS Alerts</div>
                <div className="text-sm text-slate-500 font-medium">Get text messages for urgent clinical notifications</div>
              </div>
              <Switch isSelected={smsNotifs} onChange={setSmsNotifs} className="text-primary" />
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Lab Result Alerts</div>
                <div className="text-sm text-slate-500 font-medium">Notify when new lab results are available</div>
              </div>
              <Switch isSelected={labAlerts} onChange={setLabAlerts} className="text-primary" />
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Prescription Updates</div>
                <div className="text-sm text-slate-500 font-medium">Alerts when prescriptions are issued or dispensed</div>
              </div>
              <Switch isSelected={prescriptionAlerts} onChange={setPrescriptionAlerts} className="text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Privacy & Consent */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Eye size={18} className="text-slate-400" /> Privacy & Consent
        </h2>
        <Card className="border border-slate-200 shadow-sm">
          <div className="divide-y divide-slate-100">
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Share Data with Treating Doctors</div>
                <div className="text-sm text-slate-500 font-medium">Allow assigned physicians to access your full medical profile</div>
              </div>
              <Switch isSelected={shareWithDoctor} onChange={setShareWithDoctor} className="text-success" />
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Anonymous Analytics</div>
                <div className="text-sm text-slate-500 font-medium">Contribute de-identified data for medical research</div>
              </div>
              <Switch isSelected={anonymousAnalytics} onChange={setAnonymousAnalytics} className="text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Account Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings size={18} className="text-slate-400" /> Account Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Download size={22} />
              </div>
              <div>
                <div className="font-bold text-slate-900">Download My Data</div>
                <div className="text-sm text-slate-500 font-medium">Export all your medical records as PDF</div>
              </div>
            </div>
          </Card>
          <Card className="border border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Lock size={22} />
              </div>
              <div>
                <div className="font-bold text-slate-900">Change Password</div>
                <div className="text-sm text-slate-500 font-medium">Update your account credentials</div>
              </div>
            </div>
          </Card>
        </div>
        <Button
          variant="ghost"
          className="w-full font-bold border-none mt-4 text-rose-500 hover:bg-rose-50"
          size="lg"
          onPress={handleSignOut}
        >
          <LogOut size={18} />
          Sign Out of All Devices
        </Button>
      </div>
    </div>
  );
}
