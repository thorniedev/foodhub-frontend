import Aside from "@/components/layout/Aside";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Model from "@/components/home/features/Model";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 relative pb-[90px] md:pb-0">
        {/* Sidebar includes logo at the top */}
        <Aside />

        {/* Right side */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header only belongs to content area */}
          <DashboardHeader />

          <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50">
            {children}
          </main>
        </div>
      </div>
      
      <MobileBottomNav />
      <Model />
    </SidebarProvider>
  );
}

// import Aside from "@/components/layout/Aside";
// import DashboardHeader from "@/components/dashboard/DashboardHeader";
// import { SidebarProvider } from "@/components/layout/SidebarContext";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen flex-col">
//         {/* Navbar on top, full width */}
//         <DashboardHeader />

//         {/* Row below the navbar: Aside + page content */}
//         <div className="flex flex-1">
//           <Aside />
//           <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }
