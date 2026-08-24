import { baseApi } from "./baseApi";
import type {
  InteractionEventResponse,
  InteractionEventType,
  PageResponse,
  RecordInteractionRequest,
} from "@/types/interaction";

function normalizePayload<T>(response: unknown, fallback: T): T {
  if (response === null || response === undefined) {
    return fallback;
  }
  if (typeof response === "object") {
    const raw = response as Record<string, unknown>;
    if (raw.payload !== undefined) {
      return raw.payload as T;
    }
    if (raw.data !== undefined) {
      return raw.data as T;
    }
  }
  return response as T;
}

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
        const raw = normalizePayload(response, {} as PageResponse<InteractionEventResponse>);
        return {
          contents: Array.isArray(raw.contents)
            ? raw.contents
            : Array.isArray((raw as any).content)
            ? (raw as any).content
            : Array.isArray(raw)
            ? raw
            : [],
          pageNumber: raw.pageNumber ?? (raw as any).number ?? 0,
          pageSize: raw.pageSize ?? (raw as any).size ?? 20,
          totalElements: raw.totalElements ?? (raw as any).total ?? 0,
          totalPages: raw.totalPages ?? 1,
          first: raw.first ?? true,
          last: raw.last ?? true,
        };
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
