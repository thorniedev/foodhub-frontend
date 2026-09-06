"use client";

import {
  LogOut,
} from "lucide-react";

import { logoutAndUnsubscribePush } from "@/lib/push/browser-push";

interface LogOutButtonProps {
  className?: string;
}

export default function LogOutButton({
  className = "",
}: LogOutButtonProps) {
  const handleLogout =
    () => {
      void logoutAndUnsubscribePush();
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