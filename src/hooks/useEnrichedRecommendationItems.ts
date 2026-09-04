"use client";

import { useEffect, useRef, useState } from "react";
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
 * needed for card/map rendering.
 *
 * ✅ PERFORMANCE FIX: Items are shown PROGRESSIVELY as each detail call
 * resolves, instead of waiting for all items (was: 100 parallel calls before
 * anything showed). This makes the first card appear within ~300ms.
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

  // Cached catalog menu items for instant resolution
  const { data: catalogMenuItems } = menuApi.useGetMenuItemsQuery();
  const catalogMenuItemsRef = useRef<CatalogMenuItem[]>([]);
  useEffect(() => {
    if (catalogMenuItems && catalogMenuItems.length > 0) {
      catalogMenuItemsRef.current = catalogMenuItems;
    }
  }, [catalogMenuItems]);

  const sessionUuid = session?.uuid;
  const sessionItemsCount = sessionItems.length;

  useEffect(() => {
    let cancelled = false;

    if (!sessionUuid || sessionItemsCount === 0) {
      setEnrichedItems((prev) => (prev.length === 0 ? prev : []));
      setIsEnriching(false);
      return;
    }

    setIsEnriching(true);
    // Reset so stale items from previous tab don't flash
    setEnrichedItems((prev) => (prev.length === 0 ? prev : []));

    const itemsByUuid = new Map<string, RecommendationItem>();
    sessionItems.forEach((item) => {
      if (item.uuid) {
        itemsByUuid.set(item.uuid, item);
      }
      if (item.menuItemUuid) {
        itemsByUuid.set(item.menuItemUuid, item);
      }
    });

    let resolvedCount = 0;
    const total = sessionItems.length;
    // Collect results in ranked order: slot is pre-allocated so position is preserved
    const slots: (EnrichedRecommendationItem | null)[] = Array(total).fill(null);

    sessionItems.forEach((item, index) => {
      // 1. Try to find the item in catalogMenuItems first:
      const catalogMatch = catalogMenuItemsRef.current.find((c) => {
        if (item.menuItemUuid && c.uuid === item.menuItemUuid) return true;
        if (item.menuItemId && c.legacyId === item.menuItemId) return true;
        if (item.foodUuid && c.food?.uuid === item.foodUuid) return true;
        if (
          item.menuItemName &&
          (c.name?.trim().toLowerCase() === item.menuItemName.trim().toLowerCase() ||
           c.localName?.trim().toLowerCase() === item.menuItemName.trim().toLowerCase())
        ) {
          return true;
        }
        return false;
      });

      if (catalogMatch) {
        slots[index] = {
          ...catalogMatch,
          isExploration: item.isExploration,
          rankPosition: item.rankPosition,
          recommendation: {
            finalScore: item.finalScore,
            reasonText: item.reasonText,
            reasonCodes: item.reasonCodes,
            scoreBreakdown: item.scoreBreakdown,
          },
        };
        resolvedCount++;
        if (!cancelled) {
          const seen = new Set<string>();
          const progressiveList = slots.filter(
            (slot): slot is EnrichedRecommendationItem => {
              if (!slot || !slot.uuid) return false;
              if (seen.has(slot.uuid)) return false;
              seen.add(slot.uuid);
              return true;
            },
          );
          setEnrichedItems(progressiveList);
          if (resolvedCount === total) {
            setIsEnriching(false);
          }
        }
        return;
      }

      // 2. If not matched in catalog, check if we have a valid menuItemUuid:
      const menuItemUuid = item.menuItemUuid;
      if (!menuItemUuid) {
        // No valid menu item UUID and not in catalog — skip this slot so it never shows a broken card
        resolvedCount++;
        if (!cancelled && resolvedCount === total) {
          setIsEnriching(false);
        }
        return;
      }

      // 3. Fetch detail from endpoint:
      dispatch(
        menuApi.endpoints.getMenuItemByUuid.initiate({
          uuid: menuItemUuid,
          sessionUuid: sessionUuid,
        }),
      )
        .unwrap()
        .then((food): EnrichedRecommendationItem => {
          const sourceItem =
            itemsByUuid.get(food.uuid) ||
            itemsByUuid.get(menuItemUuid) ||
            itemsByUuid.get(item.uuid);
          return {
            ...food,
            isExploration: sourceItem?.isExploration,
            rankPosition: sourceItem?.rankPosition,
            recommendation: {
              finalScore: sourceItem?.finalScore ?? item.finalScore,
              reasonText: sourceItem?.reasonText ?? item.reasonText,
              reasonCodes: sourceItem?.reasonCodes ?? item.reasonCodes,
              scoreBreakdown: sourceItem?.scoreBreakdown ?? item.scoreBreakdown,
            },
          };
        })
        .catch(() => {
          // If fetching detail failed (e.g. 404), DO NOT return a dummy broken item!
          // Return null so slot is omitted and won't produce a broken card or 404 page.
          return null;
        })
        .then((enriched) => {
          if (cancelled) return;

          slots[index] = enriched;
          resolvedCount++;

          const seen = new Set<string>();
          const progressiveList = slots.filter(
            (slot): slot is EnrichedRecommendationItem => {
              if (!slot || !slot.uuid) return false;
              if (seen.has(slot.uuid)) return false;
              seen.add(slot.uuid);
              return true;
            },
          );
          setEnrichedItems(progressiveList);

          if (resolvedCount === total) {
            setIsEnriching(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUuid, sessionItemsCount, dispatch]);

  return { enrichedItems, isEnriching };
}
