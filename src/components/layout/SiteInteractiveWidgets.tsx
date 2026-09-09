"use client";

import dynamic from "next/dynamic";

const Model = dynamic(() => import("@/components/home/features/Model"), {
  ssr: false,
});

const NotificationAlertPopup = dynamic(
  () => import("@/components/notifications/NotificationAlertPopup"),
  { ssr: false },
);

const NotificationPermissionModal = dynamic(
  () => import("@/components/notifications/NotificationPermissionModal"),
  { ssr: false },
);

export default function SiteInteractiveWidgets() {
  return (
    <>
      <Model />
      <NotificationAlertPopup />
      <NotificationPermissionModal />
    </>
  );
}
