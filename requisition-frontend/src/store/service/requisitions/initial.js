import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { BaseAPI } from "@/store/service/requisitions/BaseAPI";

export const InitialRequisitionApi = BaseAPI.injectEndpoints({
    endpoints: build => ({
        getInitialRequisition: build.query({
            query: (params) => ({
                url: 'initial-requisitions',
                params,
            }),
            providesTags: ['initial-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editInitialRequisition: build.query({
            query: (id) => ({
                url: `initial-requisitions/${id}`
            }),
            providesTags: ['edit-initial-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateInitialRequisition: build.mutation({
            query: ({id, ...patch}) => ({
                url: `initial-requisitions/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['initial-requisition', 'edit-initial-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeInitialRequisition: build.mutation({
            query: arg => ({
                url: 'initial-requisitions',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['initial-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyInitialRequisition: build.mutation({
            query : (arg) => ({
                url: `initial-requisitions/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['initial-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getPurposeSuggestion: build.query({
            query: (arg) => ({
                url: 'initial_requisition_product_suggestions',
                method: 'GET',
                params: arg
            }),
            onQueryStarted: onQueryStartedErrorToast,
        })
    }),
})

export const {
    useGetInitialRequisitionQuery,
    useEditInitialRequisitionQuery,
    useUpdateInitialRequisitionMutation,
    useStoreInitialRequisitionMutation,
    useDestroyInitialRequisitionMutation,
    useGetPurposeSuggestionQuery,
    util: { getRunningQueriesThunk },
} = InitialRequisitionApi;

export const {
    getInitialRequisition,
    editInitialRequisition
} = InitialRequisitionApi.endpoints;
