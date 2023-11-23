import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/helpers";

export const ProductApiService = createApi({
    reducerPath: 'product',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getProduct', 'editProduct'],
    endpoints: builder => ({
        getProduct: builder.query({
            query: () => ({
                url: 'products',
            }),
            providesTags: ['getProduct'],
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
            invalidatesTags: ['getProduct', 'editProduct'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeProduct: builder.mutation({
            query: arg => ({
                url: 'products',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getProduct'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyProduct: builder.mutation({
            query : (arg) => ({
                url: `products/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getProduct'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetProductQuery,
    useEditProductQuery,
    useUpdateProductMutation,
    useStoreProductMutation,
    useDestroyProductMutation,
    useSingleProductQuery,
    util: { getRunningQueriesThunk },
} = ProductApiService;

export const {
    getProduct,
    editProduct,
    updateProduct,
    storeProduct,
    destroyProduct,
} = ProductApiService.endpoints;
