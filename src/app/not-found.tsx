"use client";

import Link from "next/link";
import TrueFocus from "@/components/ui/TrueFocus";
export default function NotFoundPage() {
  return (
    <div className="h-screen bg-background dark:bg-gray-950  md:gap-8 flex-col w-full flex items-center justify-center">
      <img
        className="w-[350px] block dark:hidden"
        src="/Image/Logo.png"
        alt="L0go"
      />{" "}
      {/* <img className="w-[350px] hidden dark:block" src={LogoDark} alt="L0go" /> */}
      <div className="flex py-4 dark:bg-white px-10 rounded-full  flex-col items-center ">
        <h2 className="font-semibold text-primary-800 ">404 - Page </h2>
        <TrueFocus
          sentence="Not Found"
          manualMode={false}
          blurAmount={5}
          borderColor="#fdb507"
          animationDuration={0.5}
          pauseBetweenAnimations={1}
        />
      </div>
      <p className="text-xl text-center py-2.5 dark:text-cool-sky text-text-description">
        Oops! The page you’re looking for isn’t available.
      </p>
      <Link
        className="bg-primary text-white dark:bg-primary dark:bg-white dark:text-primary px-5  py-2.5 rounded-full  "
        href="/"
      >
        {" "}
        Back to Home{" "}
      </Link>
    </div>
  );
}
