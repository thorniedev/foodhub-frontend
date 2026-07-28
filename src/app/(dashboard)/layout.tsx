// import Aside from "@/app/layout/Aside";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex">
//       <Aside />
//       <div className="flex-1 overflow-y-auto">{children}</div>
//     </div>
//   );
// }

// app/dashboard/layout.tsx

// import Aside from "@/app/layout/Aside"; // adjust path to your actual file

// export default function DashboardLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <div className="flex min-h-screen">
//       <Aside />
//       <main className=" w-64 flex-1 overflow-y-auto">{children}</main>
//     </div>
//   );
// }

// app/dashboard/layout.tsx
// import Aside from "@/components/layout/Aside";

// export default function DashboardLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <section>
//       <div className="">
//         <p className="w-full  bg-black">navbar</p>
//         <Aside />
//         <main className="ml-64 flex-1 overflow-y-auto">{children}</main>
//       </div>
//     </section>
//   );
// }

import Navbar from "@/components/layout/Navbar";
import Aside from "@/components/layout/Aside";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar on top, full width */}
      <DashboardHeader/>

      {/* Row below the navbar: Aside + page content */}
      <div className="flex flex-1">
        <Aside />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
