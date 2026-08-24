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

function normalizeArrayPayload<T>(response: unknown): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];

  if (typeof response === "object") {
    const raw = response as Record<string, unknown>;

    // Case 1: response.payload is array or object with content
    if (raw.payload) {
      if (Array.isArray(raw.payload)) return raw.payload as T[];
      if (typeof raw.payload === "object") {
        const pObj = raw.payload as Record<string, unknown>;
        if (Array.isArray(pObj.content)) return pObj.content as T[];
        if (Array.isArray(pObj.contents)) return pObj.contents as T[];
      }
    }

    // Case 2: response.content or response.contents
    if (Array.isArray(raw.content)) return raw.content as T[];
    if (Array.isArray(raw.contents)) return raw.contents as T[];

    // Case 3: response.data
    if (raw.data) {
      if (Array.isArray(raw.data)) return raw.data as T[];
      if (typeof raw.data === "object") {
        const dObj = raw.data as Record<string, unknown>;
        if (Array.isArray(dObj.content)) return dObj.content as T[];
        if (Array.isArray(dObj.contents)) return dObj.contents as T[];
      }
    }
  }

  return [];
}

export interface GetFriendsParams {
  page?: number;
  size?: number;
}

export const friendsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/v1/friends?page=0&size=20 */
    getFriends: builder.query<FriendDto[], GetFriendsParams | void>({
      query: (params) => ({
        url: "/friends",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 50,
        },
      }),
      transformResponse: (response: unknown): FriendDto[] => {
        return normalizeArrayPayload<FriendDto>(response);
      },
      providesTags: (result) =>
        result && result.length > 0
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
      invalidatesTags: [
        { type: "Friends", id: "LIST" },
        { type: "Friends", id: "INCOMING" },
        { type: "Friends", id: "OUTGOING" },
      ],
    }),

    /** GET /api/v1/friends/requests/incoming?page=0&size=20 */
    getIncomingRequests: builder.query<FriendRequestDto[], GetFriendsParams | void>({
      query: (params) => ({
        url: "/friends/requests/incoming",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 50,
        },
      }),
      transformResponse: (response: unknown): FriendRequestDto[] => {
        return normalizeArrayPayload<FriendRequestDto>(response);
      },
      providesTags: [{ type: "Friends", id: "INCOMING" }],
    }),

    /** GET /api/v1/friends/requests/outgoing?page=0&size=20 */
    getOutgoingRequests: builder.query<FriendRequestDto[], GetFriendsParams | void>({
      query: (params) => ({
        url: "/friends/requests/outgoing",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 50,
        },
      }),
      transformResponse: (response: unknown): FriendRequestDto[] => {
        return normalizeArrayPayload<FriendRequestDto>(response);
      },
      providesTags: [{ type: "Friends", id: "OUTGOING" }],
    }),

    /** POST /api/v1/friends/requests */
    sendFriendRequest: builder.mutation<FriendRequestDto, SendFriendRequestPayload>({
      query: (body) => {
        const friendUsername = body.friendUsername || body.receiverUsername;
        const friendUserUuid = body.friendUserUuid || body.receiverUuid;
        return {
          url: "/friends/requests",
          method: "POST",
          body: {
            ...(friendUsername ? { friendUsername } : {}),
            ...(friendUserUuid ? { friendUserUuid } : {}),
          },
        };
      },
      transformResponse: (response: unknown): FriendRequestDto => {
        return normalizePayload(response, {} as FriendRequestDto);
      },
      invalidatesTags: [
        { type: "Friends", id: "LIST" },
        { type: "Friends", id: "OUTGOING" },
      ],
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
        { type: "Friends", id: "OUTGOING" },
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
      invalidatesTags: [
        { type: "Friends", id: "INCOMING" },
        { type: "Friends", id: "OUTGOING" },
      ],
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
        body: {
          qrCodeToken: body.qrCodeToken,
        },
      }),
      transformResponse: (response: unknown): FriendActionResponse => {
        return normalizePayload(response, { success: true });
      },
      invalidatesTags: [
        { type: "Friends", id: "LIST" },
        { type: "Friends", id: "OUTGOING" },
        { type: "Friends", id: "INCOMING" },
      ],
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
