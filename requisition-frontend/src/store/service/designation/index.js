import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/helpers";

export const DesignationApiService = createApi({
    reducerPath: 'designation',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getDesignation', 'editDesignation'],
    endpoints: builder => ({
        getDesignation: builder.query({
            query: () => ({
                url: 'designations',
            }),
            providesTags: ['getDesignation'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editDesignation: builder.query({
            query: (id) => ({
                url: `designations/${id}`,
            }),
            providesTags: ['editDesignation'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateDesignation: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `designations/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getDesignation', 'editDesignation'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeDesignation: builder.mutation({
            query: arg => ({
                url: 'designations',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getDesignation'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyDesignation: builder.mutation({
            query : (arg) => ({
                url: `designations/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getDesignation'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getDesignationByOrganizationBranch: builder.query({
            query : (arg) => ({
                url: `designation-by-organization-branch`,
                params: arg,
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetDesignationQuery,
    useEditDesignationQuery,
    useGetDesignationByOrganizationBranchQuery,
    useUpdateDesignationMutation,
    useStoreDesignationMutation,
    useDestroyDesignationMutation,
    util: { getRunningQueriesThunk },
} = DesignationApiService;

export const {
    getDesignation,
    editDesignation,
    updateDesignation,
    storeDesignation,
    destroyDesignation,
} = DesignationApiService.endpoints;
