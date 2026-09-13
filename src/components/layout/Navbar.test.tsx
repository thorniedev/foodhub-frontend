import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/*
 * Regression cover for the tab that "did nothing" when clicked.
 *
 * activeIndex used to be derived from `pathname` alone. router.push runs
 * inside a transition, so React keeps the old pathname on screen until the
 * next route is ready -- on a slow route that left the indicator sitting on
 * the previous tab for seconds, and the click read as ignored.
 */

const pushMock = vi.fn();
let currentPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: pushMock,
    prefetch: vi.fn(),
  }),
}));

// The navbar pulls in the RTK store, images and theme chrome; none of that is
// what's under test here, so keep the tree to the tab strip.
vi.mock("@/app/store/auth/currentUserApi", () => ({
  useGetCurrentUserQuery: () => ({ data: null, isLoading: false }),
}));
vi.mock("@/components/notifications/NotificationBellLink", () => ({
  default: () => null,
}));
vi.mock("../DashboardUserProfile", () => ({ default: () => null }));
vi.mock("../theme-toggle", () => ({ default: () => null }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

const { default: Navbar } = await import("./Navbar");

function selectedLabels() {
  return screen
    .getAllByRole("tab")
    .filter((tab) => tab.getAttribute("aria-selected") === "true")
    .map((tab) => (tab.textContent || "").trim());
}

afterEach(() => {
  cleanup();
  pushMock.mockReset();
  currentPathname = "/";
});

describe("Navbar tab navigation", () => {
  it("marks the tab for the current route as selected", () => {
    currentPathname = "/menu";
    render(<Navbar />);

    expect(selectedLabels()).toEqual(["ម្ហូប"]);
  });

  it("moves the indicator to the clicked tab immediately, before the route changes", () => {
    currentPathname = "/";
    render(<Navbar />);

    expect(selectedLabels()).toEqual(["ទំព័រដើម"]);

    // Click "ម្ហូប" (/menu). pathname deliberately does NOT change yet --
    // that's the real-world case this regressed on.
    fireEvent.click(screen.getByRole("tab", { name: "ម្ហូប" }));

    expect(pushMock).toHaveBeenCalledWith("/menu", { scroll: true });
    // The indicator must already have moved even though pathname is still "/".
    expect(selectedLabels()).toEqual(["ម្ហូប"]);
  });

  it("hands the indicator back to the route once the pathname catches up", () => {
    currentPathname = "/";
    const view = render(<Navbar />);

    fireEvent.click(screen.getByRole("tab", { name: "ម្ហូប" }));
    expect(selectedLabels()).toEqual(["ម្ហូប"]);

    // The route resolves somewhere else entirely (redirect / back press).
    // The optimistic value must not outlive the navigation it predicted.
    currentPathname = "/store";
    view.rerender(<Navbar />);

    expect(selectedLabels()).toEqual(["ហាង"]);
  });

  it("does not navigate when the already-active tab is clicked", () => {
    currentPathname = "/menu";
    render(<Navbar />);

    fireEvent.click(screen.getByRole("tab", { name: "ម្ហូប" }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(selectedLabels()).toEqual(["ម្ហូប"]);
  });
});
