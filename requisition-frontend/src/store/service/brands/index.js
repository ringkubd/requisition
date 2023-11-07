import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const BrandsApiService = createApi({
    reducerPath: 'brands',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getBrands', 'editBrands'],
    endpoints: builder => ({
        getBrands: builder.query({
            query: () => ({
                url: 'brands',
            }),
            providesTags: ['getBrands'],
        }),
        editBrands: builder.query({
            query: (id) => ({
                url: `brands/${id}`,
            }),
            providesTags: ['editBrands'],
        }),
        updateBrands: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `brands/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getBrands', 'editBrands']
        }),
        storeBrands: builder.mutation({
            query: arg => {
                console.log(arg.logo)
                return {
                    url: 'brands',
                    method: 'POST',
                    body: arg,
                }
            },
            invalidatesTags: ['getBrands']
        }),
        destroyBrands: builder.mutation({
            query : (arg) => ({
                url: `brands/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getBrands']
        })
    }),
})

export const {
    useGetBrandsQuery,
    useEditBrandsQuery,
    useGetBrandsByOrganizationBranchQuery,
    useUpdateBrandsMutation,
    useStoreBrandsMutation,
    useDestroyBrandsMutation,
    util: { getRunningQueriesThunk },
} = BrandsApiService;

export const {
    getBrands,
    editBrands
} = BrandsApiService.endpoints;
