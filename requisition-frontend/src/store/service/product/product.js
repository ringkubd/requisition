import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const ProductApiService = createApi({
  reducerPath: 'product',
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
      headers.set('Content-Type', `application/json`)
      headers.set('X-XSRF-TOKEN', token)
      return headers
    },
    credentials: 'include',
  }),
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
