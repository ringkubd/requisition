import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const ProductOptionApiService = createApi({
  reducerPath: 'product_option',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    prepareHeaders: (headers) => {
      fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + 'sanctum/csrf-cookie',
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
  tagTypes: ['getProductOptions', 'getOptions'],
  endpoints: builder => ({
   getProductOptions : builder.query({
     query : () => ({
       url: 'product-options',
     }),
     providesTags: ['getProductOptions']
   }),
  }),
})

export const {
  useGetProductOptionsQuery,
  util: { getRunningQueriesThunk },
} = ProductOptionApiService;

export const {
  getProductOptions
} = ProductOptionApiService.endpoints;
