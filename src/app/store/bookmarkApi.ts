import { baseApi } from "./baseApi";
import { normalizePageResponse, normalizePayload } from "./utils/normalize";
import type {
  BookmarkResponse,
  CreateBookmarkRequest,
  PageResponse,
} from "@/types/interaction";

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
        return normalizePageResponse<BookmarkResponse>(response);
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
