import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const UserManagementApi = createApi({
  reducerPath: 'user_management',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    prepareHeaders: headers => {
      fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      })
      const token = decodeURIComponent(getCookie('XSRF-TOKEN')) // <---- CHANGED
      headers.set('Accept', `application/json`)
      headers.set('Content-Type', `application/json`)
      headers.set('X-XSRF-TOKEN', token)
      return headers
    },
    credentials: 'include',
  }),
  tagTypes: ['getAllUsers'],
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => ({
        url: 'users',
      }),
      providesTags: ['getAllUsers'],
    }),
    storeUser: builder.mutation({
      query: arg => ({
        url: 'users',
        method: 'POST',
        body: arg
      }),
      invalidatesTags: ['getAllUsers'],
    }),
    editUser: builder.query({
      query: arg => ({
        url: `users/${arg}`
      }),
    }),
    updateUser: builder.mutation({
      query: ({id, ...patch}) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: ['getAllUsers'],
    }),
    destroyUser: builder.mutation({
      query: (arg) => ({
        url: `users/${arg}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['getAllUsers'],
    }),
  }),
})

export  const {
  useGetUsersQuery,
  useEditUserQuery,
  useUpdateUserMutation,
  useDestroyUserMutation,
  useStoreUserMutation,
  util: { getRunningQueriesThunk },
} = UserManagementApi;

export const {
  getUsers
} = UserManagementApi.endpoints;
