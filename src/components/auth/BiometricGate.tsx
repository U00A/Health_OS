"use client";

import { useState } from "react";
import { Fingerprint, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { Button } from "@heroui/react";
import { Id } from "../../../convex/_generated/dataModel";

interface BiometricGateProps {
  patientId: Id<"patients">;
  doctorBetterAuthId: string;
  onVerified: (sessionId: string) => void;
  onDenied: () => void;
}

export function BiometricGate({ patientId, doctorBetterAuthId, onVerified, onDenied }: BiometricGateProps) {
  const [step, setStep] = useState<"patient" | "doctor" | "verifying" | "success" | "denied">("patient");
  const [patientToken, setPatientToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePatientVerify = async () => {
    if (!patientToken.trim()) {
      setErrorMessage("Please enter biometric token");
      return;
    }

    setStep("verifying");
    setErrorMessage("");

    try {
      // Simulate biometric verification - in production this calls the security endpoint
      // For now, proceed to doctor verification step
      setStep("doctor");
    } catch (e) {
      setStep("denied");
      setErrorMessage((e as Error).message || "Verification failed");
    }
  };

  const handleDoctorVerify = async () => {
    setStep("verifying");
    setErrorMessage("");

    try {
      // Simulate doctor identity verification
      // In production this calls the security endpoint
      const sessionId = `session-${Date.now()}`;

      setStep("success");
      setTimeout(() => {
        onVerified(sessionId);
      }, 1000);
    } catch (e) {
      setStep("denied");
      setErrorMessage((e as Error).message || "Doctor verification failed");
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-emerald-600">
        <CheckCircle size={48} className="mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-emerald-700">Identity Verified</h3>
        <p className="text-sm text-emerald-500 mt-1">Opening patient record...</p>
      </div>
    );
  }

  if (step === "denied") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-rose-600">
        <XCircle size={48} className="mb-4" />
        <h3 className="text-lg font-bold text-rose-700">Verification Failed</h3>
        <p className="text-sm text-rose-500 mt-1 text-center max-w-xs">{errorMessage}</p>
        <Button
          size="sm"
          variant="ghost"
          className="mt-4 font-bold text-rose-600"
          onPress={() => {
            setStep("patient");
            setPatientToken("");
            setErrorMessage("");
          }}
        >
          Try Again
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 font-bold text-slate-500"
          onPress={onDenied}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Identity Verification Required</h3>
          <p className="text-xs text-slate-400">Dual-factor authentication for patient record access</p>
        </div>
      </div>

      {/* Step 1: Patient Biometric */}
      {step === "patient" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Patient Biometric Confirmation</p>
              <p className="text-xs text-slate-500">Scan patient fingerprint or enter token</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Fingerprint size={32} />
            </div>
            <input
              type="text"
              value={patientToken}
              onChange={(e) => setPatientToken(e.target.value)}
              placeholder="Enter biometric token"
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-mono text-center focus:border-blue-500 outline-none"
            />
            <Button
              className="w-full font-bold bg-blue-600 text-white"
              onPress={handlePatientVerify}
              isDisabled={!patientToken.trim()}
            >
              <Fingerprint size={16} /> Verify Patient
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Doctor Identity */}
      {step === "doctor" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Doctor Identity Confirmed</p>
              <p className="text-xs text-slate-500">Patient biometric verified successfully</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle size={32} />
            </div>
            <p className="text-sm text-slate-600 text-center">
              Confirm your professional identity to open the patient record
            </p>
            <Button
              className="w-full font-bold bg-emerald-600 text-white"
              onPress={handleDoctorVerify}
            >
              <Shield size={16} /> Confirm Doctor Identity
            </Button>
          </div>
        </div>
      )}

      {/* Verifying */}
      {step === "verifying" && (
        <div className="flex flex-col items-center justify-center py-8 text-blue-600">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="font-bold text-sm">Verifying identity...</p>
        </div>
      )}
    </div>
  );
}