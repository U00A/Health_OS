"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Flag, AlertTriangle, Lightbulb, Eye } from "lucide-react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, TextArea } from "@heroui/react";

interface SignalButtonProps {
  patientId: Id<"patients">;
  doctorBetterAuthId: string;
}

type FlagType = "alert" | "recommendation" | "observation";

export function SignalButton({ patientId, doctorBetterAuthId }: SignalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [flagType, setFlagType] = useState<FlagType>("observation");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSignalFlag = useMutation(api.notifications.createSignalFlag);

  const handleSubmit = async () => {
    if (!note.trim() || note.length > 200) return;
    setIsSubmitting(true);
    try {
      await createSignalFlag({
        betterAuthId: doctorBetterAuthId,
        patient_id: patientId,
        flag_type: flagType,
        note: note.trim(),
      });
      setNote("");
      setIsOpen(false);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="font-bold text-amber-600 border-amber-200"
        onPress={() => setIsOpen(true)}
      >
        <Flag size={14} /> Signal Note
      </Button>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalHeader className="flex items-center gap-2">
          <Flag size={18} className="text-amber-600" />
          Signal Note to Care Team
        </ModalHeader>
        <ModalBody>
          <p className="text-xs text-slate-500 mb-4">
            This note will be visible to all subsequent treating doctors and the patient. Your identity will be anonymised as "Treating Physician".
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Flag Type</label>
              <div className="space-y-2">
                {[
                  { value: "alert" as FlagType, icon: AlertTriangle, color: "text-red-500", label: "Alert" },
                  { value: "recommendation" as FlagType, icon: Lightbulb, color: "text-amber-500", label: "Recommendation" },
                  { value: "observation" as FlagType, icon: Eye, color: "text-blue-500", label: "Observation" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFlagType(option.value)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${
                      flagType === option.value
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <option.icon size={16} className={option.color} />
                    <span className="text-sm font-medium text-slate-700">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Note (max 200 characters)</label>
              <TextArea
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                placeholder="Enter your note..."
                maxLength={200}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{note.length}/200</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={() => setIsOpen(false)} className="font-bold">
            Cancel
          </Button>
          <Button
            className="font-bold bg-amber-600 text-white"
            onPress={handleSubmit}
            isDisabled={!note.trim() || note.length > 200 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Signal"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
