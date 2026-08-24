"use client";

import { useCallback } from "react";
import { useRecordInteractionMutation } from "@/app/store/interactionApi";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import type {
  InteractionEventType,
  RecordInteractionRequest,
} from "@/types/interaction";

export interface TrackParams {
  eventType: InteractionEventType;
  menuItemUuid?: string;
  storeUuid?: string;
  foodUuid?: string;
  recommendationSessionUuid?: string;
  recommendationItemUuid?: string;
  notificationUuid?: string;
  dwellTimeMs?: number;
}

export function useTrackInteraction() {
  const { activeProfileUuid } = useActiveProfile();
  const [recordInteractionMutation] = useRecordInteractionMutation();

  const track = useCallback(
    async (params: TrackParams) => {
      // Formatted as "YYYY-MM-DDTHH:mm:ss" ISO string without millis/Z
      const nowIso = new Date().toISOString().slice(0, 19);

      const payload: RecordInteractionRequest = {
        clientEventId: crypto.randomUUID(),
        profileUuid: activeProfileUuid || undefined,
        menuItemUuid: params.menuItemUuid,
        storeUuid: params.storeUuid,
        foodUuid: params.foodUuid,
        recommendationSessionUuid: params.recommendationSessionUuid,
        recommendationItemUuid: params.recommendationItemUuid,
        notificationUuid: params.notificationUuid,
        eventType: params.eventType,
        dwellTimeMs: params.dwellTimeMs,
        occurredAt: nowIso,
      };

      try {
        await recordInteractionMutation(payload).unwrap();
      } catch (err) {
        // Non-blocking telemetry logging
        console.debug("[Telemetry Error]", err);
      }
    },
    [activeProfileUuid, recordInteractionMutation]
  );

  return { track };
}
