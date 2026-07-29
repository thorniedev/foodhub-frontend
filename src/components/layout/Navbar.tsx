"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
import { ThemeToggle } from "../theme-toggle";

import UserProfileDropdown from "../dashboard/family-profile/UserProfileDropdown";

import type { FamilyMember } from "@/types/family-profile";
import { useGetProfilesQuery } from "@/redux/api/userApi";

const NAV_LINKS = [
  { href: "/", label: "ទំព័រដើម" },
  { href: "/food", label: "ម្ហូបអាហារ" },
  { href: "/about", label: "អំពីយេីង" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const navRef = useRef<HTMLElement | null>(null);

  // ==========================
  // GET PROFILE DATA
  // ==========================

  const { data: profiles = [], isLoading } = useGetProfilesQuery();

  // Current selected profile

  const [activeProfile, setActiveProfile] = useState<FamilyMember | undefined>(
    undefined,
  );

  // set default profile after API loaded

  useEffect(() => {
    if (profiles.length && !activeProfile) {
      const defaultProfile =
        profiles.find((profile) => profile.isActive) ?? profiles[0];

      setActiveProfile(defaultProfile);
    }
  }, [profiles, activeProfile]);

  const activeIndex = Math.max(
    0,
    NAV_LINKS.findIndex((link) => link.href === pathname),
  );

  // close menu route change

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // outside click / escape

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);

      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <nav
      ref={navRef}
      className="
      bg-white/20
      dark:bg-gray-600/5
      w-full
      fixed
      top-0
      z-50
      backdrop-blur-xs
      shadow-xs
      "
    >
      <div
        className="
        flex
        xl:mx-auto
        xl:w-7xl
        lg:justify-between
        max-lg:justify-around
        max-md:justify-between
        max-md:px-3
        items-center
        "
      >
        {/* LOGO */}

        <Link href="/" onClick={() => setOpen(false)}>
          <img
            className="
            py-1
            md:h-[65px]
            block
            dark:hidden
            max-md:h-[40px]
            max-sm:h-[35px]
            "
            src="/Image/logo.png"
            alt="logo"
          />
        </Link>

        {/* DESKTOP NAV */}

        <div className="max-md:hidden">
          <FluidTabs defaultActiveIndex={activeIndex}>
            <FluidTabs.List aria-label="Navigation">
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

        {/* RIGHT SIDE */}

        <div
          className="
          flex
          md:gap-4
          max-md:hidden
          items-center
          "
        >
          {activeProfile && profiles.length > 0 && (
            <UserProfileDropdown
              members={profiles}
              activeMember={activeProfile}
              onChangeProfile={(member) => {
                setActiveProfile(member);
              }}
            />
          )}

          <ThemeToggle />

          <Link
            href="/dashboard"
            className="
            md:px-4
            md:py-2
            text-white
            bg-primary-800
            rounded-full
            "
          >
            បង្កើតគណនី
          </Link>
        </div>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="
          md:hidden
          relative
          grid
          h-10
          w-10
          place-items-center
          "
        >
          <span
            className={`
            absolute
            h-[2px]
            w-5
            bg-current
            ${open ? "rotate-45" : "-translate-y-2"}
            `}
          />

          <span
            className={`
            absolute
            h-[2px]
            w-5
            bg-current
            ${open ? "opacity-0" : "opacity-100"}
            `}
          />

          <span
            className={`
            absolute
            h-[2px]
            w-5
            bg-current
            ${open ? "-rotate-45" : "translate-y-2"}
            `}
          />
        </button>
      </div>
    </nav>
  );
}
