import { describe, it, expect } from "vitest";

import {
  normalizeMeetupGroupResponse,
  normalizeMeetupParticipantResponse,
  normalizeMeetupResultResponse,
  normalizeMeetupVoteResponse,
  normalizeMeetupVoteTallyResponse,
} from "@/lib/meetup/meetup-adapter";

/*
 * The meetup API wraps every payload in a status/message/payload envelope.
 * These fixtures mirror the documented responses exactly.
 */

describe("normalizeMeetupVoteTallyResponse", () => {
  const tallyEnvelope = {
    status: 200,
    message: "Vote tally calculated successfully",
    payload: {
      meetupUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      winnerUuid: "4c856782-b2d9-4d69-b5d1-9457c154316d",
      foodVoteTallies: [
        {
          foodUuid: "4c856782-b2d9-4d69-b5d1-9457c154316d",
          foodName: "Kuy Teav Phnom Penh",
          voteCount: 4,
          isWinner: true,
        },
        {
          foodUuid: "7a35f791-38e4-4fa9-b883-cf2084c898b1",
          foodName: "Fish Amok",
          voteCount: 2,
          isWinner: false,
        },
      ],
    },
  };

  it("reads entries from the foodVoteTallies key", () => {
    const tally = normalizeMeetupVoteTallyResponse(tallyEnvelope);

    expect(tally.tally).toHaveLength(2);
    expect(tally.tally[0].foodName).toBe("Kuy Teav Phnom Penh");
    expect(tally.tally[0].voteCount).toBe(4);
  });

  it("keeps the meetup uuid and winner uuid", () => {
    const tally = normalizeMeetupVoteTallyResponse(tallyEnvelope);

    expect(tally.meetupUuid).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    expect(tally.winnerUuid).toBe("4c856782-b2d9-4d69-b5d1-9457c154316d");
  });

  it("sums vote counts when the payload carries no total", () => {
    const tally = normalizeMeetupVoteTallyResponse(tallyEnvelope);

    expect(tally.totalVotes).toBe(6);
  });

  it("preserves the backend isWinner flag", () => {
    const tally = normalizeMeetupVoteTallyResponse(tallyEnvelope);

    expect(tally.tally[0].isWinner).toBe(true);
    expect(tally.tally[1].isWinner).toBe(false);
  });

  it("flags the winner from winnerUuid when entries carry no flag", () => {
    const tally = normalizeMeetupVoteTallyResponse({
      payload: {
        meetupUuid: "meet-1",
        winnerUuid: "food-b",
        foodVoteTallies: [
          { foodUuid: "food-a", foodName: "A", voteCount: 1 },
          { foodUuid: "food-b", foodName: "B", voteCount: 3 },
        ],
      },
    });

    expect(tally.tally.find((entry) => entry.foodUuid === "food-b")?.isWinner).toBe(
      true,
    );
    expect(tally.tally.find((entry) => entry.foodUuid === "food-a")?.isWinner).toBe(
      false,
    );
  });

  it("falls back to the highest vote count with no winner hint", () => {
    const tally = normalizeMeetupVoteTallyResponse({
      payload: {
        meetupUuid: "meet-1",
        foodVoteTallies: [
          { foodUuid: "food-a", foodName: "A", voteCount: 1 },
          { foodUuid: "food-b", foodName: "B", voteCount: 5 },
        ],
      },
    });

    expect(tally.tally.find((entry) => entry.foodUuid === "food-b")?.isWinner).toBe(
      true,
    );
  });

  it("flags nobody when no votes have been cast", () => {
    const tally = normalizeMeetupVoteTallyResponse({
      payload: {
        meetupUuid: "meet-1",
        foodVoteTallies: [
          { foodUuid: "food-a", foodName: "A", voteCount: 0 },
          { foodUuid: "food-b", foodName: "B", voteCount: 0 },
        ],
      },
    });

    expect(tally.tally.every((entry) => !entry.isWinner)).toBe(true);
    expect(tally.totalVotes).toBe(0);
  });

  it("still reads the legacy tally key", () => {
    const tally = normalizeMeetupVoteTallyResponse({
      payload: {
        meetupUuid: "meet-1",
        totalVotes: 3,
        tally: [{ candidateUuid: "cand-a", candidateName: "A", voteCount: 3 }],
      },
    });

    expect(tally.tally).toHaveLength(1);
    expect(tally.totalVotes).toBe(3);
  });

  it("returns an empty tally rather than throwing on an unexpected shape", () => {
    const tally = normalizeMeetupVoteTallyResponse(null);

    expect(tally.tally).toEqual([]);
    expect(tally.totalVotes).toBe(0);
    expect(tally.winnerUuid).toBeNull();
  });
});

