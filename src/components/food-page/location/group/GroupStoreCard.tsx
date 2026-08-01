"use client";

import type { RecommendedStore } from "@/types/location";

import NearbyStoreCard from "../NearbyStoreCard";

interface GroupStoreCardProps {
  store: RecommendedStore;
  selected: boolean;
  votingEnabled: boolean;
  hasVoted: boolean;
  isVoting?: boolean;
  onSelect: () => void;
  onVote: () => void;
}

export default function GroupStoreCard({
  store,
  selected,
  votingEnabled,
  hasVoted,
  isVoting = false,
  onSelect,
  onVote,
}: GroupStoreCardProps) {
  return (
    <NearbyStoreCard
      store={store}
      mode="group"
      selected={selected}
      votingEnabled={votingEnabled}
      hasVoted={hasVoted}
      isVoting={isVoting}
      onSelect={onSelect}
      onVote={onVote}
    />
  );
}
