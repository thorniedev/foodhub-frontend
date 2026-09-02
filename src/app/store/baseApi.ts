import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",

  credentials: "include",

  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");

    return headers;
  },
});

function getRequestUrl(args: string | FetchArgs) {
  return typeof args === "string" ? args : args.url;
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const requestUrl = getRequestUrl(args);

  /*
   * Session check is allowed to represent
   * a logged-out user.
   *
   * Never start refresh/login behavior
   * because of /auth/session.
   */
  if (requestUrl === "/auth/session") {
    return result;
  }

  /*
   * Only handle actual 401 responses.
   */
  if (result.error?.status !== 401) {
    return result;
  }

  console.log("[FOODHUB AUTH] 401 received:", requestUrl);

  /*
   * Try refresh.
   */
  const refreshResult = await rawBaseQuery(
    {
      url: "/auth/refresh",
      method: "POST",
    },
    api,
    extraOptions,
  );

  /*
   * Refresh successful.
   */
  if (!refreshResult.error) {
    console.log("[FOODHUB AUTH] Token refreshed.");

    result = await rawBaseQuery(args, api, extraOptions);

    return result;
  }

  console.warn("[FOODHUB AUTH] Refresh failed.");

  /*
   * IMPORTANT:
   *
   * Do NOT redirect users away from
   * public pages.
   */
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;

    /*
     * Only redirect when currently
     * inside protected dashboard.
     */
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const currentPath = window.location.pathname + window.location.search;

      window.location.replace(
        `/login?returnTo=${encodeURIComponent(currentPath)}`,
      );
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Auth",
    "User",
    "Food",
    "MenuItem",
    "NearbyStore",
    "GroupRecommendation",
    "GroupVoting",
    "Profile",
    "MemberProfile",
    "SavedLocation",
    "Friends",
    "Bookmark",
    "InteractionHistory",
    "Notification",
    "NotificationPreference",
    "MealReminderSetting",
    "PushSubscription",
    "ProximityNotification",
    "Banner"
  ],

  endpoints: () => ({}),
});
