import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "",
  }),

  tagTypes: ["Food", "Store", "User"],

  endpoints: () => ({}),
});
