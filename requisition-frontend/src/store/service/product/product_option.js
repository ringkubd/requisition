import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";

export const ProductOptionApiService = createApi({
  reducerPath: 'product_option',
  baseQuery: CustomBaseQuery,
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
