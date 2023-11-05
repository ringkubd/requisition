import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";

export const InitialRequisitionApi = createApi({
    reducerPath: 'initial-requisition',
    baseQuery: CustomBaseQuery,
    tagTypes: ['initial-requisition', 'edit-initial-requisition'],
    endpoints: build => ({
        getInitialRequisition: build.query({
            query: () => ({
                url: 'initial-requisitions'
            }),
            providesTags: ['initial-requisition']
        }),
        editInitialRequisition: build.query({
            query: (id) => ({
                url: `initial-requisitions/${id}`
            }),
            providesTags: ['edit-initial-requisition']
        }),
        updateInitialRequisition: build.mutation({
            query: ({id, ...patch}) => ({
                url: `initial-requisitions/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['initial-requisition', 'edit-initial-requisition']
        }),
        storeInitialRequisition: build.mutation({
            query: arg => ({
                url: 'initial-requisitions',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['initial-requisition']
        }),
        destroyInitialRequisition: build.mutation({
            query : (arg) => ({
                url: `initial-requisitions/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['initial-requisition']
        }),
        lastPurchaseInformation: build.query({
            query: (arg) => ({
                url: 'last-purchase-information',
                method: 'GET',
                body: arg
            })
        }),
        getPurposeSuggestion: build.query({
            query: (arg) => ({
                url: 'initial_requisition_product_suggestions',
                method: 'GET',
                params: arg
            })
        })
    }),
})

export const {
    useGetInitialRequisitionQuery,
    useEditInitialRequisitionQuery,
    useUpdateInitialRequisitionMutation,
    useStoreInitialRequisitionMutation,
    useDestroyInitialRequisitionMutation,
    useLastPurchaseInformationQuery,
    useGetPurposeSuggestionQuery,
    util: { getRunningQueriesThunk },
} = InitialRequisitionApi;

export const {
    getInitialRequisition,
    editInitialRequisition
} = InitialRequisitionApi.endpoints;
