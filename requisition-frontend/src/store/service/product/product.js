import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const ProductApiService = createApi({
    reducerPath: 'product',
    baseQuery: CustomBaseQuery,
    tagTypes: ['product', 'editProduct', 'productIssue', 'productPurchase'],
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
                url: `report/product`,
                method: 'GET',
                params: arg
            }),
            onQueryStarted: onQueryStartedErrorToast
        }),
        productIssueLog: builder.query({
            query: ({id, ...patch}) => ({
                url: `product_issue_log/${id}`,
                params: patch,
            }),
            providesTags: ['productIssue'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        productPurchaseLog: builder.query({
            query: ({id, ...patch}) => ({
                url: `product_purchase_log/${id}`,
                params: patch,
            }),
            providesTags: ['productPurchase'],
            onQueryStarted: onQueryStartedErrorToast,
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
    useProductIssueLogQuery,
    useProductPurchaseLogQuery,
    util: { getRunningQueriesThunk },
} = ProductApiService;

export const {
    getProduct,
    editProduct,
    updateProduct,
    storeProduct,
    destroyProduct,
    productIssueLog,
    productPurchaseLog,
} = ProductApiService.endpoints;
