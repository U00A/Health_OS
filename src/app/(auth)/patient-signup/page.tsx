"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { Activity, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { PatientSignupForm } from "@/components/auth/PatientSignupForm";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Spinner } from "@heroui/react";

function PatientSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSignup, setShowSignup] = useState(true);
  const [authComplete, setAuthComplete] = useState(true);

  const listenForAuth = useCallback(() => {
    setShowSignup(true);
  }, []);

  useEffect(() => {
    window.addEventListener("auth-success", listenForAuth);
    return () => window.removeEventListener("auth-success", listenForAuth);
  }, [listenForAuth]);

  // Use session-based auth_id
  const betterAuthId = searchParams.get("auth_id") || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all duration-200"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-700">HealthOS</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg space-y-8">
          {!showSignup ? (
            <>
              {/* Branding Section */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Patient Registration</h1>
                  <p className="text-slate-600 mt-2">
                    Create your account to access your health dashboard
                  </p>
                </div>
              </div>

              {/* Auth Form */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <AuthForm onSignupSuccess={() => {
                setShowSignup(true);
                setAuthComplete(true);
              }} />
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push("/login")}
                    className="text-blue-600 font-semibold hover:text-blue-700"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Branding Section */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Complete Your Profile</h1>
                  <p className="text-slate-600 mt-2">
                    Tell us about yourself to personalize your experience
                  </p>
                </div>
              </div>

              {/* Patient Signup Form */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <PatientSignupForm betterAuthId={betterAuthId || ""} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <span className="text-sm font-medium text-slate-500 animate-pulse uppercase tracking-widest">Initialising Secure Registration...</span>
      </div>
    }>
      <PatientSignupContent />
    </Suspense>
  );
}