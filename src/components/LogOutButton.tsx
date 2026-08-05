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
      className="rounded-xl flex items-center  gap-2 justify-center bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut ? "Signing out..." : "Logout"}{" "}
      <FiLogOut className="text-xl" />
    </button>
  );
}
