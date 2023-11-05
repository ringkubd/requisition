import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";

export const UserManagementApi = createApi({
  reducerPath: 'user_management',
  baseQuery: CustomBaseQuery,
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
