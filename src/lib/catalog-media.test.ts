import { describe, expect, it } from "vitest";
import { toFrontendApiAssetUrl } from "./catalog-media";

describe("toFrontendApiAssetUrl (banner image resolution)", () => {
  it("rewrites a backend /api/v1/media/{uuid}/file path to the local proxy", () => {
    expect(
      toFrontendApiAssetUrl(
        "/api/v1/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/file",
      ),
    ).toBe("/api/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/file");
  });

  it("does not duplicate /api/v1 when rewriting", () => {
    const result = toFrontendApiAssetUrl(
      "/api/v1/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/file",
    );
    expect(result).not.toContain("/api/v1/api");
    expect(result.startsWith("/api/media/")).toBe(true);
  });

  it("passes through an already-absolute URL unchanged", () => {
    const url = "https://cdn.example.com/banner.png";
    expect(toFrontendApiAssetUrl(url)).toBe(url);
  });

  it("falls back to the default image for a null/empty value", () => {
    expect(toFrontendApiAssetUrl(null)).toBe("/Image/default-food.png");
    expect(toFrontendApiAssetUrl("")).toBe("/Image/default-food.png");
  });

  it("resolves a raw media UUID", () => {
    expect(
      toFrontendApiAssetUrl("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
    ).toBe("/api/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/file");
  });
});
