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
  const [enrichedItems, setEnrichedItems] = useState<CatalogMenuItem[]>([]);
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

      const results = await Promise.all(
        sessionItems.map((item) =>
          dispatch(
            menuApi.endpoints.getMenuItemByUuid.initiate({
              uuid: item.uuid,
              sessionUuid: session.uuid,
            }),
          )
            .unwrap()
            .catch(() => null),
        ),
      );

      if (!cancelled) {
        setEnrichedItems(
          results.filter((food): food is CatalogMenuItem => food !== null),
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
