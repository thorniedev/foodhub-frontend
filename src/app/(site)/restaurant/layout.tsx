
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import RestaurantDetailPage from "./[id]/page";


export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* <AOSInit /> */}
      <Navbar />
      {children}
      <footer>
        {/* <RestaurantDetailPage /> */}
        <Footer />
      </footer>
      {/* <SectionModal /> */}
    </>
  );
}