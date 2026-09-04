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
    pollingInterval: 300_000, // ✅ PERFORMANCE FIX: Reduced from 60s to 5min
    skipPollingIfUnfocused: true,
  });

  return (
    <Link
      href={href}
      aria-label="ការជូនដំណឹង"
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-[#136C34] transition-colors hover:bg-accent hover:text-accent-foreground dark:text-emerald-400",
        className,
      )}
    >
      <Bell className="size-5" />

      {unreadCount > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E36914] px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
