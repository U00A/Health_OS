"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

// Map of available lucide icons by name
import * as LucideIcons from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap = LucideIcons as Record<string, any>;

interface SidebarItemProps {
  href: string;
  icon: string | LucideIcon;
  label: string;
  activeColor?: string; // Optional custom color for active state
}

export function SidebarItem({ href, icon, label, activeColor }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Resolve the icon: if it's a string, look it up in the map; otherwise use it directly
  const Icon = typeof icon === "string" ? iconMap[icon] : icon;
  
  if (!Icon) {
    return null;
  }

  return (
    <Link
      href={href}
      className={cn(
        "sidebar-link relative group overflow-hidden",
        isActive && "active"
      )}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full transition-all duration-300",
          activeColor || "bg-blue-600"
        )} />
      )}

      {/* Icon with subtle hover scale */}
      <Icon className={cn(
        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
        isActive ? (activeColor?.replace("bg-", "text-") || "text-blue-600") : "text-slate-400 group-hover:text-slate-600"
      )} />

      {/* Label */}
      <span className={cn(
        "flex-1 truncate transition-colors duration-300",
        isActive ? "font-bold text-slate-900" : "font-medium text-slate-500 group-hover:text-slate-900"
      )}>
        {label}
      </span>
      
      {/* Subtle hover background highlight */}
      <div className={cn(
        "absolute inset-0 -z-10 bg-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        isActive && "opacity-0" // Don't show hover bg on active item
      )} />
    </Link>
  );
}
