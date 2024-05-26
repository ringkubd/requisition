import { onQueryStartedErrorToast } from '@/lib/clientHelper'
import { GeneralBaseAPI } from '@/store/generalBaseAPI'

export const SuppliersApiService = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getSuppliers: builder.query({
            query: query => ({
                url: 'suppliers',
                params: query,
            }),
            providesTags: ['getSuppliers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editSuppliers: builder.query({
            query: id => ({
                url: `suppliers/${id}`,
            }),
            providesTags: ['editSuppliers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateSuppliers: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `suppliers/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: [
                'getSuppliers',
                'editSuppliers',
                'select_suppliers',
            ],
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
            invalidatesTags: ['getSuppliers', 'select_suppliers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroySuppliers: builder.mutation({
            query: arg => ({
                url: `suppliers/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getSuppliers', 'select_suppliers'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
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
} = SuppliersApiService

export const { getSuppliers, editSuppliers } = SuppliersApiService.endpoints
