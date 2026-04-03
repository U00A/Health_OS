import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Doctor Portal"
      roleColor="bg-blue-600"
      sidebarContent={
        <nav className="space-y-1">
          <SidebarItem 
            href="/doctor" 
            icon="UserRound" 
            label="My Patients" 
            activeColor="bg-blue-600" 
          />
          <SidebarItem 
            href="/doctor/appointments" 
            icon="CalendarHeart" 
            label="Schedule" 
            activeColor="bg-blue-600" 
          />
          <SidebarItem 
            href="/doctor/reports" 
            icon="FileText" 
            label="Clinical Reports" 
            activeColor="bg-blue-600" 
          />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}