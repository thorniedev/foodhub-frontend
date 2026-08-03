import type {
  GroupLocationVote,
  GroupRecommendedStore,
} from "@/types/group-location";

export function castOrReplaceGroupVote(
  votes: GroupLocationVote[],
  memberUuid: string,
  storeUuid: string,
): GroupLocationVote[] {
  const nextVote: GroupLocationVote = {
    memberUuid,
    storeUuid,
    createdAt: new Date().toISOString(),
  };

  return [...votes.filter((vote) => vote.memberUuid !== memberUuid), nextVote];
}

export function getGroupStoreVoteCount(
  votes: GroupLocationVote[],
  storeUuid: string,
): number {
  return votes.filter((vote) => vote.storeUuid === storeUuid).length;
}

export function resolveGroupWinner(
  stores: GroupRecommendedStore[],
  votes: GroupLocationVote[],
): GroupRecommendedStore | null {
  if (stores.length === 0) {
    return null;
  }

  return [...stores]
    .map((store) => ({
      ...store,
      voteCount: getGroupStoreVoteCount(votes, store.uuid),
    }))
    .sort((first, second) => {
      return (
        second.voteCount - first.voteCount ||
        second.recommendationScore - first.recommendationScore ||
        first.maximumMemberDistanceKm - second.maximumMemberDistanceKm ||
        first.distanceKm - second.distanceKm
      );
    })[0];
}
