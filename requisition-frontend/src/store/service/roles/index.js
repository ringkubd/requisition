import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const RolesApiService = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getRoles: builder.query({
            query: () => ({
                url: 'roles',
            }),
            providesTags: ['getRoles'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editRoles: builder.query({
            query: (id) => ({
                url: `roles/${id}`,
            }),
            providesTags: ['editRoles'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateRoles: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `roles/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getRoles', 'editRoles'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeRoles: builder.mutation({
            query: arg => {
                console.log(arg.logo)
                return {
                    url: 'roles',
                    method: 'POST',
                    body: arg,
                }
            },
            invalidatesTags: ['getRoles'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyRoles: builder.mutation({
            query : (arg) => ({
                url: `roles/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getRoles'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getPermissionsForRole: builder.query({
            query: (arg) => ({
                url: 'permission_for_role'
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateRolePermission: builder.mutation({
            query: ({id, ...params}) => ({
                url: `role_permission_update/${id}`,
                method: 'POST',
                body: {
                    ...params,
                    id
                }
            })
        }),
        onQueryStarted: onQueryStartedErrorToast,
    }),
})

export const {
    useGetRolesQuery,
    useEditRolesQuery,
    useUpdateRolesMutation,
    useStoreRolesMutation,
    useDestroyRolesMutation,
    useGetPermissionsForRoleQuery,
    useUpdateRolePermissionMutation,
    util: { getRunningQueriesThunk },
} = RolesApiService;

export const {
    getRoles,
    editRoles
} = RolesApiService.endpoints;
