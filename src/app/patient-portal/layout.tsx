'use client';

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Patient Hub"
      roleColor="bg-blue-500"
      sidebarContent={
        <nav className="space-y-1">
          <SidebarItem
            href="/patient-portal"
            icon="Activity"
            label="Live Vitals Dashboard"
            activeColor="bg-blue-500"
          />
          <SidebarItem
            href="/patient-portal?section=history"
            icon="Clock"
            label="Health Timeline"
            activeColor="bg-blue-500"
          />
          <SidebarItem
            href="/patient-portal?section=settings"
            icon="Settings"
            label="Settings"
            activeColor="bg-blue-500"
          />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}