"use client";

import { useCallback } from "react";
import { Activity, ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoCredentials } from "@/components/auth/DemoCredentials";
import { Button } from "@heroui/react";
import Link from "next/link";

export default function LoginPage() {
  const handleDemoSelect = useCallback((email: string, password: string) => {
    window.dispatchEvent(new CustomEvent("demo-fill", { detail: { email, password } }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="light"
              startContent={<ArrowLeft className="w-4 h-4" />}
              className="font-semibold"
            >
              Back to Platform
            </Button>
          </Link>
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
        <div className="w-full max-w-md space-y-8">
          {/* Branding Section */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Activity className="h-8 w-8 text-white" />
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