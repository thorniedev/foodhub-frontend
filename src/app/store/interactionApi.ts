import { baseApi } from "./baseApi";
import { normalizePageResponse, normalizePayload } from "./utils/normalize";
import type {
  InteractionEventResponse,
  InteractionEventType,
  PageResponse,
  RecordInteractionRequest,
} from "@/types/interaction";

export interface GetInteractionHistoryParams {
  eventType?: InteractionEventType;
  page?: number;
  size?: number;
}

export const interactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** POST /api/v1/interactions */
    recordInteraction: builder.mutation<InteractionEventResponse, RecordInteractionRequest>({
      query: (body) => ({
        url: "/interactions",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): InteractionEventResponse => {
        return normalizePayload(response, {} as InteractionEventResponse);
      },
      invalidatesTags: ["InteractionHistory"],
    }),

    /** GET /api/v1/interactions/history */
    getInteractionHistory: builder.query<
      PageResponse<InteractionEventResponse>,
      GetInteractionHistoryParams | void
    >({
      query: (params) => ({
        url: "/interactions/history",
        method: "GET",
        params: {
          eventType: params?.eventType ?? "VIEW",
          page: params?.page ?? 0,
          size: params?.size ?? 20,
        },
      }),
      transformResponse: (response: unknown): PageResponse<InteractionEventResponse> => {
        return normalizePageResponse<InteractionEventResponse>(response);
      },
      providesTags: ["InteractionHistory"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRecordInteractionMutation,
  useGetInteractionHistoryQuery,
} = interactionApi;
