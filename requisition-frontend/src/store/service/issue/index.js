import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const IssueApiService = createApi({
    reducerPath: 'issue',
    baseQuery: CustomBaseQuery,
    tagTypes: ['issue', 'editIssue'],
    endpoints: builder => ({
        getIssue: builder.query({
            query: () => ({
                url: 'product-issues',
            }),
            providesTags: ['issue'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editIssue: builder.query({
            query: (id) => ({
                url: `product-issues/${id}`,
            }),
            providesTags: ['editIssue'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateIssue: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `product-issues/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['issue', 'editIssue'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeIssue: builder.mutation({
            query: arg => {
                return {
                    url: 'product-issues',
                    method: 'POST',
                    body: arg,
                }
            },
            invalidatesTags: ['issue'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyIssue: builder.mutation({
            query : (arg) => ({
                url: `product-issues/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['issue'],
            onQueryStarted: onQueryStartedErrorToast,
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
