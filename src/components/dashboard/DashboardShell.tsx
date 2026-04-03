"use client";

import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { LogOut, Menu, X, Activity } from "lucide-react";
import Link from "next/link";
import { BackButton, GlobalNavigationHeader, MobileBottomNavigation } from "@/components/navigation";
import { useSectionInfo } from "@/hooks/useNavigation";
import { useRoleNavigation } from "@/hooks/useRoleNavigation";

interface DashboardShellProps {
  children: React.ReactNode;
  roleTitle?: string; // Override auto-detected role title
  roleColor?: string; // Override auto-detected role color
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  useGlobalNav?: boolean; // Use GlobalNavigationHeader + MobileBottomNav
}

export function DashboardShell({
  children,
  roleTitle: overrideTitle,
  roleColor: overrideColor,
  sidebarContent,
  headerContent,
  useGlobalNav = false,
}: DashboardShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { breadcrumbs } = useSectionInfo();
  const { sections, mobileItems, roleColor, roleTitle } = useRoleNavigation();
  const [announcement, setAnnouncement] = useState<string | null>(null);

  // Use overrides if provided, otherwise use role-based values
  const finalColor = overrideColor || roleColor;
  const finalTitle = overrideTitle || roleTitle;

  // Announce navigation for screen readers
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(null), 1000);
  }, []);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    window.location.href = "/login";
  }, []);

  // New global navigation mode with role-filtered items
  if (useGlobalNav) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <GlobalNavigationHeader
          sections={sections}
          roleColor={finalColor}
          className="flex-shrink-0"
        />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Page-level back button and title */}
            <div className="mb-6 flex items-center gap-3">
              <BackButton size="md" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{finalTitle}</h1>
                <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 mt-1">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <span key={crumb.href} className="flex items-center gap-1">
                        {index > 0 && <span className="text-slate-300">/</span>}
                        <Link
                          href={crumb.href}
                          className={`text-sm font-medium transition-colors ${isLast ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                          aria-current={isLast ? "page" : undefined}
                        >
                          {crumb.label}
                        </Link>
                      </span>
                    );
                  })}
                </nav>
              </div>
            </div>
            
            {children}
          </div>
        </main>

        {/* Mobile bottom navigation - role filtered */}
        <MobileBottomNavigation
          items={mobileItems}
          announcementMessage={announcement}
        />

        {/* Screen reader live region */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
      </div>
    );
  }

  // Classic sidebar mode (backward compatible with role-aware mobile nav)
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
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-slate-100 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } flex flex-col`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
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
          <div className="font-black text-xl text-slate-900 tracking-tight mt-1">{finalTitle}</div>
        </div>

        {/* Custom Sidebar Content (e.g. Nav Links, Patient List) */}
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
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-4 md:px-6 shrink-0 z-30 sticky top-0 shadow-sm shadow-slate-100/50">
          <button
            className="p-2 mr-4 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Back button for sidebar pages */}
          <BackButton size="sm" className="mr-3" />
          
          <div className="flex-1 flex items-center h-full">
            {headerContent || <div className="text-sm font-semibold text-slate-400">Ready</div>}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          <div className="mx-auto max-w-7xl animate-fade-in relative">
             {children}
          </div>
        </main>

        {/* Mobile bottom navigation - role filtered */}
        <MobileBottomNavigation items={mobileItems} announcementMessage={announcement} />
      </div>
    </div>
  );
}