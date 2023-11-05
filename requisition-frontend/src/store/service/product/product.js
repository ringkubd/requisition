import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

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
    }),
    editProduct: builder.query({
      query: (id) => ({
        url: `products/${id}`,
      }),
      providesTags: ['editProduct'],
    }),
    updateProduct: builder.mutation({
      query: ({id, ...patch}) => ({
        url: `products/${id}`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: ['getProduct', 'editProduct']
    }),
    storeProduct: builder.mutation({
      query: arg => ({
        url: 'products',
        method: 'POST',
        body: arg,
      }),
      invalidatesTags: ['getProduct']
    }),
    destroyProduct: builder.mutation({
      query : (arg) => ({
        url: `products/${arg}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['getProduct']
    }),
  }),
})

export const {
  useGetProductQuery,
  useEditProductQuery,
  useUpdateProductMutation,
  useStoreProductMutation,
  useDestroyProductMutation,
  util: { getRunningQueriesThunk },
} = ProductApiService;

export const {
  getProduct,
  editProduct,
  updateProduct,
  storeProduct,
  destroyProduct,
} = ProductApiService.endpoints;
