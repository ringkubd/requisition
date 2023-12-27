import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const PurchaseRequisitionApi = createApi({
    reducerPath: 'purchase-requisition',
    baseQuery: CustomBaseQuery,
    tagTypes: ['purchase-requisition', 'edit-purchase-requisition', 'get-initial-requisition-for-purchase'],
    endpoints: build => ({
        getPurchaseRequisition: build.query({
            query: (arg) => ({
                url: 'purchase-requisitions',
                params: arg
            }),
            providesTags: ['purchase-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editPurchaseRequisition: build.query({
            query: (id) => ({
                url: `purchase-requisitions/${id}`
            }),
            providesTags: ['edit-purchase-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updatePurchaseRequisition: build.mutation({
            query: ({id, ...patch}) => ({
                url: `purchase-requisitions/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['purchase-requisition', 'edit-purchase-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storePurchaseRequisition: build.mutation({
            query: arg => ({
                url: 'purchase-requisitions',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['purchase-requisition', 'get-initial-requisition-for-purchase'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyPurchaseRequisition: build.mutation({
            query : (arg) => ({
                url: `purchase-requisitions/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['purchase-requisition', 'get-initial-requisition-for-purchase'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        lastPurchaseInformation: build.query({
            query: (arg) => ({
                url: 'last-purchase-information',
                method: 'GET',
                body: arg
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getInitialRequisitionForPurchase: build.query({
            query: () => ({
                url: 'initial_requisition_for_initiate_purchase',
                method: 'GET'
            }),
            providesTags: ['get-initial-requisition-for-purchase'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updatePurchaseRequisitionPrice: build.mutation({
            query: (arg) => ({
                url: 'update_purchase_requisition_product_price',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['purchase-requisition', 'edit-purchase-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        })
    }),
})

export const {
    useGetPurchaseRequisitionQuery,
    useEditPurchaseRequisitionQuery,
    useUpdatePurchaseRequisitionMutation,
    useStorePurchaseRequisitionMutation,
    useDestroyPurchaseRequisitionMutation,
    useLastPurchaseInformationQuery,
    useGetInitialRequisitionForPurchaseQuery,
    useUpdatePurchaseRequisitionPriceMutation,
    util: { getRunningQueriesThunk },
} = PurchaseRequisitionApi;

export const {
    getPurchaseRequisition,
    editPurchaseRequisition
} = PurchaseRequisitionApi.endpoints;
