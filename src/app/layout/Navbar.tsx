"use client";
import Link from "next/link";
import React from "react";
import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
import { Landmark } from "lucide-react";
export default function Navbar() {
  console.log(FluidTabs);
  console.log(FluidTabs.List);
  console.log(FluidTabs.Tab);
  console.log(FluidTabs.Icon);
  console.log(FluidTabs.Label);
  return (
    <div>
      {" "}
      <nav className="bg-white/2 dark:bg-gray-600/5 dark:backdrop:lg  w-full fixed top-0  z-99 backdrop-blur-xs   shadow-xs">
        <div
          className=" 
      flex xl:mx-auto xl:w-7xl lg:justify-between max-lg:justify-around max-md:gap-1.5  max-md:px-1  items-center"
        >
          <Link href="/">
            <img
              className=" py-1 md:h-[65px] block dark:hidden max-md:h-[40px]  max-sm:h-[35px]"
              src="/Image/logo.png"
              alt="logo"
            />{" "}
          </Link>
          <div>
            <FluidTabs defaultActiveIndex={0}>
              <FluidTabs.List aria-label="Accounts">
                <FluidTabs.Tab>
                  <FluidTabs.Label>អំពីយេីង</FluidTabs.Label>
                </FluidTabs.Tab>{" "}
                <FluidTabs.Tab>
                  <FluidTabs.Label>ម្ហូបអាហារ</FluidTabs.Label>
                </FluidTabs.Tab>
                {/* <FluidTabs.Tab label="Settings">
                  <FluidTabs.Icon>
                    <Landmark />
                  </FluidTabs.Icon>
                </FluidTabs.Tab> */}
              </FluidTabs.List>
            </FluidTabs>
          </div>
          <div className="flex md:gap-4 max-md:gap-0.5 justify-center max-md:hidden items-center">
            {" "}
            <Link
              href=""
              className="md:px-4 dark:text-primary text-secondary md:py-2 dark:bg-white max-md:w-[80px] max-sm:w-fit max-md:px-2 max-md:py-1.5 text-white bg-primary-800 rounded-full"
            >
              បង្កេីតគណនី
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
