import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const IssueItemApiService = GeneralBaseAPI.injectEndpoints({
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
