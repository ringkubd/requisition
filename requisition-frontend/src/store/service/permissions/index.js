import { onQueryStartedErrorToast } from '@/lib/clientHelper'
import { GeneralBaseAPI } from '@/store/generalBaseAPI'

export const PermissionsApiService = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getPermissions: builder.query({
            query: () => ({
                url: 'permissions',
            }),
            providesTags: ['getPermissions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editPermissions: builder.query({
            query: id => ({
                url: `permissions/${id}`,
            }),
            providesTags: ['editPermissions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updatePermissions: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `permissions/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getPermissions', 'editPermissions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storePermissions: builder.mutation({
            query: arg => {
                console.log(arg.logo)
                return {
                    url: 'permissions',
                    method: 'POST',
                    body: arg,
                }
            },
            invalidatesTags: ['getPermissions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyPermissions: builder.mutation({
            query: arg => ({
                url: `permissions/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getPermissions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetPermissionsQuery,
    useEditPermissionsQuery,
    useUpdatePermissionsMutation,
    useStorePermissionsMutation,
    useDestroyPermissionsMutation,
    util: { getRunningQueriesThunk },
} = PermissionsApiService

export const {
    getPermissions,
    editPermissions,
} = PermissionsApiService.endpoints
