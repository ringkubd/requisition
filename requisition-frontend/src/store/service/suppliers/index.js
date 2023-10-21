import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const SuppliersApiService = createApi({
  reducerPath: 'suppliers',
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
  tagTypes: ['getSuppliers', 'editSuppliers'],
  endpoints: builder => ({
    getSuppliers: builder.query({
      query: () => ({
        url: 'suppliers',
      }),
      providesTags: ['getSuppliers'],
    }),
    editSuppliers: builder.query({
      query: (id) => ({
        url: `suppliers/${id}`,
      }),
      providesTags: ['editSuppliers'],
    }),
    updateSuppliers: builder.mutation({
      query: ({id, ...patch}) => ({
        url: `suppliers/${id}`,
        method: 'PATCH',
        body: patch,
        formData: true,
      }),
      invalidatesTags: ['getSuppliers', 'editSuppliers']
    }),
    storeSuppliers: builder.mutation({
      query: arg => ({
        url: 'suppliers',
        method: 'POST',
        body: arg,
        formData: true,
      }),
      invalidatesTags: ['getSuppliers']
    }),
    destroySuppliers: builder.mutation({
      query : (arg) => ({
        url: `suppliers/${arg}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['getSuppliers']
    })
  }),
})

export const {
  useGetSuppliersQuery,
  useEditSuppliersQuery,
  useGetSuppliersByOrganizationBranchQuery,
  useUpdateSuppliersMutation,
  useStoreSuppliersMutation,
  useDestroySuppliersMutation,
  util: { getRunningQueriesThunk },
} = SuppliersApiService;

export const {
  getSuppliers,
  editSuppliers
} = SuppliersApiService.endpoints;
