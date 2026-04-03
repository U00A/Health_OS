import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";
import { Pill, ScanLine, AlertCircle } from "lucide-react";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Dispensary"
      roleColor="bg-emerald-500"
      sidebarContent={
        <nav className="space-y-1">
          <SidebarItem 
            href="/pharmacy" 
            icon={Pill} 
            label="Pending Orders" 
            activeColor="bg-emerald-500" 
          />
          <SidebarItem 
            href="/pharmacy/inventory" 
            icon={ScanLine} 
            label="Inventory Scan" 
            activeColor="bg-emerald-500" 
          />
          <SidebarItem 
            href="/pharmacy/alerts" 
            icon={AlertCircle} 
            label="Interactions" 
            activeColor="bg-emerald-500" 
          />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}
