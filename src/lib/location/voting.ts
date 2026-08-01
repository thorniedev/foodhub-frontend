import type {
  GroupVote,
  VotingLeaderboardEntry,
} from "@/types/group-recommendation";
import type { RecommendedStore } from "@/types/location";

export function castOrReplaceVote(
  votes: GroupVote[],
  memberUuid: string,
  storeUuid: string,
): GroupVote[] {
  return [
    ...votes.filter((vote) => vote.memberUuid !== memberUuid),
    {
      memberUuid,
      storeUuid,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function buildVotingLeaderboard(
  stores: RecommendedStore[],
  votes: GroupVote[],
): VotingLeaderboardEntry[] {
  const totalVotes = votes.length;

  return stores
    .map((store) => {
      const voteCount = votes.filter(
        (vote) => vote.storeUuid === store.uuid,
      ).length;

      return {
        rank: 0,
        store: { ...store, voteCount },
        voteCount,
        percentage: totalVotes ? Math.round((voteCount / totalVotes) * 100) : 0,
      };
    })
    .sort((first, second) => {
      if (second.voteCount !== first.voteCount) {
        return second.voteCount - first.voteCount;
      }

      if (
        second.store.recommendationScore !== first.store.recommendationScore
      ) {
        return (
          second.store.recommendationScore - first.store.recommendationScore
        );
      }

      if (
        first.store.maximumMemberDistanceKm !==
        second.store.maximumMemberDistanceKm
      ) {
        return (
          first.store.maximumMemberDistanceKm -
          second.store.maximumMemberDistanceKm
        );
      }

      return second.store.averageRating - first.store.averageRating;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function resolveWinningStore(
  stores: RecommendedStore[],
  votes: GroupVote[],
): RecommendedStore | null {
  return buildVotingLeaderboard(stores, votes)[0]?.store ?? null;
}
