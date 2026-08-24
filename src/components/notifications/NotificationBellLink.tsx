"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { useGetUnreadCountQuery } from "@/app/store/notificationApi";
import { cn } from "@/lib/utils";

interface NotificationBellLinkProps {
  href?: string;
  className?: string;
}

export default function NotificationBellLink({
  href = "/notifications",
  className,
}: NotificationBellLinkProps) {
  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
  });

  return (
    <Link
      href={href}
      aria-label="ការជូនដំណឹង"
      className={cn(
        "relative inline-flex items-center justify-center rounded-full p-1.5 text-[#136C34] transition hover:bg-emerald-50",
        className,
      )}
    >
      <Bell className="h-6 w-6" />

      {unreadCount > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E36914] px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
