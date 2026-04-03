"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Trash } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";

export function PrescriptionForm({ patientId }: { patientId: Id<"patients"> }) {
  const betterAuthId = useBetterAuthId();
  const createPrescription = useMutation(api.prescriptions.create);
  
  const [meds, setMeds] = useState([{ name: "", dose: "", frequency: "", duration: "" }]);
  const [error, setError] = useState("");

  const handleAdd = () => setMeds([...meds, { name: "", dose: "", frequency: "", duration: "" }]);
  const handleRemove = (index: number) => setMeds(meds.filter((_, i) => i !== index));
  const updateMed = (index: number, field: keyof typeof meds[0], value: string) => {
    const updated = [...meds];
    updated[index] = { ...updated[index], [field]: value };
    setMeds(updated);
  };

  const handleSave = async () => {
    if (!betterAuthId) return;
    setError("");
    const validMeds = meds.filter(m => m.name.trim() !== "");
    if (validMeds.length === 0) return;

    try {
      await createPrescription({ betterAuthId, patient_id: patientId, medications: validMeds });
      setMeds([{ name: "", dose: "", frequency: "", duration: "" }]);
      alert("Prescription saved successfully!");
    } catch (err) {
      const errorObj = err as Error;
      // THIS is where the allergy cross-check error will surface
      setError(errorObj.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Issue Prescription</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          <strong className="font-bold block mb-1">Prescription Alert:</strong> {error}
        </div>
      )}

      <div className="space-y-4">
        {meds.map((med, index) => (
          <div key={index} className="flex flex-wrap gap-2 items-end border p-3 rounded-md bg-gray-50">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700">Medication Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" placeholder="e.g. Amoxicillin" value={med.name} onChange={(e) => updateMed(index, 'name', e.target.value)} />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-700">Dose</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" placeholder="10mg" value={med.dose} onChange={(e) => updateMed(index, 'dose', e.target.value)} />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-700">Frequency</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" placeholder="Once daily" value={med.frequency} onChange={(e) => updateMed(index, 'frequency', e.target.value)} />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-700">Duration</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" placeholder="7 days" value={med.duration} onChange={(e) => updateMed(index, 'duration', e.target.value)} />
            </div>
            {meds.length > 1 && (
              <button onClick={() => handleRemove(index)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors mb-0.5">
                <Trash size={16} />
              </button>
            )}
          </div>
        ))}
        
        <button onClick={handleAdd} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800">
          <Plus size={16} /> Add Medication
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition-colors">
          Issue Prescription
        </button>
      </div>
    </div>
  );
}
