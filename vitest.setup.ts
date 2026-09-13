import "@testing-library/jest-dom/vitest";

// jsdom does not implement ResizeObserver; BannerCarousel (and other
// motion/layout-measuring components) use it to measure slide width.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub;
}
