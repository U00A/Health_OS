"use client";

import { useCallback } from "react";
import { Activity, ShieldCheck, ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoCredentials } from "@/components/auth/DemoCredentials";
import Link from "next/link";

export default function LoginPage() {
  const handleDemoSelect = useCallback((email: string, password: string) => {
    window.dispatchEvent(new CustomEvent("demo-fill", { detail: { email, password } }));
  }, []);

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-50" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      
      {/* Floating Back Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-white/50 text-slate-700 font-bold text-sm rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-white transition-all group animate-in fade-in slide-in-from-left-4 duration-700"
      >
        <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-1 transition-transform" />
        Back to Platform
      </Link>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #06b6d4 100%)",
          }}
        />
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
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
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s'}} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-30px) translateX(15px) rotate(180deg); opacity: 1; }
        }
      `}</style>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 text-white flex-col justify-between p-12 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-800/95 to-slate-900 z-0 backdrop-blur-sm" />
        
        <div className="relative z-10 mt-10 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="flex items-center gap-3 font-extrabold text-3xl tracking-tight mb-2">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md">
              <Activity className="h-6 w-6 text-blue-300" />
            </div>
            <span>HealthOS</span>
          </div>
          <p className="text-blue-200 font-medium text-sm tracking-wide ml-1">Unified Medical Architecture</p>
        </div>

        <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
          <h1 className="text-4xl xl:text-5xl font-black leading-tight drop-shadow-sm">
            Secure, Role-Gated <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-cyan-200">
               Clinical Infrastructure.
            </span>
          </h1>
          <p className="text-lg text-blue-100/90 font-medium max-w-md leading-relaxed border-l-2 border-blue-400/50 pl-4">
            Seamlessly coordinate ward admissions, pharmacy dispensing, and encrypted patient care channels on an immutable data fabric.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm font-bold text-blue-200/90 bg-white/5 border border-white/10 w-fit px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-lg mb-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>End-to-End Encrypted Platform Operations</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-12 xl:px-20 z-10">
        <div className="w-full max-w-[850px] relative animate-in fade-in zoom-in-95 duration-1000">
           <AuthForm />
        </div>
        <div className="mt-8 w-full max-w-[850px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <DemoCredentials onSelect={handleDemoSelect} />
        </div>
      </div>
    </div>
  );
}