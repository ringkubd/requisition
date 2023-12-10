import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const ProductApiService = createApi({
    reducerPath: 'product',
    baseQuery: CustomBaseQuery,
    tagTypes: ['product', 'editProduct'],
    endpoints: builder => ({
        getProduct: builder.query({
            query: (arg) => ({
                url: 'products',
                params: arg
            }),
            providesTags: ['product'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editProduct: builder.query({
            query: (id) => ({
                url: `products/${id}`,
            }),
            providesTags: ['editProduct'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        singleProduct: builder.query({
            query: (id) => ({
                url: `products/${id}`,
            }),
        }),
        updateProduct: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `products/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['product', 'editProduct'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeProduct: builder.mutation({
            query: arg => ({
                url: 'products',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['product'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyProduct: builder.mutation({
            query : (arg) => ({
                url: `products/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['product'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        report: builder.mutation({
            query: (arg) => ({
                url: `product_report`,
                method: 'GET',
                params: arg
            }),
            onQueryStarted: onQueryStartedErrorToast
        })
    }),
})

export const {
    useGetProductQuery,
    useEditProductQuery,
    useUpdateProductMutation,
    useStoreProductMutation,
    useDestroyProductMutation,
    useSingleProductQuery,
    useReportMutation,
    util: { getRunningQueriesThunk },
} = ProductApiService;

export const {
    getProduct,
    editProduct,
    updateProduct,
    storeProduct,
    destroyProduct,
} = ProductApiService.endpoints;
