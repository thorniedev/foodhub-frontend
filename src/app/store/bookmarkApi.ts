import { baseApi } from "./baseApi";
import type {
  BookmarkResponse,
  CreateBookmarkRequest,
  PageResponse,
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

export interface GetBookmarksParams {
  profileUuid: string;
  page?: number;
  size?: number;
}

export interface CreateBookmarkPayload extends CreateBookmarkRequest {
  profileUuid: string;
}

export interface DeleteBookmarkPayload {
  profileUuid: string;
  bookmarkUuid: string;
}

export const bookmarkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/v1/profiles/{profileUuid}/bookmarks */
    getBookmarks: builder.query<PageResponse<BookmarkResponse>, GetBookmarksParams>({
      query: ({ profileUuid, page = 0, size = 20 }) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}/bookmarks`,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (response: unknown): PageResponse<BookmarkResponse> => {
        const raw = normalizePayload(response, {} as PageResponse<BookmarkResponse>);
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
      providesTags: (_result, _error, { profileUuid }) => [
        { type: "Bookmark", id: profileUuid },
        { type: "Bookmark", id: "LIST" },
      ],
    }),

    /** POST /api/v1/profiles/{profileUuid}/bookmarks */
    createBookmark: builder.mutation<BookmarkResponse, CreateBookmarkPayload>({
      query: ({ profileUuid, ...body }) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}/bookmarks`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): BookmarkResponse => {
        return normalizePayload(response, {} as BookmarkResponse);
      },
      invalidatesTags: (_result, _error, { profileUuid }) => [
        { type: "Bookmark", id: profileUuid },
        { type: "Bookmark", id: "LIST" },
      ],
    }),

    /** DELETE /api/v1/profiles/{profileUuid}/bookmarks/{bookmarkUuid} */
    deleteBookmark: builder.mutation<void, DeleteBookmarkPayload>({
      query: ({ profileUuid, bookmarkUuid }) => ({
        url: `/profiles/${encodeURIComponent(profileUuid)}/bookmarks/${encodeURIComponent(bookmarkUuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { profileUuid }) => [
        { type: "Bookmark", id: profileUuid },
        { type: "Bookmark", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBookmarksQuery,
  useCreateBookmarkMutation,
  useDeleteBookmarkMutation,
} = bookmarkApi;
