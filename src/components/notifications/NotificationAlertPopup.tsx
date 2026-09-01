"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { MapPin, UtensilsCrossed } from "lucide-react";

import {
  useDismissNotificationMutation,
  useGetNotificationPreferencesQuery,
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

const POLL_INTERVAL_MS = 60_000;
const IN_APP_CHANNEL = "IN_APP";

/**
 * Notification types time-sensitive enough to proactively pop this alert
 * instead of sitting passively in the bell/list — the recommended item or
 * nearby store may be gone by the time the user happens to open the bell.
 * Kept in sync with POPUP_ALERT_TYPE_CODES in NotificationAlertSettings.
 */
const ALERT_TYPE_CODES = new Set([
  "MEAL_REMINDER",
  "NEARBY_STORE_RECOMMENDATION",
]);

function getAlertIcon(typeCode: string | null) {
  return typeCode === "NEARBY_STORE_RECOMMENDATION" ? MapPin : UtensilsCrossed;
}

/**
 * Only notifications that carry an actual item pick (menuItemId set by the
 * backend once a safety-checked candidate was found) get the popup. A
 * generic reminder with no item still lands in the normal notification
 * list, unchanged.
 */
function hasItemPick(notification: FoodHubNotification): boolean {
  return (
    notification.menuItemId != null &&
    Boolean(notification.imageUrl) &&
    Boolean(notification.actionUrl)
  );
}

export default function NotificationAlertPopup() {
  const router = useRouter();
  const seenUuidsRef = useRef<Set<string>>(new Set());
  const [openUuid, setOpenUuid] = useState<string | null>(null);

  const { data } = useGetNotificationsQuery(
    { isRead: false, size: 10 },
    { pollingInterval: POLL_INTERVAL_MS, skipPollingIfUnfocused: true },
  );

  const { data: preferences } = useGetNotificationPreferencesQuery();

  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [dismissNotification] = useDismissNotificationMutation();

  // A user who disabled a type's IN_APP preference (see /dashboard/settings)
  // should never have it pop, even if it's on the alert-worthy list above.
  const disabledTypeCodes = useMemo(() => {
    return new Set(
      (preferences ?? [])
        .filter(
          (preference) =>
            preference.channelType === IN_APP_CHANNEL && !preference.isEnabled,
        )
        .map((preference) => preference.typeCode),
    );
  }, [preferences]);

  useEffect(() => {
    if (openUuid) {
      return;
    }

    const candidate = data?.data.find(
      (notification) =>
        notification.typeCode != null &&
        ALERT_TYPE_CODES.has(notification.typeCode) &&
        !disabledTypeCodes.has(notification.typeCode) &&
        hasItemPick(notification) &&
        !seenUuidsRef.current.has(notification.uuid),
    );

    if (candidate) {
      setOpenUuid(candidate.uuid);
    }
  }, [data, disabledTypeCodes, openUuid]);

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

  const AlertIcon = getAlertIcon(activeNotification?.typeCode ?? null);

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
                  <AlertIcon className="h-3.5 w-3.5" />
                  {activeNotification.typeName || "ការជូនដំណឹង"}
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
                មើលលម្អិត
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
