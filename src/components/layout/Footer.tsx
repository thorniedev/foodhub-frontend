import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import MarqueeSection from "../about/MarqueeSection";

const quickLinks = [
  { label: "ទំព័រដើម", href: "/" },
  { label: "អំពីយើង", href: "/about" },
  { label: "មុខម្ហូប", href: "/food" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <FaFacebookF className="h-5 w-5" />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: <FaTwitter className="h-5 w-5" />,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: <FaYoutube className="h-5 w-5" />,
  },
];

export default function Footer() {
  return (
    <footer className=" w-full">
      {/* Main footer */}

      <div className="">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_2fr] xl:gap-16">
            {/* Left column */}
            <div>
              <h4 className="text-2xl font-semibold text-slate-800 dark:text-gray-200 ">
                គេហទំព័រ
              </h4>

              <div className="mt-6">
                <div className="relative h-[80px] w-[160px] max-w-full">
                  <Image
                    src="/Image/foodhub-logo.png"
                    alt="FoodHub logo"
                    className="object-contain object-left"
                    width={160}
                    height={80}
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
              </div>

              <p className="mt-6 max-w-md text-lg leading-8  dark:text-gray-300 text-slate-500">
                ផ្តល់ការណែនាំអំពីមុខម្ហូបដែលសមស្រប
                ដោយផ្អែកលើចំណង់ចំណូលចិត្តរបស់អ្នក
              </p>

              <div className="mt-10">
                <h4 className="text-2xl font-semibold text-slate-800 dark:text-gray-200">
                  បណ្តាញសង្គម
                </h4>

                <div className="mt-6 flex items-center gap-4">
                  {socialLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="flex h-12.5 w-12.5 items-center justify-center rounded-full border border-slate-300 bg-white text-[#0E7A33] transition hover:border-[#0E7A33] hover:bg-[#0E7A33] hover:text-white"
                    >
                      {item.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle column */}
            <div>
              <h4 className="text-2xl font-semibold text-slate-800 dark:text-gray-200">
                លីងភ្ជាប់
              </h4>

              <nav className="mt-6 flex flex-col gap-5">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-lg  dark:text-gray-300 text-slate-500 transition hover:text-[#0E7A33]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-10">
                <h4 className="text-2xl font-semibold text-slate-800 dark:text-gray-200">
                  ទំនាក់ទំនង
                </h4>

                <div className="mt-6 space-y-4 text-lg  dark:text-gray-300 text-slate-500">
                  <p>foodhub@gmail.com</p>
                  <p>+(555) 012-3456</p>
                  <p>PhnomPenh , Combodia</p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              <h4 className="text-2xl font-semibold text-slate-800 dark:text-gray-200">
                ឧបត្ថម្ភដោយ
              </h4>

              <div className="mt-6 flex flex-col gap-6">
                {/* long sponsor logo */}
                <div className="relative h-[70px]  sm:min-w-[600px] max-sm:h-[45px]">
                  <Image
                    src="/sponsors.png"
                    alt="Ministry  of Post and Telecommunications"
                    fill
                    className="object-contain block dark:hidden object-left"
                    sizes="(max-width: 768px) 100vw, 389px"
                  />
                  <Image
                    src="/sponsors-dark.png"
                    alt="Ministry  of Post and Telecommunications"
                    fill
                    className="object-contain hidden dark:block object-left "
                    sizes="(max-width: 768px) 100vw, 389px"
                  />
                </div>
              </div>

              <div className="mt-10">
                <h4 className="text-2xl font-semibold text-slate-800 dark:text-gray-200">
                  រៀបចំដោយ
                </h4>

                <div className="mt-6">
                  <div className="relative h-[70px] w-full sm:max-w-[193px] max-sm:h-[45px]">
                    <Image
                      src="/ISTAD-Logo.png"
                      alt="ISTAD"
                      fill
                      className="object-contain block dark:hidden object-left"
                      sizes="193px"
                    />
                    <Image
                      src="/ISTAD-Logo-dark.png"
                      alt="ISTAD"
                      fill
                      className="object-contain hidden dark:block object-left"
                      sizes="193px"
                    />
                  </div>

                  <p className="mt-5 max-sm:text-sm max-w-sm text-lg leading-8  dark:text-gray-300 text-slate-500">
                    Institute of Science and Technology
                    <br />
                    Advanced Development
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* bottom line */}
        </div>
        <div className="mt-10 border-t border-slate-300 py-5">
          <div className="flex flex-col items-center justify-center gap-2 text-center text-base  dark:text-gray-300 text-slate-500 sm:flex-row sm:gap-6">
            <p>© 2026 FoodHub | All Rights Reserved</p>
            {/* <p>© 2026 FoodHub | All Rights Reserved</p> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
