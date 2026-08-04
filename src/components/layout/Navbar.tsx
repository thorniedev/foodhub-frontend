"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
import ThemeToggle from "../theme-toggle";

const NAV_LINKS = [
  {
    href: "/",
    label: "ទំព័រដើម",
  },
  {
    href: "/food",
    label: "ម្ហូបអាហារ",
  },
  {
    href: "/about",
    label: "អំពីយើង",
  },
];

function checkActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const navRef = useRef<HTMLElement | null>(null);

  const foundActiveIndex = NAV_LINKS.findIndex((link) =>
    checkActiveRoute(pathname, link.href),
  );

  const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const navbar = navRef.current;

      if (navbar && !navbar.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const handleDesktopTabChange = (index: number) => {
    const selectedLink = NAV_LINKS[index];

    if (!selectedLink) return;

    if (checkActiveRoute(pathname, selectedLink.href)) {
      return;
    }

    router.push(selectedLink.href, {
      scroll: true,
    });
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 z-99 w-full bg-white/80 shadow-xs backdrop-blur-md dark:bg-gray-950/70"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between ">
        <Link href="/" aria-label="ទៅកាន់ទំព័រដើម" className="shrink-0">
          <img
            src="/Image/logo.png"
            alt="FoodHub logo"
            className="block h-[40px] py-1 sm:h-[45px] md:h-[65px]"
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:block">
          <FluidTabs
            activeIndex={activeIndex}
            onActiveIndexChange={handleDesktopTabChange}
          >
            <FluidTabs.List aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <FluidTabs.Tab key={link.href} label={link.label}>
                  <FluidTabs.Label>{link.label}</FluidTabs.Label>
                </FluidTabs.Tab>
              ))}
            </FluidTabs.List>
          </FluidTabs>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center justify-center gap-4 md:flex">
          <ThemeToggle />

          <Link
            href="/register"
            className="rounded-full bg-primary-800 px-4 py-2 text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-primary"
          >
            បង្កើតគណនី
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "បិទម៉ឺនុយ" : "បើកម៉ឺនុយ"}
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-900 transition-colors duration-200 hover:bg-primary-800/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800 dark:text-white md:hidden"
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

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:hidden ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-1 border-t border-black/5 px-3 pb-4 pt-3 dark:border-white/10">
            {NAV_LINKS.map((link, index) => {
              const isActive = checkActiveRoute(pathname, link.href);

              return (
                <li
                  key={link.href}
                  style={{
                    transitionDelay: open ? `${80 + index * 60}ms` : "0ms",
                  }}
                  className={`transition-all duration-300 ease-out motion-reduce:transition-none ${
                    open
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 opacity-0"
                  }`}
                >
                  <Link
                    href={link.href}
                    scroll
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl px-4 py-3 text-[16px] font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-800 text-white"
                        : "text-primary-900 hover:bg-primary-800/10 dark:text-white"
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
                href="/register"
                scroll
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="block rounded-full bg-primary-800 px-4 py-3 text-center text-[16px] font-semibold text-white transition-transform duration-200 active:scale-[0.98] dark:bg-white dark:text-primary"
              >
                បង្កើតគណនី
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}