"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { User, Shield, AlertTriangle, FileText, Phone, Lock, Edit2, Check, LogOut } from "lucide-react";
import { Card, Button, Chip, Spinner, Input } from "@heroui/react";

export default function PatientPortal() {
  const { data: session } = authClient.useSession();
  const betterAuthId = session?.user?.id;
  const profile = useQuery(api.patients.getMyProfile, betterAuthId ? { betterAuthId } : "skip");
  const updateProfile = useMutation(api.patients.updateContactInfo);
  const seedData = useMutation(api.patients.seedDemoPatient);
  
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    if (profile) setPhone(profile.phone || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!betterAuthId) return;
    try {
      await updateProfile({ betterAuthId, phone });
      setIsEditing(false);
      alert("Contact information updated successfully.");
    } catch(e) {
      const error = e as Error;
      alert("Error saving: " + error.message);
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
         <div className="flex flex-col items-center gap-4 text-blue-600">
           <Spinner size="lg" />
           <span className="font-bold tracking-widest uppercase text-xs">Loading Secure Portal</span>
         </div>
      </div>
    );
  }
  
  if (profile === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="p-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
              <Shield size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registration Complete</h2>
              <p className="text-slate-500 font-medium mt-2">Your secure medical account is active.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                To protect medical privacy, a clinical administrator must link your account to your offline hospital profile before records appear here.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                variant="secondary" 
                className="w-full font-bold"
                onPress={() => betterAuthId && void seedData({ betterAuthId }).then(() => window.location.reload())}
              >
                Generate Demo Data
              </Button>
              <Button variant="primary" className="w-full font-bold" onPress={() => window.location.href = "/"}>
                Refresh Account Status
              </Button>
              <Button 
                variant="ghost" 
                 className="w-full font-bold border-none text-rose-600"
                 onPress={handleSignOut}
               >
                 <LogOut size={16} /> Secure Sign Out
               </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Chip size="sm" className="bg-white/20 text-white font-mono uppercase tracking-widest text-[10px] mb-4 border-none">
              Verified Patient
            </Chip>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
              Welcome back, {profile.first_name}
            </h1>
            <div className="flex flex-wrap gap-4 mt-4 text-blue-100 font-medium font-mono text-sm">
              <span className="flex items-center gap-1.5"><User size={16} /> {profile.national_id}</span>
              <span className="text-blue-400">•</span>
              <span>DOB: {new Date(profile.dob).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
            <User className="w-8 h-8 md:w-12 md:h-12 text-white/50" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 md:-mt-8 relative z-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Contact Info Card */}
        <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                <Phone size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Contact Info</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input 
                      autoFocus
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="font-mono text-lg"
                      size={16}
                    />
                  </div>
                ) : (
                  <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">{profile.phone || "Not set"}</div>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onPress={() => setIsEditing(false)} className="font-bold">Cancel</Button>
                     <Button className="font-bold shadow-md shadow-blue-200 bg-blue-600 text-white" onPress={handleSave}>
                       <Check size={16} /> Save Changes
                     </Button>
                  </>
                ) : (
                   <Button variant="ghost" className="font-bold text-blue-600" onPress={startEditing}>
                     <Edit2 size={16} /> Edit Information
                   </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Clinical Data Card */}
        <Card className="border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                <Shield className="text-slate-600" size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Clinical Overview</h2>
            </div>

            {profile.allergies && profile.allergies.length > 0 ? (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3">
                <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="text-rose-900 font-bold block mb-2">Active Allergy Alerts</strong>
                  <ul className="list-disc pl-5 text-sm font-medium text-rose-700/80 space-y-1">
                    {profile.allergies.map((a: string) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Check className="text-emerald-500" size={16} /> No critical allergies on file.
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center opacity-60 grayscale cursor-not-allowed">
                <div className="flex items-center gap-3 font-semibold text-slate-700">
                  <FileText size={20} />
                  Latest Prescriptions
                </div>
                <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  <Lock size={12} /> Encrypted
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center opacity-60 grayscale cursor-not-allowed">
                <div className="flex items-center gap-3 font-semibold text-slate-700">
                  <FileText size={20} />
                  Laboratory Results
                </div>
                <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  <Lock size={12} /> Encrypted
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
