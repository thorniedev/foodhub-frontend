import MarqueeSection from "@/components/about/MarqueeSection";
import Model from "@/components/home/features/Model";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NotificationAlertPopup from "@/components/notifications/NotificationAlertPopup";
import { DrawCircleText } from "@/components/ui/DrawCircleText";
import "leaflet/dist/leaflet.css";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        max-w-full
        flex-col
        overflow-x-clip

        pb-[90px]
        md:pb-0
      "
    >
      <Navbar />

      <main className="w-full max-w-full flex-1 overflow-x-clip">
        {children}
      </main>

      <footer className="w-full max-w-full overflow-x-clip">
        <MarqueeSection />
        <DrawCircleText />
        <Footer />
      </footer>

      {/* Keep AI and mobile bottom nav outside main content */}
      <MobileBottomNav />
      <Model />
      <NotificationAlertPopup />
    </div>
  );
}

// import MarqueeSection from "@/components/about/MarqueeSection";
// import Model from "@/components/home/features/Model";
// import Footer from "@/components/layout/Footer";
// import Navbar from "@/components/layout/Navbar";
// import { DrawCircleText } from "@/components/ui/DrawCircleText";
// import "leaflet/dist/leaflet.css";

// export default function SiteLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip">
//       {/* <AOSInit /> */}
//       <Navbar />
//       <main className="w-full max-w-full flex-1 overflow-x-clip">
//         {children}
//       </main>
//       <footer className="w-full max-w-full overflow-x-clip">
//         <MarqueeSection />
//         <DrawCircleText />
//         <Footer />
//       </footer>
//       <Model />
//     </div>
//   );
// }
