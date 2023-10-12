import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const PurchaseRequisitionApi = createApi({
    reducerPath: 'purchase-requisition',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        prepareHeaders: headers => {
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
    tagTypes: ['purchase-requisition', 'edit-purchase-requisition', 'get-initial-requisition-for-purchase'],
    endpoints: build => ({
        getPurchaseRequisition: build.query({
            query: () => ({
                url: 'purchase-requisitions'
            }),
            providesTags: ['purchase-requisition']
        }),
        editPurchaseRequisition: build.query({
            query: (id) => ({
                url: `purchase-requisitions/${id}`
            }),
            providesTags: ['edit-purchase-requisition']
        }),
        updatePurchaseRequisition: build.mutation({
            query: ({id, ...patch}) => ({
                url: `purchase-requisitions/${id}`,
                method: 'PATCH'
            }),
            invalidatesTags: ['purchase-requisition', 'edit-purchase-requisition']
        }),
        storePurchaseRequisition: build.mutation({
            query: arg => ({
                url: 'purchase-requisitions',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['purchase-requisition', 'get-initial-requisition-for-purchase', 'initial-requisition']
        }),
        destroyPurchaseRequisition: build.mutation({
            query : (arg) => ({
                url: `purchase-requisitions/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['purchase-requisition', 'get-initial-requisition-for-purchase']
        }),
        lastPurchaseInformation: build.query({
            query: (arg) => ({
                url: 'last-purchase-information',
                method: 'GET',
                body: arg
            })
        }),
        getInitialRequisitionForPurchase: build.query({
            query: () => ({
                url: 'initial_requisition_for_initiate_purchase',
                method: 'GET'
            }),
            providesTags: ['get-initial-requisition-for-purchase']
        }),
        updatePurchaseRequisitionPrice: build.mutation({
            query: (arg) => ({
                url: 'update_purchase_requisition_product_price',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['purchase-requisition', 'edit-purchase-requisition']
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
