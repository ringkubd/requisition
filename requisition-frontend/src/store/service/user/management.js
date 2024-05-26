import { onQueryStartedErrorToast } from '@/lib/clientHelper'
import { GeneralBaseAPI } from '@/store/generalBaseAPI'

export const UserManagementApi = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: arg => ({
                url: 'users',
                params: arg,
            }),
            providesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeUser: builder.mutation({
            query: arg => ({
                url: 'users',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editUser: builder.query({
            query: arg => ({
                url: `users/${arg}`,
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateUser: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `users/${id}`,
                method: 'PATCH',
                body: patch,
            }),
            invalidatesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyUser: builder.mutation({
            query: arg => ({
                url: `users/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getAllUsers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        oneTimeLogin: builder.mutation({
            query: arg => ({
                url: 'one_time_login',
                method: 'POST',
                body: arg,
            }),
        }),
    }),
})

export const {
    useGetUsersQuery,
    useEditUserQuery,
    useUpdateUserMutation,
    useDestroyUserMutation,
    useStoreUserMutation,
    useOneTimeLoginMutation,
    util: { getRunningQueriesThunk },
} = UserManagementApi

export const { getUsers } = UserManagementApi.endpoints
