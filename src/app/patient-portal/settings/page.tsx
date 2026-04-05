"use client";

import { useState } from "react";
import { Card, Button, Chip, Switch } from "@heroui/react";
import {
  User, Shield, Bell, Lock, Download, LogOut,
  Mail, Phone, Calendar, Eye, Settings, AlertCircle
} from "lucide-react";

export default function PatientSettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [labAlerts, setLabAlerts] = useState(true);
  const [prescriptionAlerts, setPrescriptionAlerts] = useState(true);
  const [shareWithDoctor, setShareWithDoctor] = useState(true);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
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

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User size={18} className="text-slate-400" /> Personal Information
        </h2>
        <Card className="border border-slate-200 shadow-sm p-5">
          <p className="text-slate-500 text-sm">Personal information is managed by your hospital. Contact your administrator to update details.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bell size={18} className="text-slate-400" /> Notifications
        </h2>
        <Card className="border border-slate-200 shadow-sm divide-y divide-slate-100">
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Email Notifications</div>
              <div className="text-sm text-slate-500">Receive updates via email</div>
            </div>
            <Switch isSelected={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">SMS Alerts</div>
              <div className="text-sm text-slate-500">Get text messages for urgent notifications</div>
            </div>
            <Switch isSelected={smsNotifs} onChange={() => setSmsNotifs(!smsNotifs)} />
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Lab Result Alerts</div>
              <div className="text-sm text-slate-500">Notify when new lab results are available</div>
            </div>
            <Switch isSelected={labAlerts} onChange={() => setLabAlerts(!labAlerts)} />
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Prescription Updates</div>
              <div className="text-sm text-slate-500">Alerts when prescriptions change</div>
            </div>
            <Switch isSelected={prescriptionAlerts} onChange={() => setPrescriptionAlerts(!prescriptionAlerts)} />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Eye size={18} className="text-slate-400" /> Privacy & Consent
        </h2>
        <Card className="border border-slate-200 shadow-sm divide-y divide-slate-100">
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Share Data with Doctors</div>
              <div className="text-sm text-slate-500">Allow physicians to access your profile</div>
            </div>
            <Switch isSelected={shareWithDoctor} onChange={() => setShareWithDoctor(!shareWithDoctor)} />
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Anonymous Analytics</div>
              <div className="text-sm text-slate-500">Contribute de-identified data for research</div>
            </div>
            <Switch isSelected={anonymousAnalytics} onChange={() => setAnonymousAnalytics(!anonymousAnalytics)} />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings size={18} className="text-slate-400" /> Account Actions
        </h2>
        <Button
          variant="ghost"
          className="w-full font-bold text-rose-500 hover:bg-rose-50"
          size="lg"
          onPress={handleSignOut}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}