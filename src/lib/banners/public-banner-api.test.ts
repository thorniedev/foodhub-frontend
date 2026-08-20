import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BannerApiError, publicBannerApi } from "./public-banner-api";

const ORIGINAL_ENV = process.env.BACKEND_API_URL;

function jsonResponse(body: unknown, init: { status?: number } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}

describe("publicBannerApi", () => {
  beforeEach(() => {
    process.env.BACKEND_API_URL = "https://api.example.com";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = ORIGINAL_ENV;
    vi.unstubAllGlobals();
  });

  it("requests the correct public category endpoints", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async () => jsonResponse([]));

    await publicBannerApi.getMainBanners();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/banners/public/main",
      expect.anything(),
    );

    await publicBannerApi.getPopularBanners();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/banners/public/popular",
      expect.anything(),
    );

    await publicBannerApi.getLocationBanners();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/banners/public/locations",
      expect.anything(),
    );

    await publicBannerApi.getSeasonBanners();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/banners/public/season",
      expect.anything(),
    );
  });

  it("does not duplicate /api/v1 when BACKEND_API_URL already includes it", async () => {
    process.env.BACKEND_API_URL = "https://api.example.com/api/v1";
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse([]));

    await publicBannerApi.getMainBanners();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/banners/public/main",
      expect.anything(),
    );
  });

  it("passes a revalidate window and a per-category cache tag", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse([]));

    await publicBannerApi.getMainBanners();

    const [, options] = fetchMock.mock.calls[0];
    expect(options).toMatchObject({
      next: { revalidate: 60, tags: ["banners:main"] },
    });
  });

  it("returns parsed banners on success", async () => {
    const banner = {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      image: "/api/v1/media/uuid/file",
      title: "Weekend Special",
      location: null,
      description: null,
    };
    vi.mocked(fetch).mockResolvedValue(jsonResponse([banner]));

    const result = await publicBannerApi.getMainBanners();

    expect(result).toEqual([banner]);
  });

  it("throws BannerApiError on a non-2xx response instead of returning []", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "boom" }, { status: 500 }));

    await expect(publicBannerApi.getMainBanners()).rejects.toBeInstanceOf(
      BannerApiError,
    );
  });

  it("throws BannerApiError when the response fails shape validation", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse([{ notABanner: true }]));

    await expect(publicBannerApi.getMainBanners()).rejects.toBeInstanceOf(
      BannerApiError,
    );
  });

  it("throws BannerApiError when the network request itself fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(publicBannerApi.getMainBanners()).rejects.toBeInstanceOf(
      BannerApiError,
    );
  });

  it("fails clearly when BACKEND_API_URL is not configured", async () => {
    delete process.env.BACKEND_API_URL;

    await expect(publicBannerApi.getMainBanners()).rejects.toThrow(
      /BACKEND_API_URL/,
    );
  });
});
