import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const ProductOptionApiService = GeneralBaseAPI.injectEndpoints({
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
