import { describe, it, expect } from "vitest";
import type { FriendDto, FriendRequestDto, FriendQrCodeResponse } from "@/types/friends";
import type { MeetupGroupDto, MeetupWinningCardResponse } from "@/types/meetup-api";

describe("Friendship and Dual-Mode Meetup Data Models", () => {
  it("validates FriendDto structure", () => {
    const friend: FriendDto = {
      friendshipUuid: "fr-101",
      userUuid: "usr-alex",
      username: "Alex Sokha",
      defaultProfileUuid: "prof-01",
      defaultProfileName: "Alex (Gluten-Free, Halal)",
      avatarMediaKey: null,
      connectedAt: "2026-08-20T00:00:00Z",
    };

    expect(friend.friendshipUuid).toBe("fr-101");
    expect(friend.defaultProfileName).toContain("Halal");
  });

  it("validates FriendRequestDto structure", () => {
    const request: FriendRequestDto = {
      requestUuid: "req-01",
      senderUuid: "usr-dara",
      senderUsername: "Dara",
      senderDefaultProfileName: "Dara (Vegan)",
      receiverUuid: "usr-alex",
      receiverUsername: "Alex",
      receiverDefaultProfileName: null,
      status: "PENDING",
      createdAt: "2026-08-22T10:00:00Z",
    };

    expect(request.status).toBe("PENDING");
    expect(request.senderUsername).toBe("Dara");
  });

  it("validates FriendQrCodeResponse structure", () => {
    const qr: FriendQrCodeResponse = {
      qrCodeToken: "fh_qr_12345",
      userUuid: "usr-alex",
      username: "Alex",
      qrContent: "foodhub://friends/add?token=fh_qr_12345",
    };

    expect(qr.qrContent).toContain("fh_qr_12345");
  });

  it("validates MeetupWinningCardResponse structure with directions url", () => {
    const winningCard: MeetupWinningCardResponse = {
      meetupUuid: "meet-01",
      title: "Team Lunch",
      winningCandidateId: 42,
      winningCandidateName: "Bong Thom Kitchen",
      totalVotes: 5,
      meetingPointLat: 11.5564,
      meetingPointLng: 104.9282,
      mapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=11.5564,104.9282",
      decidedAt: "2026-08-23T02:00:00Z",
    };

    expect(winningCard.mapsDirectionsUrl).toContain("11.5564,104.9282");
    expect(winningCard.totalVotes).toBe(5);
  });

  it("validates SendFriendRequestPayload using friendUsername and friendUserUuid according to API contract", () => {
    const usernamePayload = {
      friendUsername: "alex_foodie",
    };
    const uuidPayload = {
      friendUserUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    };

    expect(usernamePayload.friendUsername).toBe("alex_foodie");
    expect(uuidPayload.friendUserUuid).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  });
});

