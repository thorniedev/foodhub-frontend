"use client";

import {
  LogOut,
} from "lucide-react";

interface LogOutButtonProps {
  className?: string;
}

export default function LogOutButton({
  className = "",
}: LogOutButtonProps) {
  const handleLogout =
    () => {
      window.location.href =
        "/api/auth/logout";
    };

  return (
    <button
      type="button"
      onClick={
        handleLogout
      }
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut
        size={18}
      />

      <span>
        Logout
      </span>
    </button>
  );
}