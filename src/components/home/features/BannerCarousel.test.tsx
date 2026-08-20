import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import BannerCarousel, { type HeroBannerSlide } from "./BannerCarousel";

afterEach(cleanup);

const slide: HeroBannerSlide = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  image: "/api/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/file",
  alt: "Weekend Special",
  title: "Weekend Special",
  description: "20% off every Friday",
};

describe("BannerCarousel", () => {
  it("renders nothing for an empty banner list instead of crashing", () => {
    const { container } = render(<BannerCarousel banners={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the banner title and optional description", () => {
    render(<BannerCarousel banners={[slide]} />);

    expect(screen.getAllByText("Weekend Special").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20% off every Friday").length).toBeGreaterThan(0);
  });

  it("omits the description paragraph when a banner has none", () => {
    render(
      <BannerCarousel banners={[{ ...slide, description: null }]} />,
    );

    expect(screen.queryByText("20% off every Friday")).not.toBeInTheDocument();
  });

  it("gives the carousel region a keyboard-accessible, labelled container", () => {
    render(<BannerCarousel banners={[slide]} />);

    const region = screen.getByRole("region", { name: /foodhub promotions/i });
    expect(region).toHaveAttribute("tabIndex", "0");
  });

  it("uses the banner title as the image alt text", () => {
    render(<BannerCarousel banners={[slide]} />);

    expect(screen.getAllByAltText("Weekend Special").length).toBeGreaterThan(0);
  });
});
