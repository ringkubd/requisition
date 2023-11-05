import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const SuppliersApiService = createApi({
    reducerPath: 'suppliers',
    baseQuery: CustomBaseQuery,
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
            query: arg => {
                console.log(arg.logo)
                return {
                    url: 'suppliers',
                    method: 'POST',
                    body: arg,
                }
            },
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
