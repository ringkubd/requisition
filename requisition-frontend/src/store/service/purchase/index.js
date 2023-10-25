import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const PurchaseApiService = createApi({
    reducerPath: 'purchase',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        prepareHeaders: (headers) => {
            fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL + '/sanctum/csrf-cookie',
                {
                    method: 'GET',
                    credentials: 'include',
                },
            )
            const token = decodeURIComponent(getCookie('XSRF-TOKEN')) // <---- CHANGED
            headers.set('Accept', `application/json`)
            // headers.set('Content-Type', `application/json`)
            headers.set('X-XSRF-TOKEN', token)
            return headers
        },
        credentials: 'include',
    }),
    tagTypes: ['getPurchase', 'editPurchase'],
    endpoints: builder => ({
        getPurchase: builder.query({
            query: () => ({
                url: 'purchases',
            }),
            providesTags: ['getPurchase'],
        }),
        editPurchase: builder.query({
            query: (id) => ({
                url: `purchases/${id}`,
            }),
            providesTags: ['editPurchase'],
        }),
        updatePurchase: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `purchases/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getPurchase', 'editPurchase']
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
            invalidatesTags: ['getPurchase']
        }),
        destroyPurchase: builder.mutation({
            query : (arg) => ({
                url: `purchases/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getPurchase']
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
