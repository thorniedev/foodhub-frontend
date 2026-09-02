import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { baseApi } from "./baseApi";
import { recommendationApi } from "./recommendationApi";

import type { CreateRecommendationSessionRequest } from "@/types/recommendation";

/**
 * Creating a recommendation session runs one paid LLM call per candidate on
 * the backend (up to AI_CANDIDATE_LIMIT), so a duplicated request costs real
 * money. RTK Query de-duplicates queries but never mutations, and several
 * components each own their own mutation hook, so the guard lives in the
 * endpoint itself.
 */
describe("createRecommendationSession de-duplication", () => {
  function makeStore() {
    return configureStore({
      reducer: { [baseApi.reducerPath]: baseApi.reducer },
      middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    });
  }

  function request(
    overrides: Partial<CreateRecommendationSessionRequest> = {},
  ): CreateRecommendationSessionRequest {
    return {
      mode: "SINGLE",
      requestSource: "HOMEPAGE_AUTO",
      requestedLimit: 15,
      searchRadiusKm: 3,
      currencyCode: "USD",
      profiles: [{ profileId: "profile-a", isPrimary: true }],
      ...overrides,
    } as CreateRecommendationSessionRequest;
  }

  let fetchMock: ReturnType<typeof vi.fn>;

  function requestedUrl(input: unknown): string {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    if (input && typeof input === "object" && "url" in input) {
      return String((input as { url: unknown }).url);
    }
    return "";
  }

  beforeEach(() => {
    // fetchBaseQuery builds a Request before calling fetch. Under vitest the
    // Request implementation is undici's, which rejects the relative "/api"
    // baseUrl that works in the browser, so resolve it against an origin.
    const RealRequest = globalThis.Request;
    vi.stubGlobal(
      "Request",
      class PatchedRequest extends RealRequest {
        constructor(input: RequestInfo | URL, init?: RequestInit) {
          const resolved =
            typeof input === "string" && input.startsWith("/")
              ? `http://localhost${input}`
              : input;
          super(resolved as RequestInfo | URL, init);
        }
      },
    );

    fetchMock = vi.fn(async (input: unknown) => {
      const url = requestedUrl(input);

      if (url.includes("/items")) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ uuid: "session-1", items: null }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function sessionCreateCalls() {
    return fetchMock.mock.calls.filter(([input]) => {
      const url = requestedUrl(input);
      return url.includes("/recommendations/sessions") && !url.includes("/items");
    });
  }

  it("issues one backend call when two identical requests race", async () => {
    const store = makeStore();

    // Both dispatched in the same tick, as an effect plus a click would be.
    await Promise.all([
      store.dispatch(
        recommendationApi.endpoints.createRecommendationSession.initiate(
          request(),
        ),
      ),
      store.dispatch(
        recommendationApi.endpoints.createRecommendationSession.initiate(
          request(),
        ),
      ),
    ]);

    expect(sessionCreateCalls()).toHaveLength(1);
  });

  it("still issues separate calls for genuinely different requests", async () => {
    const store = makeStore();

    await Promise.all([
      store.dispatch(
        recommendationApi.endpoints.createRecommendationSession.initiate(
          request({ contextData: { userPrompt: "coffee" } }),
        ),
      ),
      store.dispatch(
        recommendationApi.endpoints.createRecommendationSession.initiate(
          request({ contextData: { userPrompt: "noodle" } }),
        ),
      ),
    ]);

    expect(sessionCreateCalls()).toHaveLength(2);
  });

  it("does not block a later identical request once the first settles", async () => {
    const store = makeStore();

    await store.dispatch(
      recommendationApi.endpoints.createRecommendationSession.initiate(
        request(),
      ),
    );
    await store.dispatch(
      recommendationApi.endpoints.createRecommendationSession.initiate(
        request(),
      ),
    );

    // The in-flight entry must be cleared on settle, otherwise a user could
    // never re-run the same recommendation.
    expect(sessionCreateCalls()).toHaveLength(2);
  });
});
