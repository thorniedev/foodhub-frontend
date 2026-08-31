import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const { pushMock, markReadMock, dismissMock, getNotificationsQueryMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    markReadMock: vi.fn(),
    dismissMock: vi.fn(),
    getNotificationsQueryMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/store/notificationApi", () => ({
  useGetNotificationsQuery: getNotificationsQueryMock,
  useMarkNotificationReadMutation: () => [markReadMock, {}],
  useDismissNotificationMutation: () => [dismissMock, {}],
}));

import MealTopPickAlert from "./MealTopPickAlert";

afterEach(cleanup);

const pickNotification = {
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

describe("MealTopPickAlert", () => {
  beforeEach(() => {
    pushMock.mockReset();
    markReadMock.mockReset();
    dismissMock.mockReset();
    getNotificationsQueryMock.mockReset();
    getNotificationsQueryMock.mockReturnValue({ data: { data: [] } });
  });

  it("renders nothing when there is no unread meal-reminder notification", () => {
    render(<MealTopPickAlert />);
    expect(screen.queryByText(/Breakfast time/)).not.toBeInTheDocument();
  });

  it("pops the alert for a meal reminder that carries an item pick", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [pickNotification] },
    });

    render(<MealTopPickAlert />);

    expect(
      screen.getByText("Breakfast time: Bai Sach Chrouk"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How about Bai Sach Chrouk from Morning Rice House?"),
    ).toBeInTheDocument();
  });

  it("ignores a generic meal reminder with no item pick", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: {
        data: [
          {
            ...pickNotification,
            menuItemId: null,
            imageUrl: null,
            actionUrl: "/discover?mealType=MORNING",
          },
        ],
      },
    });

    render(<MealTopPickAlert />);

    expect(screen.queryByText(/Breakfast time/)).not.toBeInTheDocument();
  });

  it("marks the notification read and navigates to the item detail page on view", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [pickNotification] },
    });

    render(<MealTopPickAlert />);
    fireEvent.click(screen.getByText("មើលមុខម្ហូបនេះ"));

    expect(markReadMock).toHaveBeenCalledWith("notif-1");
    expect(pushMock).toHaveBeenCalledWith(
      "/menu/f1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d",
    );
    expect(dismissMock).not.toHaveBeenCalled();
  });

  it("dismisses without navigating when the user declines", () => {
    getNotificationsQueryMock.mockReturnValue({
      data: { data: [pickNotification] },
    });

    render(<MealTopPickAlert />);
    fireEvent.click(screen.getByText("លើកលែង"));

    expect(dismissMock).toHaveBeenCalledWith("notif-1");
    expect(pushMock).not.toHaveBeenCalled();
    expect(markReadMock).not.toHaveBeenCalled();
  });
});
