import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";
import { Microscope, TestTube2, Archive } from "lucide-react";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Laboratory Queue"
      roleColor="bg-violet-600"
      sidebarContent={
        <nav className="space-y-1">
          <SidebarItem 
            href="/lab" 
            icon={Microscope} 
            label="Active Queue" 
            activeColor="bg-violet-600" 
          />
          <SidebarItem 
            href="/lab/samples" 
            icon={TestTube2} 
            label="Sample Tracking" 
            activeColor="bg-violet-600" 
          />
          <SidebarItem 
            href="/lab/archive" 
            icon={Archive} 
            label="Results Archive" 
            activeColor="bg-violet-600" 
          />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}
