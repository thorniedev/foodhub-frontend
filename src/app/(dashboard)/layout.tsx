import Aside from "@/components/layout/Aside";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        {/* Navbar on top, full width */}
        <DashboardHeader />

        {/* Row below the navbar: Aside + page content */}
        <div className="flex flex-1">
          <Aside />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}