"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Menu,
  X,
  Activity,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { BellNotification } from "@/components/BellNotification";
import { useNavigation, useSectionInfo, getDefaultBackRoute } from "@/hooks/useNavigation";
import { authClient } from "@/lib/auth-client";

export interface SectionLink {
  href: string;
  label: string;
  icon: string;
  color: string;
  activeBg: string;
}

interface GlobalNavigationHeaderProps {
  sections?: SectionLink[];
  showSearch?: boolean;
  showUserMenu?: boolean;
  roleColor?: string;
  className?: string;
}

const DEFAULT_SECTIONS: SectionLink[] = [
  { href: "/admin", label: "Admin", icon: "Shield", color: "text-slate-900", activeBg: "bg-slate-100" },
  { href: "/doctor", label: "Doctor", icon: "UserRound", color: "text-blue-600", activeBg: "bg-blue-50" },
  { href: "/private", label: "Private", icon: "Building2", color: "text-teal-500", activeBg: "bg-teal-50" },
  { href: "/staff", label: "Staff", icon: "ClipboardList", color: "text-sky-500", activeBg: "bg-sky-50" },
  { href: "/pharmacy", label: "Pharmacy", icon: "Pill", color: "text-emerald-500", activeBg: "bg-emerald-50" },
  { href: "/lab", label: "Laboratory", icon: "Microscope", color: "text-violet-600", activeBg: "bg-violet-50" },
  { href: "/patient-portal", label: "Patient", icon: "User", color: "text-indigo-600", activeBg: "bg-indigo-50" },
];

// Lucide icon map
import * as LucideIcons from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap = LucideIcons as Record<string, any>;

function resolveIcon(name: string) {
  return iconMap[name] || Activity;
}

export function GlobalNavigationHeader({
  sections = DEFAULT_SECTIONS,
  showSearch = true,
  showUserMenu = true,
  roleColor = "bg-blue-600",
  className = "",
}: GlobalNavigationHeaderProps) {
  const { back, goHome, currentPath } = useNavigation();
  const { sectionName, sectionRoot, breadcrumbs } = useSectionInfo();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const isInSection = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  // Announce message with auto-clear
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(null), 1000);
  }, []);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key === "Home") {
      e.preventDefault();
      goHome();
      announce("Navigated to home");
    }
    if (e.key === "Escape") {
      setMenuOpen(false);
      setUserMenuOpen(false);
      setSearchOpen(false);
    }
  }, [goHome, announce]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Back handler
  const handleBack = useCallback(() => {
    void getDefaultBackRoute(currentPath);
    back();
    announce("Navigated back");
  }, [back, announce, currentPath]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Screen reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <header
        className={`sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm shadow-slate-100/50 flex items-center px-4 md:px-6 ${className}`}
        role="banner"
        aria-label="Global navigation header"
      >
        {/* Left: Back + Home + Brand */}
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back to previous page"
            aria-keyshortcuts="Alt+ArrowLeft"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={goHome}
            aria-label="Go to home page"
            aria-keyshortcuts="Alt+Home"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
          >
            <Home className="w-5 h-5" />
          </button>

          <Link
            href={sectionRoot}
            className="flex items-center gap-2 group"
            aria-label={`${sectionName} - Go to section home`}
          >
            <div className={`w-8 h-8 ${roleColor} rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105`}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <span className="font-bold text-slate-900 tracking-tight">Health<span className="text-blue-600">OS</span></span>
              <span className="text-slate-400 text-xs ml-2 font-medium">{sectionName}</span>
            </div>
          </Link>
        </div>

        {/* Center: Breadcrumbs (desktop) */}
        <nav className="hidden md:flex flex-1 items-center gap-1 mx-4 overflow-hidden" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className="flex items-center gap-1 shrink-0">
                {index > 0 && <span className="text-slate-300" aria-hidden="true">/</span>}
                <Link
                  href={crumb.href}
                  className={`text-sm font-medium px-2 py-1 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isLast ? "text-slate-900 font-semibold bg-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Right: Notifications + Search + Sections + User */}
        <div className="flex items-center gap-2">
          <BellNotification />
          {showSearch && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          <nav className="hidden lg:flex items-center gap-1" aria-label="Section navigation">
            {sections.map((section) => {
              const Icon = resolveIcon(section.icon);
              const active = isInSection(section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${active ? `${section.activeBg} ${section.color} shadow-sm` : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </Link>
              );
            })}
          </nav>

          {showUserMenu && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">U</div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div role="menu" aria-orientation="vertical" className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 py-2 z-50">
                  <Link
                    href="/patient-portal/settings"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="my-1 border-slate-100" />
                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-slate-100 shadow-lg" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <nav className="p-4" aria-label="Mobile navigation">
              <div className="grid grid-cols-2 gap-2">
                {sections.map((section) => {
                  const Icon = resolveIcon(section.icon);
                  const active = isInSection(section.href);
                  return (
                    <Link
                      key={section.href}
                      href={section.href}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${active ? `${section.activeBg} ${section.color}` : "text-slate-600 hover:bg-slate-50"}`}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="w-5 h-5" />
                      {section.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </header>

      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />}
    </>
  );
}
