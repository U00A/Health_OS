/**
 * Role-based Navigation Configuration
 * 
 * Defines which navigation sections each role can access.
 * Roles from schema: admin, medecin_etat, private_doctor, medical_staff, pharmacy, laboratory, patient
 */

import { BottomNavItem } from "@/components/navigation/MobileBottomNavigation";
import { SectionLink } from "@/components/navigation/GlobalNavigationHeader";

// Role type matching the Convex schema
export type UserRole =
  | "admin"
  | "medecin_etat"
  | "private_doctor"
  | "medical_staff"
  | "pharmacy"
  | "laboratory"
  | "patient";

// Section definitions for each role
export const ROLE_NAVIGATION: Record<UserRole, SectionLink[]> = {
  admin: [
    { href: "/admin", label: "Security", icon: "Shield", color: "text-slate-900", activeBg: "bg-slate-100" },
    { href: "/admin/users", label: "Users", icon: "Users", color: "text-slate-900", activeBg: "bg-slate-100" },
    { href: "/admin/settings", label: "Settings", icon: "Settings", color: "text-slate-900", activeBg: "bg-slate-100" },
  ],
  medecin_etat: [
    { href: "/doctor", label: "Patients", icon: "UserRound", color: "text-blue-600", activeBg: "bg-blue-50" },
    { href: "/doctor/appointments", label: "Schedule", icon: "CalendarHeart", color: "text-blue-600", activeBg: "bg-blue-50" },
    { href: "/doctor/reports", label: "Reports", icon: "FileText", color: "text-blue-600", activeBg: "bg-blue-50" },
  ],
  private_doctor: [
    { href: "/private", label: "Clinic", icon: "Building2", color: "text-teal-500", activeBg: "bg-teal-50" },
    { href: "/private/patients", label: "Patients", icon: "Stethoscope", color: "text-teal-500", activeBg: "bg-teal-50" },
    { href: "/private/billing", label: "Billing", icon: "BriefcaseMedical", color: "text-teal-500", activeBg: "bg-teal-50" },
  ],
  medical_staff: [
    { href: "/staff", label: "Beds", icon: "BedDouble", color: "text-sky-500", activeBg: "bg-sky-50" },
    { href: "/staff/tasks", label: "Tasks", icon: "ClipboardList", color: "text-sky-500", activeBg: "bg-sky-50" },
    { href: "/staff/history", label: "History", icon: "Clock", color: "text-sky-500", activeBg: "bg-sky-50" },
  ],
  pharmacy: [
    { href: "/pharmacy", label: "Orders", icon: "Pill", color: "text-emerald-500", activeBg: "bg-emerald-50" },
    { href: "/pharmacy/inventory", label: "Inventory", icon: "ScanLine", color: "text-emerald-500", activeBg: "bg-emerald-50" },
    { href: "/pharmacy/alerts", label: "Alerts", icon: "AlertCircle", color: "text-emerald-500", activeBg: "bg-emerald-50" },
  ],
  laboratory: [
    { href: "/lab", label: "Queue", icon: "Microscope", color: "text-violet-600", activeBg: "bg-violet-50" },
    { href: "/lab/samples", label: "Samples", icon: "TestTube2", color: "text-violet-600", activeBg: "bg-violet-50" },
    { href: "/lab/archive", label: "Archive", icon: "Archive", color: "text-violet-600", activeBg: "bg-violet-50" },
  ],
  patient: [
    { href: "/patient-portal", label: "My Health", icon: "Heart", color: "text-indigo-600", activeBg: "bg-indigo-50" },
    { href: "/patient-portal/settings", label: "Settings", icon: "Settings", color: "text-indigo-600", activeBg: "bg-indigo-50" },
  ],
};

