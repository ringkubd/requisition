import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const PurchaseApiService = createApi({
    reducerPath: 'purchase',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getPurchase', 'editPurchase'],
    endpoints: builder => ({
        getPurchase: builder.query({
            query: () => ({
                url: 'purchases',
            }),
            providesTags: ['getPurchase'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editPurchase: builder.query({
            query: (id) => ({
                url: `purchases/${id}`,
            }),
            providesTags: ['editPurchase'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updatePurchase: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `purchases/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getPurchase', 'editPurchase'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storePurchase: builder.mutation({
            query: arg => {
                console.log(arg.logo)
                return {
                    url: 'purchases',
                    method: 'POST',
                    body: arg,
                }
            },
            invalidatesTags: ['getPurchase'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyPurchase: builder.mutation({
            query : (arg) => ({
                url: `purchases/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getPurchase'],
            onQueryStarted: onQueryStartedErrorToast,
        })
    }),
})

export const {
    useGetPurchaseQuery,
    useEditPurchaseQuery,
    useGetPurchaseByOrganizationBranchQuery,
    useUpdatePurchaseMutation,
    useStorePurchaseMutation,
    useDestroyPurchaseMutation,
    util: { getRunningQueriesThunk },
} = PurchaseApiService;

export const {
    getPurchase,
    editPurchase
} = PurchaseApiService.endpoints;
