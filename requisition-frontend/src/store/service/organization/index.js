import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/helpers";

export const OrganizationApiService = createApi({
    reducerPath: 'organization',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getOrganization'],
    endpoints: builder => ({
        getOrganization: builder.query({
            query: () => ({
                url: 'organization',
            }),
            providesTags: ['getOrganization'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editOrganization: builder.query({
            query: (id) => ({
                url: `organization/${id}`,
            }),
            providesTags: ['editOrganization'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateOrganization: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `organization/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getOrganization', 'editOrganization'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeOrganization: builder.mutation({
            query: arg => ({
                url: 'organization',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getOrganization'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyOrganization: builder.mutation({
            query : (arg) => ({
                url: `organization/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getOrganization'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetOrganizationQuery,
    useEditOrganizationQuery,
    useUpdateOrganizationMutation,
    useStoreOrganizationMutation,
    useDestroyOrganizationMutation,
    util: { getRunningQueriesThunk },
} = OrganizationApiService;

export const {
    getOrganization,
    editOrganization,
    updateOrganization,
    storeOrganization,
    destroyOrganization,
} = OrganizationApiService.endpoints;
