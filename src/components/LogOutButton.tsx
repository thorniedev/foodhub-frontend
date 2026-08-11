"use client";

import { useState } from "react";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    window.location.assign("/api/auth/logout");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded-xl flex items-center  gap-2 justify-center bg-red-400/5 border border-gray-100 shadow-2xs  px-5 py-3   cursor-pointer hover:bg-red-300/30 font-semibold text-red-500 transition  disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut ? "Signing out..." : "Logout"}
      <FiLogOut className="text-xl" />
    </button>
  );
}
