import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),

  tagTypes: [
    "Auth",
    "User",
    "Food",
    "MenuItem",
    "NearbyStore",
    "GroupRecommendation",
    "GroupVoting",
    "Profile",
  ],

  endpoints: () => ({}),
});
