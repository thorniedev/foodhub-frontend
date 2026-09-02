import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { baseApi } from "./baseApi";
import { normalizeArrayPayload, normalizePayload } from "./utils/normalize";

import type {
  CreateRecommendationSessionRequest,
  RecommendationItem,
  RecommendationSession,
  SafetyCheckDto,
} from "@/types/recommendation";

type CreateSessionResult =
  | { data: RecommendationSession }
  | { error: FetchBaseQueryError };

/**
 * Sessions currently being created, keyed by request signature.
 *
 * Creating a session is expensive and metered: the backend runs one paid LLM
 * call per candidate, up to AI_CANDIDATE_LIMIT, so a duplicated request costs
 * real money and doubles latency. RTK Query de-duplicates queries but never
 * mutations, and a per-component guard cannot help because several
 * components (Model, AiRecommendation, FilterByMealTime, MeetupLiveRoom,
 * LocationContent) each own a separate mutation hook.
 *
 * Keying by request signature rather than blocking globally keeps genuinely
 * different requests concurrent -- only an identical in-flight request is
 * joined, and it resolves to the same result for every caller.
 */
const inFlightSessions = new Map<string, Promise<CreateSessionResult>>();

/**
 * Words that name the DRINK category itself, in English and Khmer.
 *
 * Deliberately only category words, not specific drink names. "coffee"
 * already works through the backend's keyword match against menu item and
 * food names, whereas "drink" matches no item text at all -- drinks are
 * identified by their category, so the only way to honour that request is the
 * rootCategoryCode hard filter. Keeping specific names out of this list
 * avoids a hard filter wrongly excluding, say, a coffee-flavoured dessert.
 */
const DRINK_INTENT_WORDS = [
  "drink",
  "drinks",
  "beverage",
  "beverages",
  "ភេសជ្ជៈ",
  "ភេសជ្ជះ",
];

const FOOD_INTENT_WORDS = ["food", "eat", "meal", "dish", "ម្ហូប", "អាហារ"];

/**
 * Derives the FOOD/DRINK hard filter from the user's own words.
 *
 * Applied here rather than in each screen so every component that creates a
 * session behaves the same. An explicit rootCategoryCode from the caller
 * always wins; an ambiguous prompt (both or neither) stays unfiltered.
 */
function resolveRootCategoryCode(
  body: CreateRecommendationSessionRequest,
): "FOOD" | "DRINK" | undefined {
  if (body.rootCategoryCode) {
    return body.rootCategoryCode;
  }

  const prompt = (body.contextData as { userPrompt?: string } | undefined)
    ?.userPrompt;
  if (!prompt) return undefined;

  const haystack = ` ${prompt.toLowerCase()} `;
  const wantsDrink = DRINK_INTENT_WORDS.some((word) =>
    haystack.includes(word),
  );
  const wantsFood = FOOD_INTENT_WORDS.some((word) => haystack.includes(word));

  if (wantsDrink && !wantsFood) return "DRINK";
  if (wantsFood && !wantsDrink) return "FOOD";
  return undefined;
}

/**
 * Stable signature for a session request.
 *
 * Profile ids are sorted so the same group in a different order is treated as
 * one request, and only the fields that change the recommendation are
 * included.
 */
function sessionRequestKey(body: CreateRecommendationSessionRequest): string {
  return JSON.stringify({
    mode: body.mode,
    requestSource: body.requestSource,
    requestedLimit: body.requestedLimit,
    searchRadiusKm: body.searchRadiusKm,
    currencyCode: body.currencyCode,
    rootCategoryCode: resolveRootCategoryCode(body) ?? null,
    userPrompt:
      (body.contextData as { userPrompt?: string } | undefined)?.userPrompt ??
      null,
    profileIds: (body.profiles ?? [])
      .map((profile) => profile.profileId)
      .slice()
      .sort(),
  });
}

/**
 * Recommendation session API. Goes through the Next BFF proxy
 * (`/recommendations/*` -> `<backend>/api/v1/recommendations/*`), which
 * attaches the access token server-side.
 *
 * Implements the 2-step recommendation flow:
 *   1. POST /api/v1/recommendations/sessions -> creates session (items: null)
 *   2. GET /api/v1/recommendations/sessions/{uuid}/items -> retrieves ranked items
 */
export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRecommendationSession: builder.mutation<
      RecommendationSession,
      CreateRecommendationSessionRequest
    >({
      async queryFn(body, _queryApi, _extraOptions, fetchWithBQ) {
        const runCreateSession = async (): Promise<CreateSessionResult> => {
          // "give me a drink" names a category, not an item, so it can only be
          // honoured by the FOOD/DRINK hard filter. See resolveRootCategoryCode.
          const rootCategoryCode = resolveRootCategoryCode(body);
          const requestBody = rootCategoryCode
            ? { ...body, rootCategoryCode }
            : body;

          // Step 1: Create session
          const createResult = await fetchWithBQ({
            url: "/recommendations/sessions",
            method: "POST",
            body: requestBody,
          });

          if (createResult.error) {
            return { error: createResult.error };
          }

          const session = normalizePayload<RecommendationSession>(
            createResult.data,
            {} as RecommendationSession,
          );

          if (!session || !session.uuid) {
            return { data: session };
          }

          // If items are already populated, return directly
          if (Array.isArray(session.items) && session.items.length > 0) {
            return { data: session };
          }

          // Step 2: Fetch all ranked recommendation items for this session
          const limit = body.requestedLimit || 50;
          const itemsResult = await fetchWithBQ({
            url: `/recommendations/sessions/${encodeURIComponent(session.uuid)}/items?limit=${limit}`,
            method: "GET",
          });

          if (itemsResult.error) {
            return {
              data: {
                ...session,
                items: [],
              },
            };
          }

          const items = normalizeArrayPayload<RecommendationItem>(itemsResult.data);

          /* Older builds spell the flag `exploration`; accept either. */
          const normalizedItems: RecommendationItem[] = items.map((item) => ({
            ...item,
            isExploration: item.isExploration ?? item.exploration ?? false,
          }));

          return {
            data: {
              ...session,
              items: normalizedItems,
            },
          };
        };

        // Join an identical request that is already running instead of
        // paying for a second set of LLM calls. See inFlightSessions.
        const key = sessionRequestKey(body);
        const alreadyRunning = inFlightSessions.get(key);
        if (alreadyRunning) {
          return alreadyRunning;
        }

        const pending = runCreateSession();
        inFlightSessions.set(key, pending);

        try {
          return await pending;
        } finally {
          inFlightSessions.delete(key);
        }
      },
    }),

    /**
     * GET /api/v1/recommendations/sessions/{uuid}/safety-checks
     *
     * Per-profile verdicts for a session. Used to explain an empty result:
     * the checks say which profile blocked a dish and why.
     */
    getRecommendationSafetyChecks: builder.query<SafetyCheckDto[], string>({
      query: (sessionUuid) => ({
        url: `/recommendations/sessions/${encodeURIComponent(sessionUuid)}/safety-checks`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<SafetyCheckDto>(response),
    }),
  }),

  overrideExisting: false,
});

export const {
  useCreateRecommendationSessionMutation,
  useGetRecommendationSafetyChecksQuery,
} = recommendationApi;

