"use client";

import type { RecommendationMode, RecommendedStore } from "@/types/location";

import LocationEmptyState from "./LocationEmptyState";
import NearbyStoreCard from "./NearbyStoreCard";

interface NearbyStoreListProps {
  stores: RecommendedStore[];
  mode: RecommendationMode;
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  votingEnabled?: boolean;
  currentMemberUuid?: string;
  votedStoreUuid?: string | null;
  onVote?: (storeUuid: string) => void;
}

export default function NearbyStoreList({
  stores,
  mode,
  selectedStoreId,
  onSelectStore,
  votingEnabled = false,
  votedStoreUuid,
  onVote,
}: NearbyStoreListProps) {
  if (stores.length === 0) {
    return <LocationEmptyState />;
  }

  return (
    <div className="space-y-4 2xl:max-h-[calc(100vh-250px)] 2xl:overflow-y-auto 2xl:pr-1 2xl:[scrollbar-width:none] 2xl:[&::-webkit-scrollbar]:hidden">
      {stores.map((store) => (
        <NearbyStoreCard
          key={store.uuid}
          store={store}
          mode={mode}
          selected={selectedStoreId === store.uuid}
          votingEnabled={votingEnabled}
          hasVoted={votedStoreUuid === store.uuid}
          onSelect={() => onSelectStore(store.uuid)}
          onVote={onVote ? () => onVote(store.uuid) : undefined}
        />
      ))}
    </div>
  );
}
