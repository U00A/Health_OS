"use client";
import { AlertCircle, User, MapPin, Phone, Droplet } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

export function PatientHeader({ patient }: { patient: Doc<"patients"> | null | undefined }) {
  if (!patient) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h2>
            <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                ID: {patient.national_id}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {patient.commune}, {patient.wilaya}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} /> {patient.phone || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <Droplet size={14} className="text-red-500" /> Blood: {patient.blood_type || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {patient.allergies && patient.allergies.length > 0 && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-md max-w-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="block font-semibold">Known Allergies:</strong>
              {patient.allergies.join(", ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
