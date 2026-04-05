"use client";

import { useCallback } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoCredentials } from "@/components/auth/DemoCredentials";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const handleDemoSelect = useCallback((email: string, password: string) => {
    window.dispatchEvent(new CustomEvent("demo-fill", { detail: { email, password } }));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all duration-200"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Platform
            </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-xs overflow-hidden flex items-center justify-center p-1.5 border border-slate-100">
              <Image src="/logo.png" alt="HealthOS" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight">HealthOS</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-md space-y-8">
          {/* Branding Section */}
          <div className="text-center space-y-5">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl p-3 border border-slate-100 overflow-hidden transform hover:rotate-3 transition-transform duration-500">
              <Image src="/logo.png" alt="HealthOS Logo" width={96} height={96} className="w-full h-full object-contain" priority />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome to HealthOS</h1>
              <p className="text-slate-600 mt-2">
                Modern healthcare infrastructure, simplified
              </p>
            </div>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <AuthForm />
          </div>

          {/* Demo Credentials */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6">
            <DemoCredentials onSelect={handleDemoSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}
