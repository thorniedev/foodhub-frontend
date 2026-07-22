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
      <div className="container justify-between flex mx-auto max-w-7xl 8 py-8">
        {/* Brand */}
        <div>
          <h4 className="text-xl font-bold text-primary-800 mb-6">គេហទំព័រ</h4>
          <div className="relative w-37.5 h-21.25 mb-6">
            <Image
              src="/Image/logo.png"
              alt="FoodHub logo"
              fill
              className="object-contain object-left"
              sizes="150px"
            />
          </div>
          <p className="text-slate-500  text-[18px]  leading-relaxed max-w-xs">
            ធ្វើឱ្យការជ្រើសរើសមុខម្ហូបកាន់តែងាយស្រួល{" "}
            <br className="lg:block max-lg:hidden" />
            ជាមួយការណែនាំដែលសាកសមនឹងអ្នក
          </p>
        </div>

        {/* Sitemap */}

        <div>
          <h4 className="text-xl font-bold text-primary-800 mb-6">តំណភ្ជាប់</h4>
          <ul className="space-y-4">
            {sitemapLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-slate-500 text-[22px] hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xl font-bold text-primary-800 mb-6">
            ទំនាក់ទំនង
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                href="mailto:foodhub@gmail.com"
                className="flex text-[20px] items-center gap-3 text-slate-500 hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5 shrink-0" strokeWidth={1.8} />
                foodhub@gmail.com
              </Link>
            </li>
            <li>
              <Link
                href="tel:+15550123456"
                className="flex items-center gap-3 text-[20px] text-slate-500 hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5 shrink-0" strokeWidth={1.8} />
                +1 (555) 012-3456
              </Link>
            </li>
            <li className="flex items-center  gap-3 text-[20px] text-slate-500">
              <MapPin className="w-5 h-5 shrink-0" strokeWidth={1.8} />
              PhnomPenh, Combodia
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-bold text-primary-800 mb-6">
            ឧបត្ថម្ភដោយ
          </h4>
          <div className="flex gap-2 gap-15 mb-10">
            <div className="relative w-[195px] h-[75px]">
              <Image
                src="/Image/mptc.png"
                alt="Ministry of Posts and Telecommunications"
                fill
                className="object-contain object-left"
                sizes="195px"
              />
            </div>
            <div className="relative w-[163px] h-[75px]">
              <Image
                src="/Image/cbrd.png"
                alt="CBRD Fund"
                fill
                className="object-contain object-left"
                sizes="163px"
              />
            </div>
          </div>

          <h4 className="text-xl font-bold text-primary-800 mb-6">រៀបចំដោយ</h4>
          <div className="relative w-[208px] h-[75px]">
            <Image
              src="/Image/istad.png"
              alt="ISTAD"
              fill
              className="object-contain object-left"
              sizes="208px"
            />
          </div>
        </div>
      </div>

      {/* Sponsored */}

      <div className="border-t border-slate-200 py-6   text-center">
        <p className="text-slate-400">© 2026 FoodHub | All Rights Reserved</p>
      </div>
    </footer>
  );
}
