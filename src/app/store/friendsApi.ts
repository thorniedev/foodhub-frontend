import { baseApi } from "./baseApi";
import type {
  FriendDto,
  FriendRequestDto,
  FriendQrCodeResponse,
  SendFriendRequestPayload,
  ScanFriendQrPayload,
  FriendActionResponse,
} from "@/types/friends";

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

export const friendsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/v1/friends */
    getFriends: builder.query<FriendDto[], void>({
      query: () => ({
        url: "/friends",
        method: "GET",
      }),
      transformResponse: (response: unknown): FriendDto[] => {
        const payload = normalizePayload(response, []);
        return Array.isArray(payload) ? payload : [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ userUuid }) => ({
                type: "Friends" as const,
                id: userUuid,
              })),
              { type: "Friends", id: "LIST" },
            ]
          : [{ type: "Friends", id: "LIST" }],
    }),

    /** DELETE /api/v1/friends/{friendUserUuid} */
    deleteFriend: builder.mutation<FriendActionResponse, string>({
      query: (friendUserUuid) => ({
        url: `/friends/${encodeURIComponent(friendUserUuid)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown): FriendActionResponse => {
        return normalizePayload(response, { success: true });
      },
      invalidatesTags: [{ type: "Friends", id: "LIST" }],
    }),

    /** GET /api/v1/friends/requests/incoming */
    getIncomingRequests: builder.query<FriendRequestDto[], void>({
      query: () => ({
        url: "/friends/requests/incoming",
        method: "GET",
      }),
      transformResponse: (response: unknown): FriendRequestDto[] => {
        const payload = normalizePayload(response, []);
        return Array.isArray(payload) ? payload : [];
      },
      providesTags: [{ type: "Friends", id: "INCOMING" }],
    }),

    /** GET /api/v1/friends/requests/outgoing */
    getOutgoingRequests: builder.query<FriendRequestDto[], void>({
      query: () => ({
        url: "/friends/requests/outgoing",
        method: "GET",
      }),
      transformResponse: (response: unknown): FriendRequestDto[] => {
        const payload = normalizePayload(response, []);
        return Array.isArray(payload) ? payload : [];
      },
      providesTags: [{ type: "Friends", id: "OUTGOING" }],
    }),

    /** POST /api/v1/friends/requests */
    sendFriendRequest: builder.mutation<FriendRequestDto, SendFriendRequestPayload>({
      query: (body) => ({
        url: "/friends/requests",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): FriendRequestDto => {
        return normalizePayload(response, {} as FriendRequestDto);
      },
      invalidatesTags: [{ type: "Friends", id: "OUTGOING" }],
    }),

    /** POST /api/v1/friends/requests/{requestUuid}/accept */
    acceptFriendRequest: builder.mutation<FriendActionResponse, string>({
      query: (requestUuid) => ({
        url: `/friends/requests/${encodeURIComponent(requestUuid)}/accept`,
        method: "POST",
      }),
      transformResponse: (response: unknown): FriendActionResponse => {
        return normalizePayload(response, { success: true });
      },
      invalidatesTags: [
        { type: "Friends", id: "LIST" },
        { type: "Friends", id: "INCOMING" },
      ],
    }),

    /** POST /api/v1/friends/requests/{requestUuid}/reject */
    rejectFriendRequest: builder.mutation<FriendActionResponse, string>({
      query: (requestUuid) => ({
        url: `/friends/requests/${encodeURIComponent(requestUuid)}/reject`,
        method: "POST",
      }),
      transformResponse: (response: unknown): FriendActionResponse => {
        return normalizePayload(response, { success: true });
      },
      invalidatesTags: [{ type: "Friends", id: "INCOMING" }],
    }),

    /** GET /api/v1/friends/qr */
    getMyQrCode: builder.query<FriendQrCodeResponse, void>({
      query: () => ({
        url: "/friends/qr",
        method: "GET",
      }),
      transformResponse: (response: unknown): FriendQrCodeResponse => {
        return normalizePayload(response, {} as FriendQrCodeResponse);
      },
      providesTags: [{ type: "Friends", id: "QR" }],
    }),

    /** POST /api/v1/friends/qr/refresh */
    refreshQrCode: builder.mutation<FriendQrCodeResponse, void>({
      query: () => ({
        url: "/friends/qr/refresh",
        method: "POST",
      }),
      transformResponse: (response: unknown): FriendQrCodeResponse => {
        return normalizePayload(response, {} as FriendQrCodeResponse);
      },
      invalidatesTags: [{ type: "Friends", id: "QR" }],
    }),

    /** POST /api/v1/friends/qr/scan */
    scanQrCode: builder.mutation<FriendActionResponse, ScanFriendQrPayload>({
      query: (body) => ({
        url: "/friends/qr/scan",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): FriendActionResponse => {
        return normalizePayload(response, { success: true });
      },
      invalidatesTags: [{ type: "Friends", id: "OUTGOING" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFriendsQuery,
  useDeleteFriendMutation,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useGetMyQrCodeQuery,
  useRefreshQrCodeMutation,
  useScanQrCodeMutation,
} = friendsApi;
