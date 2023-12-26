import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const UserManagementApi = createApi({
    reducerPath: 'user_management',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getAllUsers'],
    endpoints: builder => ({
        getUsers: builder.query({
            query: (arg) => ({
                url: 'users',
                params: arg
            }),
            providesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeUser: builder.mutation({
            query: arg => ({
                url: 'users',
                method: 'POST',
                body: arg
            }),
            invalidatesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editUser: builder.query({
            query: arg => ({
                url: `users/${arg}`
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateUser: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `users/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyUser: builder.mutation({
            query: (arg) => ({
                url: `users/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
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
