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
          <SidebarItem href="/patient-portal" icon="Activity" label="Vitals Dashboard" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=timeline" icon="Clock" label="Health Timeline" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=lab-results" icon="Beaker" label="Lab Results" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=imaging" icon="DownloadCloud" label="Imaging / Radio" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=comptes-rendus" icon="ClipboardList" label="Comptes Rendus" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=medications" icon="Pill" label="Medications" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=doctors" icon="Users" label="Doctors" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=appointments" icon="Calendar" label="Appointments" activeColor="bg-blue-500" />
          <SidebarItem href="/patient-portal?section=messages" icon="MessageSquare" label="Messages" activeColor="bg-blue-500" />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}