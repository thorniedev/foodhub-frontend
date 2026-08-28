"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaYoutube, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const quickLinks = [
  { label: "ទំព័រដើម", href: "/" },
  { label: "ម្ហូបអាហារ", href: "/food-page" },
  { label: "អំពីយើង", href: "/about" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <FaFacebookF className="h-4 w-4" />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: <FaTwitter className="h-4 w-4" />,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: <FaYoutube className="h-4 w-4" />,
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950">
      {/* Main footer container */}
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:gap-10">
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col">
            <Link href="/" aria-label="ទៅកាន់ទំព័រដើម" className="inline-block shrink-0">
              <div className="relative h-[48px] sm:h-[54px] w-[180px]">
                <Image
                  src="/Image/foodHub-logo.png"
                  alt="Mhoubahar FoodHub logo"
                  fill
                  sizes="180px"
                  className="object-contain object-left block dark:hidden"
                  priority
                />
                <Image
                  src="/Image/foodHub-logo-dark.png"
                  alt="Mhoubahar FoodHub logo"
                  fill
                  sizes="180px"
                  className="object-contain object-left hidden dark:block"
                  priority
                />
              </div>
            </Link>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
              ផ្តល់ការណែនាំអំពីមុខម្ហូបដែលសមស្រប ដោយផ្អែកលើចំណង់ចំណូលចិត្តរបស់អ្នក
            </p>

            <div className="mt-5">
              <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                បណ្តាញសង្គម
              </h5>
              <div className="mt-3 flex items-center gap-3">
                {socialLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#0E7A33] shadow-2xs transition hover:border-[#0E7A33] hover:bg-[#0E7A33] hover:text-white dark:border-slate-800 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              លីងភ្ជាប់
            </h4>
            <nav className="mt-4 flex flex-col space-y-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm sm:text-base text-slate-600 transition hover:text-[#0E7A33] dark:text-slate-400 dark:hover:text-emerald-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              ទំនាក់ទំនង
            </h4>
            <div className="mt-4 space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <FaEnvelope className="h-4 w-4 shrink-0 text-[#0E7A33] dark:text-emerald-400" />
                <a
                  href="mailto:foodhub@gmail.com"
                  className="transition hover:text-[#0E7A33] dark:hover:text-emerald-400"
                >
                  foodhub@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FaPhoneAlt className="h-4 w-4 shrink-0 text-[#0E7A33] dark:text-emerald-400" />
                <a
                  href="tel:+5550123456"
                  className="transition hover:text-[#0E7A33] dark:hover:text-emerald-400"
                >
                  +(555) 012-3456
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="mt-1 h-4 w-4 shrink-0 text-[#0E7A33] dark:text-emerald-400" />
                <span>រាជធានីភ្នំពេញ, ប្រទេសកម្ពុជា</span>
              </div>
            </div>
          </div>

          {/* Column 4: Sponsors & Organizers */}
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                ឧបត្ថម្ភដោយ
              </h4>
              <div className="relative mt-3 h-[45px] sm:h-[50px] w-full max-w-[260px]">
                <Image
                  src="/sponsors.png"
                  alt="Ministry of Post and Telecommunications"
                  fill
                  className="object-contain object-left block dark:hidden"
                  sizes="260px"
                />
                <Image
                  src="/sponsors-dark.png"
                  alt="Ministry of Post and Telecommunications"
                  fill
                  className="object-contain object-left hidden dark:block"
                  sizes="260px"
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                រៀបចំដោយ
              </h4>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-[45px] w-[120px] shrink-0">
                  <Image
                    src="/ISTAD-Logo.png"
                    alt="ISTAD"
                    fill
                    className="object-contain object-left block dark:hidden"
                    sizes="120px"
                  />
                  <Image
                    src="/ISTAD-Logo-dark.png"
                    alt="ISTAD"
                    fill
                    className="object-contain object-left hidden dark:block"
                    sizes="120px"
                  />
                </div>
                <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
                  Institute of Science and Technology Advanced Development
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 border-t border-slate-200/80 pt-5 text-center text-xs sm:text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:mt-10">
          <p>© 2026 FoodHub | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
