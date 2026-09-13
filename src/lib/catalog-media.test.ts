import { describe, expect, it } from "vitest";
import { toFrontendApiAssetUrl, DEFAULT_FOOD_IMAGE } from "./catalog-media";

const BACKEND_MEDIA_BASE = "https://api.mhoubahar.store/api/v1/media";

describe("toFrontendApiAssetUrl (banner image resolution)", () => {
  it("rewrites a backend /api/v1/media/{uuid}/file path to a direct backend URL", () => {
    expect(
      toFrontendApiAssetUrl(
        "/api/v1/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/file",
      ),
    ).toBe(`${BACKEND_MEDIA_BASE}/3fa85f64-5717-4562-b3fc-2c963f66afa6/file`);
  });

  it("does not duplicate /api/v1 when rewriting", () => {
    const result = toFrontendApiAssetUrl(
      "/api/v1/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/file",
    );
    expect(result).not.toContain("/api/v1/api");
    expect(result.startsWith(BACKEND_MEDIA_BASE)).toBe(true);
  });

  it("passes through an already-absolute URL unchanged", () => {
    const url = "https://cdn.example.com/banner.png";
    expect(toFrontendApiAssetUrl(url)).toBe(url);
  });

  it("falls back to the default image for a null/empty value", () => {
    expect(toFrontendApiAssetUrl(null)).toBe(DEFAULT_FOOD_IMAGE);
    expect(toFrontendApiAssetUrl("")).toBe(DEFAULT_FOOD_IMAGE);
  });

  it("resolves a raw media UUID", () => {
    expect(
      toFrontendApiAssetUrl("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
    ).toBe(`${BACKEND_MEDIA_BASE}/3fa85f64-5717-4562-b3fc-2c963f66afa6/file`);
  });

  it("appends /file when the backend omits it (meetup storeLogoUrl shape)", () => {
    expect(
      toFrontendApiAssetUrl("/api/v1/media/3fa85f64-5717-4562-b3fc-2c963f66afa6"),
    ).toBe(`${BACKEND_MEDIA_BASE}/3fa85f64-5717-4562-b3fc-2c963f66afa6/file`);
  });
});
