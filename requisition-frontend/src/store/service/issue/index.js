import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";

export const IssueApiService = createApi({
    reducerPath: 'issue',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getIssue', 'editIssue'],
    endpoints: builder => ({
        getIssue: builder.query({
            query: () => ({
                url: 'product-issues',
            }),
            providesTags: ['getIssue'],
        }),
        editIssue: builder.query({
            query: (id) => ({
                url: `product-issues/${id}`,
            }),
            providesTags: ['editIssue'],
        }),
        updateIssue: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `product-issues/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getIssue', 'editIssue']
        }),
        storeIssue: builder.mutation({
            query: arg => {
                return {
                    url: 'product-issues',
                    method: 'POST',
                    body: arg,
                }
            },
            invalidatesTags: ['getIssue']
        }),
        destroyIssue: builder.mutation({
            query : (arg) => ({
                url: `product-issues/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getIssue']
        })
    }),
})

export const {
    useGetIssueQuery,
    useEditIssueQuery,
    useGetIssueByOrganizationBranchQuery,
    useUpdateIssueMutation,
    useStoreIssueMutation,
    useDestroyIssueMutation,
    util: { getRunningQueriesThunk },
} = IssueApiService;

export const {
    getIssue,
    editIssue
} = IssueApiService.endpoints;
