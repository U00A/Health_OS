"use client";

import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { LogOut, Menu, X, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MobileBottomNavigation } from "@/components/navigation";
import { useRoleNavigation } from "@/hooks/useRoleNavigation";

interface DashboardShellProps {
  children: React.ReactNode;
  roleTitle: string;
  roleColor?: string;
  sidebarContent: React.ReactNode;
}

export function DashboardShell({
  children,
  roleTitle,
  roleColor = "bg-blue-600",
  sidebarContent,
}: DashboardShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { roleColor: autoColor, mobileItems } = useRoleNavigation();
  const finalColor = roleColor || autoColor;

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    window.location.href = "/login";
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-slate-100 transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-8 h-8 ${finalColor} rounded-lg flex items-center justify-center shadow-md`}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Health<span className="text-blue-600">OS</span></span>
          </Link>
          <button
            className="ml-auto p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Indicator Strip */}
        <div className={`h-[3px] w-full ${finalColor}`} />

        <div className="px-6 py-5 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Portal Overview</span>
          <div className="font-black text-xl text-slate-900 tracking-tight mt-1">{roleTitle}</div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4" role="navigation" aria-label="Sidebar navigation">
          {sidebarContent}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Securely
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (only for mobile) */}
        <header className="lg:hidden h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-4 shrink-0 z-30 sticky top-0">
          <button
            className="p-2 mr-3 rounded-lg hover:bg-slate-100 text-slate-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Go back to previous page"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 disabled:opacity-40 mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 ${finalColor} rounded-md flex items-center justify-center`}>
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">{roleTitle}</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          <div className="mx-auto max-w-7xl animate-fade-in relative">
            {children}
          </div>
        </main>

        {/* Mobile bottom navigation - role filtered */}
        <MobileBottomNavigation items={mobileItems} />
      </div>
    </div>
  );
}