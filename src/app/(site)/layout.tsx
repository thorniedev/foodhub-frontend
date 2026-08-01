import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { DrawCircleText } from "@/components/ui/DrawCircleText";
import "leaflet/dist/leaflet.css";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* <AOSInit /> */}
      <Navbar />
      {children}
      <footer>
        <DrawCircleText />
        <Footer />
      </footer>
    </>
  );
}
