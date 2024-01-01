import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const ProductOptionApiService = createApi({
    reducerPath: 'product_option',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getProductOptions', 'getOptions'],
    endpoints: builder => ({
        getProductOptions: builder.query({
            query: () => ({
                url: 'product-options',
            }),
            providesTags: ['getProductOptions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateProductOptions: builder.mutation({
            query: ({ id, ...arg }) => ({
                url: `product-options/${id}`,
                method: 'PUT',
                body: arg,
            }),
            invalidatesTags: ['getProductOptions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetProductOptionsQuery,
    useUpdateProductOptionsMutation,
    util: { getRunningQueriesThunk },
} = ProductOptionApiService;

export const {
    getProductOptions
} = ProductOptionApiService.endpoints;
