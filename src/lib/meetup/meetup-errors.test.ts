import { describe, expect, it } from "vitest";

import {
  getMeetupErrorMessage,
  isAlreadyVotedError,
  isConflictError,
} from "./meetup-errors";

/** Shape RTK Query hands back from `unwrap()` on an HTTP failure. */
function apiError(status: number, message: string) {
  return { status, data: { status, message } };
}

describe("isConflictError", () => {
  it("recognises a 409 so session creation can retry once", () => {
    expect(isConflictError(apiError(409, "Request conflicts with existing data"))).toBe(
      true,
    );
  });

  it("treats a numeric string status the same way", () => {
    expect(isConflictError({ status: "409" })).toBe(true);
  });

  it("does not retry other failures", () => {
    expect(isConflictError(apiError(403, "Forbidden"))).toBe(false);
    expect(isConflictError(apiError(500, "Boom"))).toBe(false);
    expect(isConflictError(null)).toBe(false);
    expect(isConflictError({ status: "FETCH_ERROR" })).toBe(false);
  });
});

describe("getMeetupErrorMessage", () => {
  it("tells a blocked visitor how to get into a friends-only room", () => {
    const message = getMeetupErrorMessage(
      apiError(403, "Only accepted friends can join this meetup"),
      "fallback",
    );

    expect(message).not.toBe("fallback");
    expect(message).toContain("មិត្តភក្តិ");
  });

  it("explains a pin meetup radius rejection", () => {
    const message = getMeetupErrorMessage(
      apiError(400, "Participant is outside the selected meetup radius"),
      "fallback",
    );

    expect(message).toContain("រង្វង់");
  });

  it("falls back when the reason is not one FoodHub recognises", () => {
    expect(getMeetupErrorMessage(apiError(500, "Kernel panic"), "fallback")).toBe(
      "fallback",
    );
    expect(getMeetupErrorMessage(null, "fallback")).toBe("fallback");
  });
});

describe("isAlreadyVotedError", () => {
  it("detects the duplicate-vote conflict so the room realigns", () => {
    expect(
      isAlreadyVotedError(
        apiError(409, "This participant has already voted for this food"),
      ),
    ).toBe(true);
    expect(isAlreadyVotedError(apiError(409, "Something else"))).toBe(false);
  });
});