// Mobile bottom nav items - limited to 4-5 most important sections per role
export const ROLE_MOBILE_NAV: Record<UserRole, BottomNavItem[]> = {
  admin: [
    { href: "/admin", label: "Security", icon: "Shield", color: "text-slate-900", activeBg: "bg-slate-100", sections: ["/admin"] },
    { href: "/admin/users", label: "Users", icon: "Users", color: "text-slate-900", activeBg: "bg-slate-100", sections: ["/admin/users"] },
    { href: "/admin/settings", label: "Settings", icon: "Settings", color: "text-slate-900", activeBg: "bg-slate-100", sections: ["/admin/settings"] },
  ],
  medecin_etat: [
    { href: "/doctor", label: "Patients", icon: "UserRound", color: "text-blue-600", activeBg: "bg-blue-50", sections: ["/doctor"] },
    { href: "/doctor/appointments", label: "Schedule", icon: "CalendarHeart", color: "text-blue-600", activeBg: "bg-blue-50", sections: ["/doctor/appointments"] },
    { href: "/doctor/reports", label: "Reports", icon: "FileText", color: "text-blue-600", activeBg: "bg-blue-50", sections: ["/doctor/reports"] },
  ],
  private_doctor: [
    { href: "/private", label: "Clinic", icon: "Building2", color: "text-teal-500", activeBg: "bg-teal-50", sections: ["/private"] },
    { href: "/private/patients", label: "Patients", icon: "Stethoscope", color: "text-teal-500", activeBg: "bg-teal-50", sections: ["/private/patients"] },
    { href: "/private/billing", label: "Billing", icon: "BriefcaseMedical", color: "text-teal-500", activeBg: "bg-teal-50", sections: ["/private/billing"] },
  ],
  medical_staff: [
    { href: "/staff", label: "Beds", icon: "BedDouble", color: "text-sky-500", activeBg: "bg-sky-50", sections: ["/staff"] },
    { href: "/staff/tasks", label: "Tasks", icon: "ClipboardList", color: "text-sky-500", activeBg: "bg-sky-50", sections: ["/staff/tasks"] },
    { href: "/staff/history", label: "History", icon: "Clock", color: "text-sky-500", activeBg: "bg-sky-50", sections: ["/staff/history"] },
  ],
  pharmacy: [
    { href: "/pharmacy", label: "Orders", icon: "Pill", color: "text-emerald-500", activeBg: "bg-emerald-50", sections: ["/pharmacy"] },
    { href: "/pharmacy/inventory", label: "Inventory", icon: "ScanLine", color: "text-emerald-500", activeBg: "bg-emerald-50", sections: ["/pharmacy/inventory"] },
    { href: "/pharmacy/alerts", label: "Alerts", icon: "AlertCircle", color: "text-emerald-500", activeBg: "bg-emerald-50", sections: ["/pharmacy/alerts"] },
  ],
  laboratory: [
    { href: "/lab", label: "Queue", icon: "Microscope", color: "text-violet-600", activeBg: "bg-violet-50", sections: ["/lab"] },
    { href: "/lab/samples", label: "Samples", icon: "TestTube2", color: "text-violet-600", activeBg: "bg-violet-50", sections: ["/lab/samples"] },
    { href: "/lab/archive", label: "Archive", icon: "Archive", color: "text-violet-600", activeBg: "bg-violet-50", sections: ["/lab/archive"] },
  ],
  patient: [
    { href: "/patient-portal", label: "My Health", icon: "Heart", color: "text-indigo-600", activeBg: "bg-indigo-50", sections: ["/patient-portal"] },
    { href: "/patient-portal/settings", label: "Settings", icon: "Settings", color: "text-indigo-600", activeBg: "bg-indigo-50", sections: ["/patient-portal/settings"] },
  ],
};

// Role colors for header theming
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-slate-900",
  medecin_etat: "bg-blue-600",
  private_doctor: "bg-teal-500",
  medical_staff: "bg-sky-500",
  pharmacy: "bg-emerald-500",
  laboratory: "bg-violet-600",
  patient: "bg-indigo-600",
};

// Role display titles
export const ROLE_TITLES: Record<UserRole, string> = {
  admin: "Admin Console",
  medecin_etat: "Doctor Portal",
  private_doctor: "Private Practice",
  medical_staff: "Ward Operations",
  pharmacy: "Dispensary",
  laboratory: "Laboratory",
  patient: "Patient Portal",
};

// Role access map - which route prefixes each role can access
export const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin: ["/admin"],
  medecin_etat: ["/doctor"],
  private_doctor: ["/private"],
  medical_staff: ["/staff"],
  pharmacy: ["/pharmacy"],
  laboratory: ["/lab"],
  patient: ["/patient-portal"],
};

/**
 * Get allowed sections for a given role
 */
export function getRoleSections(role: UserRole): SectionLink[] {
  return ROLE_NAVIGATION[role] || [];
}

/**
 * Get allowed mobile nav items for a given role
 */
export function getRoleMobileItems(role: UserRole): BottomNavItem[] {
  return ROLE_MOBILE_NAV[role] || [];
}

/**
 * Check if a role can access a given path
 */
export function canAccessRole(role: UserRole, path: string): boolean {
  const allowedPrefixes = ROLE_ACCESS[role] || [];
  return allowedPrefixes.some((prefix) => path.startsWith(prefix));
}