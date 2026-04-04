"use client";

import { Activity, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoCredentials } from "@/components/auth/DemoCredentials";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
          }}
        />
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/80"
            style={{
              width: `${4 + (i % 5)}px`,
              height: `${4 + (i % 5)}px`,
              top: `${10 + i * 12}%`,
              left: `${(i * 15 + 5) % 100}%`,
              animation: `float ${6 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
      `}</style>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 text-white flex-col justify-between p-12 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 z-0" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 font-extrabold text-3xl tracking-tight mb-2">
            <Activity className="h-9 w-9 text-blue-300" />
            <span>HealthOS</span>
          </div>
          <p className="text-blue-200 font-medium text-sm tracking-wide">Unified Medical Architecture</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-black leading-tight">
            Secure, Role-Gated <br />Clinical Infrastructure.
          </h1>
          <p className="text-lg text-blue-100/80 font-light max-w-md leading-relaxed">
            Seamlessly coordinate ward admissions, pharmacy dispensing, and encrypted patient care channels on an immutable data fabric.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm font-medium text-blue-200/70">
          <ShieldCheck className="w-5 h-5" />
          <span>End-to-End Encrypted Platform Operations</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-12 xl:px-20 z-10">
        <AuthForm />
        <div className="mt-8 w-full max-w-[768px]">
          <DemoCredentials onSelect={() => {}} />
        </div>
      </div>
    </div>
  );
}