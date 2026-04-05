"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { User } from "lucide-react";
import { Id, Doc } from "../../../convex/_generated/dataModel";

export function ClinicalSidebar({ currentUserId }: { currentUserId: Id<"users"> }) {
  const assignedPatients = useQuery(api.doctor_patients.listPatientsForDoctor, { 
    doctor_id: currentUserId 
  });

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">My Patients</h3>
      <div className="space-y-1 flex-1 overflow-auto">
        {assignedPatients === undefined ? (
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ) : assignedPatients?.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No assigned patients</div>
        ) : (
          assignedPatients?.filter((p): p is NonNullable<typeof p> => p !== null).map((p) => (
            <button key={p._id} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              <User size={16} className="text-blue-500" />
              <span>{p.first_name} {p.last_name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
