"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import FluidTabs from "../../../components/animata/tabs/fluid-tabs";

const NAV_LINKS = [
  { href: "/", label: "ទំព័រដើម" },
  { href: "/food", label: "ម្ហូបអាហារ" },
  { href: "/about", label: "អំពីយេីង" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);

  const activeIndex = Math.max(
    0,
    NAV_LINKS.findIndex((link) => link.href === pathname),
  );

  // close the menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape, outside click, and resizing up to desktop all close the menu
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <nav
      ref={navRef}
      className="bg-white/2 dark:bg-gray-600/5 w-full fixed top-0 z-99 backdrop-blur-xs shadow-xs"
    >
      <div className="flex xl:mx-auto xl:w-7xl lg:justify-between max-lg:justify-around max-md:justify-between max-md:gap-1.5 max-md:px-3 items-center">
        <Link href="/" onClick={() => setOpen(false)}>
          <img
            className="py-1 md:h-[65px] block dark:hidden max-md:h-[40px] max-sm:h-[35px]"
            src="/Image/logo.png"
            alt="logo"
          />
        </Link>

        {/* ---------- desktop tabs (unchanged, just hidden on phones) ---------- */}
        <div className="max-md:hidden">
          <FluidTabs defaultActiveIndex={activeIndex}>
            <FluidTabs.List aria-label="Accounts">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <FluidTabs.Tab>
                    <FluidTabs.Label>{link.label}</FluidTabs.Label>
                  </FluidTabs.Tab>
                </Link>
              ))}
            </FluidTabs.List>
          </FluidTabs>
        </div>

        <div className="flex md:gap-4 max-md:gap-0.5 justify-center max-md:hidden items-center">
          <Link
            href="/dashboard"
            className="md:px-4 dark:text-primary text-secondary md:py-2 dark:bg-white max-md:w-[80px] max-sm:w-fit max-md:px-2 max-md:py-1.5 text-white bg-primary-800 rounded-full"
          >
            បង្កេីតគណនី
          </Link>
        </div>

        {/* ---------- hamburger (phones / small tablets only) ---------- */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "បិទម៉ឺនុយ" : "បើកម៉ឺនុយ"}
          className="md:hidden relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-900 dark:text-white transition-colors duration-200 hover:bg-primary-800/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
        >
          <span
            className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out motion-reduce:transition-none ${
              open ? "rotate-45" : "-translate-y-[6px]"
            }`}
          />
          <span
            className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-200 ease-out motion-reduce:transition-none ${
              open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
            }`}
          />
          <span
            className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out motion-reduce:transition-none ${
              open ? "-rotate-45" : "translate-y-[6px]"
            }`}
          />
        </button>
      </div>

      {/* ---------- dropdown panel ---------- */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`md:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-1 border-t border-black/5 dark:border-white/10 px-3 pt-3 pb-4">
            {NAV_LINKS.map((link, i) => {
              const isActive = pathname === link.href;
              return (
                <li
                  key={link.href}
                  style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
                  className={`transition-all duration-300 ease-out motion-reduce:transition-none ${
                    open
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 opacity-0"
                  }`}
                >
                  <Link
                    href={link.href}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl px-4 py-3 transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-800 text-white"
                        : "text-primary-900 dark:text-white hover:bg-primary-800/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            <li
              style={{
                transitionDelay: open
                  ? `${80 + NAV_LINKS.length * 60}ms`
                  : "0ms",
              }}
              className={`mt-2 transition-all duration-300 ease-out motion-reduce:transition-none ${
                open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              }`}
            >
              <Link
                href="/login"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="block rounded-full bg-primary-800 px-4 py-3 text-center text-white dark:bg-white dark:text-primary transition-transform duration-200 active:scale-[0.98]"
              >
                បង្កេីតគណនី
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
