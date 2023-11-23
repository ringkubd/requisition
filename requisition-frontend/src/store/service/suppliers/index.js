import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/helpers";

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
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editSuppliers: builder.query({
            query: (id) => ({
                url: `suppliers/${id}`,
            }),
            providesTags: ['editSuppliers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateSuppliers: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `suppliers/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getSuppliers', 'editSuppliers'],
            onQueryStarted: onQueryStartedErrorToast,
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
            invalidatesTags: ['getSuppliers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroySuppliers: builder.mutation({
            query : (arg) => ({
                url: `suppliers/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getSuppliers'],
            onQueryStarted: onQueryStartedErrorToast,
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
