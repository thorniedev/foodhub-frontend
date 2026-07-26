<<<<<<< HEAD
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your data types
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// Create API
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_API_URL || "https://jsonplaceholder.typicode.com",
  }),
  tagTypes: ["Post", "User"],
  endpoints: (builder) => ({
    // QUERIES (GET requests)
    getPosts: builder.query<Post[], void>({
      query: () => "/posts",
      providesTags: ["Post"],
    }),

    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),

    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // MUTATIONS (POST, PUT, PATCH, DELETE)
    createPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Post"],
    }),

    updatePost: builder.mutation<Post, { id: number; body: Partial<Post> }>({
      query: ({ id, body }) => ({
        url: `/posts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Post", id },
        "Post",
      ],
    }),

    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = api;
=======
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Define your data types
// export interface Post {
//   id: number;
//   userId: number;
//   title: string;
//   body: string;
// }

// export interface User {
//   id: number;
//   name: string;
//   email: string;
// }

// // Create API
// export const api = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl:
//       process.env.NEXT_PUBLIC_API_URL || "https://jsonplaceholder.typicode.com",
//   }),
//   tagTypes: ["Post", "User"],
//   endpoints: (builder) => ({
//     // QUERIES (GET requests)
//     getPosts: builder.query<Post[], void>({
//       query: () => "/posts",
//       providesTags: ["Post"],
//     }),

//     getPostById: builder.query<Post, number>({
//       query: (id) => `/posts/${id}`,
//       providesTags: (result, error, id) => [{ type: "Post", id }],
//     }),

//     getUsers: builder.query<User[], void>({
//       query: () => "/users",
//       providesTags: ["User"],
//     }),

//     getUserById: builder.query<User, number>({
//       query: (id) => `/users/${id}`,
//       providesTags: (result, error, id) => [{ type: "User", id }],
//     }),

//     // MUTATIONS (POST, PUT, PATCH, DELETE)
//     createPost: builder.mutation<Post, Partial<Post>>({
//       query: (body) => ({
//         url: "/posts",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Post"],
//     }),

//     updatePost: builder.mutation<Post, { id: number; body: Partial<Post> }>({
//       query: ({ id, body }) => ({
//         url: `/posts/${id}`,
//         method: "PATCH",
//         body,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: "Post", id },
//         "Post",
//       ],
//     }),

//     deletePost: builder.mutation<void, number>({
//       query: (id) => ({
//         url: `/posts/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["Post"],
//     }),
//   }),
// });

// // Export hooks for usage in components
// export const {
//   useGetPostsQuery,
//   useGetPostByIdQuery,
//   useGetUsersQuery,
//   useGetUserByIdQuery,
//   useCreatePostMutation,
//   useUpdatePostMutation,
//   useDeletePostMutation,
// } = api;
>>>>>>> d1cdd83bd745a3a0f98e4be08cf8aa4555ae8915
