import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Ward Operations"
      roleColor="bg-sky-500"
      useGlobalNav
      sidebarContent={
        <nav className="space-y-1">
          <SidebarItem 
            href="/staff" 
            icon="BedDouble" 
            label="Bed Grid" 
            activeColor="bg-sky-500" 
          />
          <SidebarItem 
            href="/staff/tasks" 
            icon="ClipboardList" 
            label="Shift Tasks" 
            activeColor="bg-sky-500" 
          />
          <SidebarItem 
            href="/staff/history" 
            icon="Clock" 
            label="Recent Activity" 
            activeColor="bg-sky-500" 
          />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}
