import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const IssueItemApiService = createApi({
    reducerPath: 'issue_items',
    baseQuery: CustomBaseQuery,
    tagTypes: ['issue_item', 'edit_issue_item'],
    endpoints: builder => ({
        getIssueItems: builder.query({
            query: (arg) => ({
                url: 'product-issue-items',
                params: arg
            }),
            providesTags: ['issue_item'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editIssueItem: builder.query({
            query: (id) => ({
                url: `product-issue-items/${id}`,
            }),
            providesTags: ['edit_issue_item'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateIssueItem: builder.mutation({
            query: ({...id, arg}) => ({
                url: `product-issue-items/${id}`,
                method: 'PUT',
                body: arg
            }),
            providesTags: ['edit_issue_item'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useUpdateIssueQuantityMutation,
    util: { getRunningQueriesThunk },
} = IssueItemApiService;

export const {
    getIssue,
    editIssue
} = IssueItemApiService.endpoints;
