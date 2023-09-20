import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const BranchApiService = createApi({
    reducerPath: 'branch',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        prepareHeaders: (headers) => {
            fetch(
              process.env.NEXT_PUBLIC_BACKEND_URL + '/sanctum/csrf-cookie',
              {
                  method: 'GET',
                  credentials: 'include',
              },
            )
            const token = decodeURIComponent(getCookie('XSRF-TOKEN')) // <---- CHANGED
            headers.set('Accept', `application/json`)
            headers.set('Content-Type', `application/json`)
            headers.set('X-XSRF-TOKEN', token)
            return headers
        },
        credentials: 'include',
    }),
    tagTypes: ['getBranch', 'editBranch'],
    endpoints: builder => ({
        getBranch: builder.query({
            query: () => ({
                url: 'branches',
            }),
            providesTags: ['getBranch'],
        }),
        getBranchByOrganization: builder.query({
            query: (organization) => ({
                url: `branches/${organization}/organization`,
            }),
            providesTags: ['getBranch'],
        }),
        editBranch: builder.query({
            query: (id) => ({
                url: `branches/${id}`,
            }),
            providesTags: ['editBranch'],
        }),
        updateBranch: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `branches/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getBranch', 'editBranch']
        }),
        storeBranch: builder.mutation({
            query: arg => ({
                url: 'branches',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getBranch']
        }),
        destroyBranch: builder.mutation({
            query : (arg) => ({
                url: `branches/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getBranch']
        }),
    }),
})

export const {
    useGetBranchQuery,
    useGetBranchByOrganizationQuery,
    useEditBranchQuery,
    useUpdateBranchMutation,
    useStoreBranchMutation,
    useDestroyBranchMutation,
    util: { getRunningQueriesThunk },
} = BranchApiService;

export const {
    getBranch,
    editBranch,
    updateBranch,
    storeBranch,
    destroyBranch,
} = BranchApiService.endpoints;
