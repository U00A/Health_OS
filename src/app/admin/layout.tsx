import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarItem } from "@/components/dashboard/SidebarItem";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      roleTitle="Admin Console"
      roleColor="bg-slate-900"
      useGlobalNav
      sidebarContent={
        <nav className="space-y-1">
          <SidebarItem 
            href="/admin" 
            icon="Shield" 
            label="Security & Access" 
            activeColor="bg-slate-900" 
          />
          <SidebarItem 
            href="/admin/users" 
            icon="Users" 
            label="User Management" 
            activeColor="bg-slate-900" 
          />
          <SidebarItem 
            href="/admin/settings" 
            icon="Settings" 
            label="System Settings" 
            activeColor="bg-slate-900" 
          />
        </nav>
      }
    >
      {children}
    </DashboardShell>
  );
}
