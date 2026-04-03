"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Pill,
  Microscope,
  Shield,
  UserRound,
  Building2,
  ClipboardList,
} from "lucide-react";

export interface BottomNavItem {
  href: string;
  label: string;
  icon: string;
  color: string; // text color when active
  activeBg: string; // bg color when active
  sections: string[]; // URL prefixes this item covers
}

interface MobileBottomNavigationProps {
  items?: BottomNavItem[];
  className?: string;
  hideOnDesktop?: boolean;
  announcementMessage?: string | null;
}

const DEFAULT_ITEMS: BottomNavItem[] = [
  { href: "/", label: "Home", icon: "Home", color: "text-blue-600", activeBg: "bg-blue-50", sections: ["/admin", "/doctor", "/private", "/staff", "/pharmacy", "/lab", "/patient-portal"] },
  { href: "/doctor", label: "Doctor", icon: "UserRound", color: "text-blue-600", activeBg: "bg-blue-50", sections: ["/doctor"] },
  { href: "/pharmacy", label: "Pharmacy", icon: "Pill", color: "text-emerald-600", activeBg: "bg-emerald-50", sections: ["/pharmacy"] },
  { href: "/lab", label: "Lab", icon: "Microscope", color: "text-violet-600", activeBg: "bg-violet-50", sections: ["/lab"] },
];

// Icon mapping
import * as LucideIcons from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap = LucideIcons as Record<string, any>;

function resolveIcon(name: string) {
  return iconMap[name] || Home;
}

/**
 * MobileBottomNavigation - Bottom tab bar for mobile devices.
 * Features:
 * - 4-5 max tabs with icon + label
 * - Active tab highlighting
 * - Safe area inset for notch devices
 * - Touch-friendly targets (min 48px)
 * - ARIA labels for accessibility
 * - Hides on desktop (md+)
 * - Screen reader announcements
 */
export function MobileBottomNavigation({
  items = DEFAULT_ITEMS,
  className = "",
  hideOnDesktop = true,
  announcementMessage,
}: MobileBottomNavigationProps) {
  const pathname = usePathname();

  // Determine active item
  const getActiveItem = useCallback(() => {
    for (const item of items) {
      if (pathname === item.href) return item;
      for (const section of item.sections) {
        if (pathname?.startsWith(section)) return item;
      }
    }
    return items[0];
  }, [pathname, items]);

  const activeItem = getActiveItem();

  // Use the announcement message directly from props (parent manages lifecycle)
  const announcement = announcementMessage;

  return (
    <>
      {/* Screen reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white/95 backdrop-blur-md
          border-t border-slate-200
          shadow-[0_-2px_10px_rgba(0,0,0,0.05)]
          ${hideOnDesktop ? "md:hidden" : ""}
          ${className}
        `}
        role="navigation"
        aria-label="Mobile bottom navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {items.map((item) => {
            const Icon = resolveIcon(item.icon);
            const isActive = activeItem?.href === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[48px] min-h-[48px]
                  flex-1 gap-0.5
                  rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                  active:scale-95
                  ${isActive
                    ? `${item.color} ${item.activeBg} font-semibold`
                    : "text-slate-400 hover:text-slate-600"
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  aria-hidden="true"
                />
                <span className="text-[10px] leading-none truncate">{item.label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${item.color.replace("text-", "bg-")}`} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind the nav bar */}
      <div className={`h-16 ${hideOnDesktop ? "md:hidden" : ""}`} aria-hidden="true" />
    </>
  );
}

/**
 * Compact mobile navigation with only icons (for devices with limited space)
 */
export function MobileIconNavigation({
  items = DEFAULT_ITEMS,
  className = "",
}: {
  items?: BottomNavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  const getActiveItem = useCallback(() => {
    for (const item of items) {
      if (pathname === item.href) return item;
      for (const section of item.sections) {
        if (pathname?.startsWith(section)) return item;
      }
    }
    return items[0];
  }, [pathname, items]);

  const activeItem = getActiveItem();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 ${className}`}
      role="navigation"
      aria-label="Mobile icon navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = resolveIcon(item.icon);
          const isActive = activeItem?.href === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-center
                min-w-[44px] min-h-[44px]
                flex-1
                rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                ${isActive
                  ? `${item.color}`
                  : "text-slate-400 hover:text-slate-600"
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} aria-hidden="true" />
              {isActive && (
                <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${item.color.replace("text-", "bg-")}`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}