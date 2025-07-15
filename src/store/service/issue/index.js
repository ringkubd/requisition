import { onQueryStartedErrorToast } from '@/lib/clientHelper'
import { GeneralBaseAPI } from '@/store/generalBaseAPI'

export const IssueApiService = GeneralBaseAPI.injectEndpoints( {
    endpoints: builder => ( {
        getIssue: builder.query( {
            query: arg => ( {
                url: 'product-issues',
                params: arg,
            } ),
            providesTags: [ 'issue' ],
            onQueryStarted: onQueryStartedErrorToast,
        } ),
        editIssue: builder.query( {
            query: id => ( {
                url: `product-issues/${id}`,
            } ),
            providesTags: [ 'editIssue' ],
            onQueryStarted: onQueryStartedErrorToast,
        } ),
        updateIssue: builder.mutation( {
            query: ( { uuid, ...patch } ) => ( {
                url: `product-issues/${uuid}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            } ),
            invalidatesTags: [ 'issue', 'editIssue' ],
            onQueryStarted: onQueryStartedErrorToast,
        } ),
        storeIssue: builder.mutation( {
            query: arg =>
            {
                return {
                    url: 'product-issues',
                    method: 'POST',
                    body: arg,
                }
            },
            invalidatesTags: [ 'issue' ],
            onQueryStarted: onQueryStartedErrorToast,
        } ),
        destroyIssue: builder.mutation( {
            query: arg => ( {
                url: `product-issues/${arg}`,
                method: 'DELETE',
            } ),
            invalidatesTags: [ 'issue' ],
            onQueryStarted: onQueryStartedErrorToast,
        } ),
        updateIssueQuantity: builder.mutation( {
            query: ( { id, ...patch } ) => ( {
                url: `product-issues-quantity-update/${id}`,
                method: 'PUT',
                body: patch,
            } ),
            invalidatesTags: [ 'issue', 'editIssue' ],
            onQueryStarted: onQueryStartedErrorToast,
        } ),
        syncProductIssues: builder.mutation( {
            query: ( { productIssue, body } ) => ( {
                url: `product-issues/${productIssue}/sync-items`,
                method: 'PUT',
                body: body,
            } ),
            invalidatesTags: [ 'issue' ],
            onQueryStarted: onQueryStartedErrorToast,
        } ),
    } ),
} )

export const {
    useGetIssueQuery,
    useEditIssueQuery,
    useUpdateIssueMutation,
    useStoreIssueMutation,
    useDestroyIssueMutation,
    useUpdateIssueQuantityMutation,
    useSyncProductIssuesMutation,
    util: { getRunningQueriesThunk },
} = IssueApiService

export const { getIssue, editIssue } = IssueApiService.endpoints