describe("normalizeMeetupResultResponse", () => {
  it("reads the winning card and flags the winning tally entry", () => {
    const result = normalizeMeetupResultResponse({
      status: 200,
      message: "Meetup voting completed successfully",
      payload: {
        meetupUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        title: "Friday Dinner with Friends",
        winningCandidateId: 45,
        winningCandidateUuid: "4c856782-b2d9-4d69-b5d1-9457c154316d",
        winningCandidateName: "Kuy Teav Phnom Penh",
        totalVotes: 4,
        storeName: "Phnom Penh Noodle House",
        storeAddress: "Street 214, Daun Penh, Phnom Penh",
        price: 3.5,
        currencyCode: "USD",
        rating: 4.8,
        distanceKm: 0.8,
        mapsDirectionsUrl:
          "https://www.google.com/maps/dir/?api=1&destination=11.5570,104.9270",
        decidedAt: "2026-08-27T12:30:00Z",
        foodVoteTallies: [
          {
            foodUuid: "4c856782-b2d9-4d69-b5d1-9457c154316d",
            foodName: "Kuy Teav Phnom Penh",
            voteCount: 4,
          },
        ],
      },
    });

    expect(result.winningCandidateName).toBe("Kuy Teav Phnom Penh");
    expect(result.storeName).toBe("Phnom Penh Noodle House");
    expect(result.mapsDirectionsUrl).toContain("destination=11.5570,104.9270");
    expect(result.tally).toHaveLength(1);
    expect(result.tally[0].isWinner).toBe(true);
  });
});

describe("meetup create and join envelopes", () => {
  it("lifts the one-time share token out of the create payload", () => {
    const group = normalizeMeetupGroupResponse({
      status: 201,
      message:
        "Meetup created successfully - save the share token, it will not be shown again",
      payload: {
        meetup: {
          id: 10,
          uuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          title: "Friday Dinner with Friends",
          audienceMode: "MIXED",
          locationMode: "PIN",
          status: "COLLECTING",
          votingMethod: "APPROVAL",
          searchRadiusKm: 5.0,
          participants: [
            {
              uuid: "8c6b7582-7711-45da-9669-0fa19a97bc8a",
              nickname: "HostUser",
              participantRole: "HOST",
              status: "ACTIVE",
              locationLat: 11.5564,
              locationLng: 104.9282,
            },
          ],
        },
        shareToken: "7b8f9e2d1c3a4b5e6f7a8b9c0d1e2f3a",
      },
    });

    expect(group.shareToken).toBe("7b8f9e2d1c3a4b5e6f7a8b9c0d1e2f3a");
    expect(group.uuid).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    expect(group.audienceMode).toBe("MIXED");
    expect(group.votingMethod).toBe("APPROVAL");
    expect(group.participants).toHaveLength(1);
    expect(group.participants[0].participantRole).toBe("HOST");
  });

  it("lifts the guest token and GUEST role out of the join payload", () => {
    const participant = normalizeMeetupParticipantResponse({
      status: 201,
      message:
        "Joined meetup successfully - save the guest token, it will not be shown again",
      payload: {
        participant: {
          uuid: "b2c3d4e5-f6a7-8901-bcde-f1234567890a",
          meetupUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          nickname: "Dara",
          participantRole: "GUEST",
          status: "ACTIVE",
          locationLat: 11.56,
          locationLng: 104.92,
          allergies: ["PEANUT", "SEAFOOD"],
          dietaryTypes: ["HALAL"],
          budgetMin: 3.0,
          budgetMax: 12.0,
        },
        guestToken: "a1b2c3d4e5f6",
      },
    });

    expect(participant.uuid).toBe("b2c3d4e5-f6a7-8901-bcde-f1234567890a");
    expect(participant.participantRole).toBe("GUEST");
    expect(participant.allergies).toEqual(["PEANUT", "SEAFOOD"]);
    expect(participant.budgetMax).toBe(12);
  });
});

describe("participant status", () => {
  it("keeps the status the backend reports", () => {
    const left = normalizeMeetupParticipantResponse({
      payload: {
        participant: {
          uuid: "p-1",
          nickname: "Dara",
          participantRole: "GUEST",
          status: "LEFT",
        },
      },
    });

    expect(left.status).toBe("LEFT");
  });

  it("treats a missing status as ACTIVE", () => {
    const participant = normalizeMeetupParticipantResponse({
      payload: { participant: { uuid: "p-2", nickname: "Sokha" } },
    });

    expect(participant.status).toBe("ACTIVE");
  });

  it("carries status through the group payload participants", () => {
    const group = normalizeMeetupGroupResponse({
      payload: {
        meetup: {
          uuid: "meet-1",
          title: "Dinner",
          participants: [
            { uuid: "p-1", nickname: "Host", participantRole: "HOST" },
            {
              uuid: "p-2",
              nickname: "Gone",
              participantRole: "GUEST",
              status: "REMOVED",
            },
          ],
        },
      },
    });

    expect(group.participants.map((entry) => entry.status)).toEqual([
      "ACTIVE",
      "REMOVED",
    ]);
  });
});

describe("normalizeMeetupVoteResponse", () => {
  it("reads the documented vote payload including the vote weight", () => {
    const vote = normalizeMeetupVoteResponse({
      status: 201,
      message: "Vote cast successfully",
      payload: {
        uuid: "e5f6a7b8-c9d0-1234-ef56-789012345678",
        meetupUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        participantUuid: "b2c3d4e5-f6a7-8901-bcde-f1234567890a",
        foodUuid: "4c856782-b2d9-4d69-b5d1-9457c154316d",
        vote: 1,
      },
    });

    expect(vote.uuid).toBe("e5f6a7b8-c9d0-1234-ef56-789012345678");
    expect(vote.foodUuid).toBe("4c856782-b2d9-4d69-b5d1-9457c154316d");
    expect(vote.participantUuid).toBe("b2c3d4e5-f6a7-8901-bcde-f1234567890a");
    expect(vote.vote).toBe(1);
  });
});
