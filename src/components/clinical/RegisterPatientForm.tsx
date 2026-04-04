"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip } from "@heroui/react";
import { UserPlus, Send, Plus, X } from "lucide-react";
import { WILAYAS } from "@/data/wilayas";

interface RegisterPatientFormProps {
  betterAuthId: string;
  onSuccess?: (patientId: string) => void;
  onCancel?: () => void;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function RegisterPatientForm({ betterAuthId, onSuccess, onCancel }: RegisterPatientFormProps) {
  const createPatient = useMutation(api.patients.create);
  const [nationalId, setNationalId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [saving, setSaving] = useState(false);

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (a: string) => {
    setAllergies(allergies.filter((x) => x !== a));
  };

  const handleSubmit = async () => {
    if (!nationalId || !firstName || !lastName || !dob) {
      alert("National ID, first name, last name, and date of birth are required.");
      return;
    }
    setSaving(true);
    try {
      const id = await createPatient({
        betterAuthId,
        national_id: nationalId,
        first_name: firstName,
        last_name: lastName,
        dob,
        sex,
        blood_type: bloodType || undefined,
        phone: phone || undefined,
        wilaya: wilaya || undefined,
        commune: commune || undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
      });
      onSuccess?.(id);
    } catch (e: unknown) {
      const error = e as Error;
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-slate-200 shadow-lg">
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <UserPlus size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Register Patient</h3>
            <p className="text-xs text-slate-500 font-medium">Add a new patient to the registry</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              National ID *
            </label>
            <input
              placeholder="Enter national identification number"
              className="w-full p-3 rounded-lg border border-slate-200 bg-white text-base font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 outline-none"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              First Name *
            </label>
            <input
              placeholder="First name"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-emerald-500 outline-none"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Last Name *
            </label>
            <input
              placeholder="Last name"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-emerald-500 outline-none"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-emerald-500 outline-none"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Sex</label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`flex-1 p-3 rounded-lg border text-sm font-bold capitalize transition-all ${
                    sex === s ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Blood Type
            </label>
            <select
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-emerald-500 outline-none"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
            >
              <option value="">Select...</option>
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Phone</label>
            <input
              placeholder="0555 000 000"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-emerald-500 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Wilaya</label>
            <select
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-emerald-500 outline-none"
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
            >
              <option value="">Select wilaya...</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Commune</label>
            <input
              placeholder="Commune / district"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-emerald-500 outline-none"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
            />
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Known Allergies
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {allergies.map((a) => (
              <div key={a} className="flex items-center gap-1">
                <Chip
                  color="danger"
                  variant="soft"
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {a}
                </Chip>
                <button
                  type="button"
                  onClick={() => removeAllergy(a)}
                  className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Add allergy (e.g. Penicillin)"
              className="flex-1 p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:border-rose-500 outline-none"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAllergy()}
            />
            <Button size="sm" variant="ghost" className="font-bold text-rose-600" onPress={addAllergy}>
              <Plus size={14} /> Add
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button variant="ghost" className="font-bold" onPress={onCancel}>Cancel</Button>
          )}
          <Button
            className="font-bold bg-emerald-600 text-white shadow-md shadow-emerald-200"
            onPress={handleSubmit}
            isDisabled={saving}
          >
            <Send size={14} /> {saving ? "Registering..." : "Register Patient"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
