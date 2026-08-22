"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { menuApi } from "@/app/store/menuApi";

import type { AppDispatch } from "@/app/store/store";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type {
  RecommendationItem,
  RecommendationSession,
} from "@/types/recommendation";

/**
 * Enriched catalog item plus the session-item fields the detail endpoint's
 * own `recommendation` sub-object doesn't carry (it has finalScore/
 * reasonText/reasonCodes/scoreBreakdown, but not isExploration or the
 * session's rankPosition).
 */
export type EnrichedRecommendationItem = CatalogMenuItem & {
  isExploration?: boolean;
  rankPosition?: number | null;
};

/**
 * Enriches a recommendation session's thin ranked items (uuid, score,
 * reasonText...) with full catalog detail (image, store, price, location...)
 * needed for card/map rendering. The detail endpoint accepts the session
 * UUID and returns the same personalized ranking/reason for each item.
 *
 * Shared by the home AI swipe deck and the "/menu/location" Single-mode
 * discovery page — both need the same session-items-to-cards conversion.
 */
export function useEnrichedRecommendationItems(
  session: RecommendationSession | undefined,
  sessionItems: RecommendationItem[],
) {
  const dispatch = useDispatch<AppDispatch>();
  const [enrichedItems, setEnrichedItems] = useState<
    EnrichedRecommendationItem[]
  >([]);
  const [isEnriching, setIsEnriching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!session || sessionItems.length === 0) {
        if (!cancelled) {
          setEnrichedItems([]);
        }
        return;
      }

      setIsEnriching(true);

      const itemsByUuid = new Map(
        sessionItems.map((item) => [item.uuid, item]),
      );

      const results = await Promise.all(
        sessionItems.map((item) =>
          dispatch(
            menuApi.endpoints.getMenuItemByUuid.initiate({
              uuid: item.uuid,
              sessionUuid: session.uuid,
            }),
          )
            .unwrap()
            .then((food): EnrichedRecommendationItem => {
              const sourceItem = itemsByUuid.get(food.uuid);
              return {
                ...food,
                isExploration: sourceItem?.isExploration,
                rankPosition: sourceItem?.rankPosition,
              };
            })
            .catch((): EnrichedRecommendationItem => ({
              uuid: item.uuid,
              name: item.menuItemName ?? "Recommended dish",
              localName: item.menuItemName ?? null,
              description: null,
              localDescription: null,
              price: item.priceSnapshot ?? 0,
              currencyCode: item.currencyCode ?? "USD",
              thumbnail: null,
              gallery: [],
              servingUnit: null,
              orderCount: 0,
              viewCount: 0,
              favoriteCount: 0,
              preparationMinutes: null,
              calories: null,
              operatingStatus: "OPEN",
              availabilityStatus: "AVAILABLE",
              safetyAuditStatus: "SAFE",
              spicinessLevel: 0,
              sweetnessLevel: 0,
              isRecommended: true,
              isPopular: false,
              isSeasonal: false,
              isHealthyChoice: true,
              isVegetarian: false,
              isChefSpecial: false,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              store: {
                uuid: String(item.storeId ?? ""),
                name: item.storeName ?? "Partner store",
                localName: item.storeName ?? null,
                averageRating: 4.8,
                totalReviews: 0,
                operatingStatus: "OPEN",
                addressLine: null,
                district: null,
                city: null,
                latitude: 0,
                longitude: 0,
                logoUrl: null,
                coverImageUrl: null,
                social: [],
              },
              recommendation: {
                finalScore: item.finalScore,
                groupScore: item.groupScore,
                reasonText: item.reasonText,
                reasonCodes: item.reasonCodes,
                scoreBreakdown: item.scoreBreakdown,
              },
              distanceKm: item.distanceKm,
              isExploration: item.isExploration,
              rankPosition: item.rankPosition,
            } as unknown as EnrichedRecommendationItem)),
        ),
      );

      if (!cancelled) {
        setEnrichedItems(
          results.filter(
            (food): food is EnrichedRecommendationItem => food !== null,
          ),
        );
        setIsEnriching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, sessionItems, dispatch]);

  return { enrichedItems, isEnriching };
}
