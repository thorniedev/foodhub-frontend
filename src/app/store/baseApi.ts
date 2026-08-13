// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const baseApi = createApi({
//   reducerPath: "api",

//   baseQuery: fetchBaseQuery({
//     baseUrl: "/api",
//     credentials: "include",
//     prepareHeaders: (headers) => {
//       headers.set("Accept", "application/json");
//       return headers;
//     },
//   }),

//   tagTypes: [
//     "Auth",
//     "User",
//     "Food",
//     "MenuItem",
//     "NearbyStore",
//     "GroupRecommendation",
//     "GroupVoting",
//     "Profile",
//     "MemberProfile",
//   ],

//   endpoints: () => ({}),
// });
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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    console.log("[FOODHUB AUTH] Access token rejected. Trying refresh...");

    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (!refreshResult.error) {
      console.log("[FOODHUB AUTH] Token refreshed. Retrying request...");

      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.warn("[FOODHUB AUTH] Refresh failed.");

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;

        window.location.replace(
          `/login?returnTo=${encodeURIComponent(currentPath)}`,
        );
      }
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
  ],

  endpoints: () => ({}),
});
