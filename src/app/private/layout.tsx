import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Private Practice"
      roleColor="bg-teal-500"
      sidebarContent={
        <nav className="space-y-1">
          <SidebarItem 
            href="/private" 
            icon="Building2" 
            label="My Clinic" 
            activeColor="bg-teal-500" 
          />
          <SidebarItem 
            href="/private/patients" 
            icon="Stethoscope" 
            label="Private Patients" 
            activeColor="bg-teal-500" 
          />
          <SidebarItem 
            href="/private/billing" 
            icon="BriefcaseMedical" 
            label="Billing" 
            activeColor="bg-teal-500" 
          />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}
