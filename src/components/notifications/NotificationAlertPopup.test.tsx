import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const {
  pushMock,
  markReadMock,
  dismissMock,
  getNotificationsQueryMock,
  getNotificationPreferencesQueryMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  markReadMock: vi.fn(),
  dismissMock: vi.fn(),
  getNotificationsQueryMock: vi.fn(),
  getNotificationPreferencesQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/store/notificationApi", () => ({
  useGetNotificationsQuery: getNotificationsQueryMock,
  useGetNotificationPreferencesQuery: getNotificationPreferencesQueryMock,
  useMarkNotificationReadMutation: () => [markReadMock, {}],
  useDismissNotificationMutation: () => [dismissMock, {}],
}));

import NotificationAlertPopup from "./NotificationAlertPopup";

afterEach(cleanup);

const mealPick = {
  uuid: "notif-1",
  typeCode: "MEAL_REMINDER",
  typeName: "Meal reminder",
  subjectProfileId: null,
  recommendationItemId: null,
  storeId: 15,
  menuItemId: 88,
  title: "Breakfast time: Bai Sach Chrouk",
  body: "How about Bai Sach Chrouk from Morning Rice House?",
  imageUrl: "/api/v1/catalog/menu-items/abc/images/1",
  priority: "NORMAL",
  data: {},
  actionUrl: "/menu/f1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d",
  status: "CREATED",
  isRead: false,
  scheduledAt: null,
  expiresAt: null,
  readAt: null,
  dismissedAt: null,
  createdAt: "2026-08-31T06:00:00Z",
};

const nearbyStorePick = {
  ...mealPick,
  uuid: "notif-2",
  typeCode: "NEARBY_STORE_RECOMMENDATION",
  typeName: "Nearby store",
  title: "Morning Rice House is nearby",
  body: "You are about 120m away. Try Bai Sach Chrouk.",
  actionUrl: "/stores/9a8b7c6d-5e4f-4a3b-8c9d-0e1f2a3b4c5d?item=abc",
};

describe("NotificationAlertPopup", () => {
  beforeEach(() => {
    pushMock.mockReset();
    markReadMock.mockReset();
    dismissMock.mockReset();
    getNotificationsQueryMock.mockReset();
    getNotificationPreferencesQueryMock.mockReset();
    getNotificationsQueryMock.mockReturnValue({ data: { data: [] } });
    getNotificationPreferencesQueryMock.mockReturnValue({ data: [] });
  });

  it("renders nothing when there is no unread alert-worthy notification", () => {
    render(<NotificationAlertPopup />);
    expect(screen.queryByText(/Breakfast time/)).not.toBeInTheDocument();
  });

  it("pops the alert for a meal reminder that carries an item pick", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [mealPick] },
    });

    render(<NotificationAlertPopup />);

    expect(
      screen.getByText("Breakfast time: Bai Sach Chrouk"),
    ).toBeInTheDocument();
  });

  it("pops the alert for a nearby-store recommendation that carries an item pick", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [nearbyStorePick] },
    });

    render(<NotificationAlertPopup />);

    expect(screen.getByText("Morning Rice House is nearby")).toBeInTheDocument();
  });

  it("ignores a generic reminder with no item pick", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: {
        data: [
          {
            ...mealPick,
            menuItemId: null,
            imageUrl: null,
            actionUrl: "/discover?mealType=MORNING",
          },
        ],
      },
    });

    render(<NotificationAlertPopup />);

    expect(screen.queryByText(/Breakfast time/)).not.toBeInTheDocument();
  });

  it("ignores a notification type that isn't on the alert-worthy list", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: {
        data: [{ ...mealPick, typeCode: "BOOKMARKED_STORE_PROMO" }],
      },
    });

    render(<NotificationAlertPopup />);

    expect(screen.queryByText(/Breakfast time/)).not.toBeInTheDocument();
  });

  it("respects a disabled IN_APP preference for that type", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [mealPick] },
    });
    getNotificationPreferencesQueryMock.mockReturnValue({
      data: [
        {
          notificationTypeId: 1,
          typeCode: "MEAL_REMINDER",
          typeName: "Meal reminder",
          channelType: "IN_APP",
          isEnabled: false,
          quietStartTime: null,
          quietEndTime: null,
          timezone: null,
        },
      ],
    });

    render(<NotificationAlertPopup />);

    expect(screen.queryByText(/Breakfast time/)).not.toBeInTheDocument();
  });

  it("marks the notification read and navigates to the item detail page on view", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [mealPick] },
    });

    render(<NotificationAlertPopup />);
    fireEvent.click(screen.getByText("មើលលម្អិត"));

    expect(markReadMock).toHaveBeenCalledWith("notif-1");
    expect(pushMock).toHaveBeenCalledWith(
      "/menu/f1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d",
    );
    expect(dismissMock).not.toHaveBeenCalled();
  });

  it("dismisses without navigating when the user declines", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [mealPick] },
    });

    render(<NotificationAlertPopup />);
    fireEvent.click(screen.getByText("លើកលែង"));

    expect(dismissMock).toHaveBeenCalledWith("notif-1");
    expect(pushMock).not.toHaveBeenCalled();
    expect(markReadMock).not.toHaveBeenCalled();
  });
});
