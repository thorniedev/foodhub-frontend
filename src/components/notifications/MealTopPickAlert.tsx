"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { UtensilsCrossed } from "lucide-react";

import {
  useDismissNotificationMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@/app/store/notificationApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { FoodHubNotification } from "@/types/notifications";

const MEAL_REMINDER_TYPE_CODE = "MEAL_REMINDER";
const POLL_INTERVAL_MS = 60_000;

/**
 * Only meal reminders that carry an actual item pick (menuItemId set by the
 * backend once a safety-checked candidate was found for the user's default
 * profile) get the popup. A generic "it's mealtime" reminder with no item
 * still lands in the normal notification list, unchanged.
 */
function hasItemPick(notification: FoodHubNotification): boolean {
  return (
    notification.menuItemId != null &&
    Boolean(notification.imageUrl) &&
    Boolean(notification.actionUrl)
  );
}

export default function MealTopPickAlert() {
  const router = useRouter();
  const seenUuidsRef = useRef<Set<string>>(new Set());
  const [openUuid, setOpenUuid] = useState<string | null>(null);

  const { data } = useGetNotificationsQuery(
    { isRead: false, typeCode: MEAL_REMINDER_TYPE_CODE, size: 5 },
    { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true },
  );

  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [dismissNotification] = useDismissNotificationMutation();

  useEffect(() => {
    if (openUuid) {
      return;
    }

    const candidate = data?.data.find(
      (notification) =>
        hasItemPick(notification) &&
        !seenUuidsRef.current.has(notification.uuid),
    );

    if (candidate) {
      setOpenUuid(candidate.uuid);
    }
  }, [data, openUuid]);

  const activeNotification = data?.data.find(
    (notification) => notification.uuid === openUuid,
  );

  const closeAndSuppress = (uuid: string) => {
    seenUuidsRef.current.add(uuid);
    setOpenUuid(null);
  };

  const handleDismiss = () => {
    if (!activeNotification) return;
    const uuid = activeNotification.uuid;
    closeAndSuppress(uuid);
    void dismissNotification(uuid);
  };

  const handleView = () => {
    if (!activeNotification) return;
    const uuid = activeNotification.uuid;
    const href = activeNotification.actionUrl;
    closeAndSuppress(uuid);
    void markNotificationRead(uuid);
    if (href) {
      router.push(href);
    }
  };

  return (
    <Dialog
      open={Boolean(activeNotification)}
      onOpenChange={(open) => {
        if (!open) handleDismiss();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        {activeNotification && (
          <>
            <div className="grid grid-cols-[1fr_96px] items-center gap-4 sm:grid-cols-[1fr_128px]">
              <DialogHeader className="min-w-0">
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  {activeNotification.typeName || "អាហារ"}
                </span>
                <DialogTitle className="mt-1">
                  {activeNotification.title}
                </DialogTitle>
                <DialogDescription>
                  {activeNotification.body}
                </DialogDescription>
              </DialogHeader>

              {/* Recommended item image, right-aligned next to the text. */}
              <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={activeNotification.imageUrl ?? ""}
                  alt={activeNotification.title}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                លើកលែង
              </button>
              <button
                type="button"
                onClick={handleView}
                className="rounded-full bg-primary-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                មើលមុខម្ហូបនេះ
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
