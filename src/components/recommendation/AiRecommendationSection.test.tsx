import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AiRecommendationSection from "./AiRecommendationSection";
import * as recommendationService from "@/services/recommendationService";

afterEach(cleanup);

describe("AiRecommendationSection", () => {
  const mockProfiles = [
    {
      uuid: "prof-1",
      profileName: "Alice",
      relationship: "SELF",
      gender: "FEMALE",
      isDefault: true,
    },
    {
      uuid: "prof-2",
      profileName: "Bob",
      relationship: "CHILD",
      gender: "MALE",
      isDefault: false,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders header and loads profiles on mount", async () => {
    vi.spyOn(recommendationService, "fetchUserProfiles").mockResolvedValue(mockProfiles);

    render(<AiRecommendationSection authToken="test-token" />);

    expect(screen.getByText("AI Food Recommendation")).toBeInTheDocument();
    expect(
      screen.getByText(/Personalized & allergy-safe recommendations/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Default (Alice)")).toBeInTheDocument();
    });
  });

  it("allows switching to Specific Profile and selecting a child profile", async () => {
    vi.spyOn(recommendationService, "fetchUserProfiles").mockResolvedValue(mockProfiles);
    const getRecsMock = vi
      .spyOn(recommendationService, "getRecommendations")
      .mockResolvedValue({
        session: {
          uuid: "session-1",
          mode: "SINGLE",
          status: "READY",
          requestSource: "WEB",
          requestedLimit: 12,
          candidateCount: 10,
          eligibleCount: 1,
          startedAt: "2026-08-22T00:00:00Z",
        },
        items: [
          {
            uuid: "item-1",
            menuItemId: 1,
            menuItemName: "Kid Friendly Noodles",
            storeId: 2,
            storeName: "Noodle House",
            rankPosition: 1,
            finalScore: 0.9,
            candidateSource: "AI",
            distanceKm: 0.8,
            priceSnapshot: 4.5,
            currencyCode: "USD",
            reasonText: "Low spice, no peanuts",
            isExploration: false,
            createdAt: "2026-08-22T00:00:00Z",
          },
        ],
      });

    render(<AiRecommendationSection authToken="test-token" />);

    await waitFor(() => {
      expect(screen.getByText("Specific Profile")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Specific Profile"));

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "prof-2" } });

    fireEvent.click(screen.getByText("Find Best Matches"));

    await waitFor(() => {
      expect(getRecsMock).toHaveBeenCalledWith(
        {
          mode: "SINGLE",
          requestSource: "HOMEPAGE_AUTO",
          searchRadiusKm: 3.0,
          currencyCode: "USD",
          requestedLimit: 50,
          profiles: [{ profileId: "prof-2", isPrimary: true }],
        },
        "test-token"
      );
      expect(screen.getByText("Kid Friendly Noodles")).toBeInTheDocument();
      expect(screen.getByText("90% Match")).toBeInTheDocument();
      expect(screen.getByText("Noodle House")).toBeInTheDocument();
      expect(screen.getByText("0.8 km away")).toBeInTheDocument();
    });
  });

  it("switches to Group Mode (ALL) and sets mode: GROUP with primary default profile", async () => {
    vi.spyOn(recommendationService, "fetchUserProfiles").mockResolvedValue(mockProfiles);
    const getRecsMock = vi
      .spyOn(recommendationService, "getRecommendations")
      .mockResolvedValue({
        session: {
          uuid: "session-grp",
          mode: "GROUP",
          status: "READY",
          requestSource: "HOMEPAGE_AUTO",
          requestedLimit: 50,
          candidateCount: 10,
          eligibleCount: 0,
          startedAt: "2026-08-22T00:00:00Z",
        },
        items: [],
      });

    render(<AiRecommendationSection authToken="test-token" />);

    await waitFor(() => {
      expect(screen.getByText("All Profiles (Group Mode)")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("All Profiles (Group Mode)"));
    fireEvent.click(screen.getByText("Find Best Matches"));

    await waitFor(() => {
      expect(getRecsMock).toHaveBeenCalledWith(
        {
          mode: "GROUP",
          requestSource: "HOMEPAGE_AUTO",
          searchRadiusKm: 3.0,
          currencyCode: "USD",
          requestedLimit: 50,
          profiles: [
            { profileId: "prof-1", isPrimary: true },
            { profileId: "prof-2", isPrimary: false },
          ],
        },
        "test-token"
      );
      // Strict Fallback State (No Matching Food Found)
      expect(screen.getByText("No Matching Food Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          /We filtered out dishes that conflicted with your dietary, allergy, or budget restrictions/i
        )
      ).toBeInTheDocument();
    });
  });
});
