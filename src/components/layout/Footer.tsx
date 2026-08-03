import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
};

const sitemapLinks: FooterLink[] = [
  { label: "ទំព័រដើម", href: "/" },
  { label: "អំពីយើង", href: "/about" },
  { label: "មុខអាហារ", href: "/menu" },
];

export default function Footer() {
  return (
    <footer className="w-full">
      <div
        className="
          mx-auto max-w-7xl
          px-5 sm:px-6 lg:px-0
          py-10 lg:py-14
          grid gap-10
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-[1.1fr_0.7fr_1fr_1.5fr]
        "
      >
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h4 className="text-lg lg:text-xl font-bold text-primary-800 dark:text-emerald-400 mb-4 lg:mb-6">
            គេហទំព័រ
          </h4>
          <div className="relative w-[130px] h-[74px] lg:w-[150px] lg:h-[85px] mb-4 lg:mb-6">
            <Image
              src="/Image/logo.png"
              alt="FoodHub logo"
              fill
              className="object-contain object-left"
              sizes="(max-width: 1024px) 130px, 150px"
            />
          </div>
          <p className=" dark:text-gray-200 text-slate-500 text-base lg:text-[18px] leading-relaxed max-w-xs">
            ធ្វើឱ្យការជ្រើសរើសមុខម្ហូបកាន់តែងាយស្រួល{" "}
            <br className="hidden lg:block" />
            ជាមួយការណែនាំដែលសាកសមនឹងអ្នក
          </p>
        </div>

        {/* Sitemap */}
        <div>
          <h4 className="text-lg lg:text-xl font-bold text-primary-800 dark:text-emerald-400 mb-4 lg:mb-6">
            តំណភ្ជាប់
          </h4>
          <ul className="space-y-3 lg:space-y-4">
            {sitemapLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className=" dark:text-gray-200 text-slate-500 text-base sm:text-lg lg:text-[22px] hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg lg:text-xl font-bold text-primary-800 dark:text-emerald-400 mb-4 lg:mb-6">
            ទំនាក់ទំនង
          </h4>
          <ul className="space-y-3 lg:space-y-4 text-base lg:text-[20px]">
            <li>
              <Link
                href="mailto:foodhub@gmail.com"
                className="flex items-center gap-3  dark:text-gray-200 text-slate-500 hover:text-primary transition-colors break-all"
              >
                <Mail className="w-5 h-5 shrink-0" strokeWidth={1.8} />
                foodhub@gmail.com
              </Link>
            </li>
            <li>
              <Link
                href="tel:+15550123456"
                className="flex items-center gap-3  dark:text-gray-200 text-slate-500 hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5 shrink-0" strokeWidth={1.8} />
                +1 (555) 012-3456
              </Link>
            </li>
            <li className="flex items-center gap-3  dark:text-gray-200 text-slate-500">
              <MapPin className="w-5 h-5 shrink-0" strokeWidth={1.8} />
              Phnom Penh, Cambodia
            </li>
          </ul>
        </div>

        {/* Sponsors */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h4 className="text-lg lg:text-xl font-bold text-primary-800 dark:text-emerald-400 mb-4 lg:mb-6">
            ឧបត្ថម្ភដោយ
          </h4>
          <div className="flex flex-wrap items-center gap-6 lg:gap-10 mb-8 lg:mb-10">
            <div className="relative h-[56px] w-[145px] sm:h-[64px] sm:w-[168px] lg:h-[75px] lg:w-[195px]">
              <Image
                src="/Image/mptc.png"
                alt="Ministry of Posts and Telecommunications"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 145px, (max-width: 1024px) 168px, 195px"
              />
            </div>
            <div className="relative h-[56px] w-[122px] sm:h-[64px] sm:w-[140px] lg:h-[75px] lg:w-[163px]">
              <Image
                src="/Image/cbrd.png"
                alt="CBRD Fund"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 122px, (max-width: 1024px) 140px, 163px"
              />
            </div>
          </div>

          <h4 className="text-lg lg:text-xl font-bold text-primary-800 dark:text-emerald-400 mb-4 lg:mb-6">
            រៀបចំដោយ
          </h4>
          <div className="relative h-[56px] w-[155px] sm:h-[64px] sm:w-[178px] lg:h-[75px] lg:w-[208px]">
            <Image
              src="/Image/istad.png"
              alt="ISTAD"
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 155px, (max-width: 1024px) 178px, 208px"
            />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200 px-5 py-5 lg:py-6 text-center">
        <p className="text-slate-400  text-sm lg:text-base">
          © 2026 FoodHub | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
