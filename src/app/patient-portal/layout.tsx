'use client';

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Patient Hub"
      roleColor="bg-blue-500"
      sidebarContent={
        <nav className="space-y-6">
          <div className="space-y-1">
            <SidebarItem href="/patient-portal" icon="Activity" label="Home / Dashboard" activeColor="bg-blue-500" />
            <SidebarItem href="/patient-portal?section=timeline" icon="Clock" label="Health Timeline" activeColor="bg-blue-500" />
          </div>

          <div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Speciality Archive</span>
            <div className="space-y-1">
              <SidebarItem href="/patient-portal?section=speciality&id=cardiology" icon="HeartPulse" label="Cardiology" activeColor="bg-blue-500" />
              <SidebarItem href="/patient-portal?section=speciality&id=ophthalmology" icon="Eye" label="Ophthalmology" activeColor="bg-blue-500" />
              <SidebarItem href="/patient-portal?section=speciality&id=general" icon="Stethoscope" label="General Medicine" activeColor="bg-blue-500" />
            </div>
          </div>

          <div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Document Archive</span>
            <div className="space-y-1">
              <SidebarItem href="/patient-portal?section=lab-results" icon="Beaker" label="Lab Results" activeColor="bg-blue-500" />
              <SidebarItem href="/patient-portal?section=imaging" icon="DownloadCloud" label="Imaging / Radio" activeColor="bg-blue-500" />
              <SidebarItem href="/patient-portal?section=comptes-rendus" icon="ClipboardList" label="Comptes Rendus" activeColor="bg-blue-500" />
            </div>
          </div>
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}