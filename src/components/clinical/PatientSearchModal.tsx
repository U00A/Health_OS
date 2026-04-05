"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { Search, UserPlus, X, AlertTriangle } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

interface PatientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patient: Doc<"patients">) => void;
  showAssignButton?: boolean;
  betterAuthId?: string;
}

export function PatientSearchModal({
  isOpen,
  onClose,
  onSelect,
  showAssignButton,
  betterAuthId,
}: PatientSearchModalProps) {
  const [query, setQuery] = useState("");
  const results = useQuery(
    api.patients.searchByNationalId,
    query.length >= 3 ? { national_id: query } : "skip"
  );
  const selfAssign = useMutation(api.doctor_patients.selfAssignPatient);

  if (!isOpen) return null;

  const handleAssign = async (patient: Doc<"patients">) => {
    if (!betterAuthId) return;
    try {
      await selfAssign({ betterAuthId, patient_id: patient._id });
      onSelect(patient);
      onClose();
    } catch (e: unknown) {
      const error = e as Error;
      alert("Failed to assign: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-lg border border-slate-200 shadow-2xl">
        <div className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Search size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">
                  Find Patient
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Search by name or national ID
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-5">
            <input
              type="text"
              placeholder="Enter national ID or patient name..."
              className="w-full text-base font-mono p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="px-5 pb-5 max-h-80 overflow-y-auto">
            {query.length < 3 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                Type at least 3 characters to search
              </div>
            ) : results === undefined ? (
              <div className="flex items-center justify-center py-8 gap-3 text-blue-600">
                <Spinner size="sm" />
                <span className="font-medium text-sm">Searching records...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                No patients found matching &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                    onClick={() => !showAssignButton && onSelect(p)}
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {p.first_name} {p.last_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
                        <span className="font-mono bg-slate-100 px-2 rounded text-xs">
                          {p.national_id}
                        </span>
                        {p.blood_type && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>{p.blood_type}</span>
                          </>
                        )}
                      </div>
                      {p.allergies && p.allergies.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <AlertTriangle size={12} className="text-red-500" />
                          {p.allergies.map((a) => (
                            <Chip
                              key={a}
                              size="sm"
                              color="danger"
                              variant="soft"
                              className="text-[9px] font-black uppercase tracking-widest"
                            >
                              {a}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </div>
                    {showAssignButton ? (
                      <Button
                        size="sm"
                        className="font-bold bg-blue-600 text-white shadow-md shadow-blue-200"
                        onPress={() => handleAssign(p)}
                      >
                        <UserPlus size={14} /> Assign
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
