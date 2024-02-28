import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const BrandsApiService = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getBrands: builder.query({
            query: () => ({
                url: 'brands',
            }),
            providesTags: ['getBrands'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editBrands: builder.query({
            query: (id) => ({
                url: `brands/${id}`,
            }),
            providesTags: ['editBrands'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateBrands: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `brands/${id}`,
                method: 'PATCH',
                body: patch,
                formData: true,
            }),
            invalidatesTags: ['getBrands', 'editBrands'],
            onQueryStarted: onQueryStartedErrorToast,
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
            invalidatesTags: ['getBrands'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyBrands: builder.mutation({
            query : (arg) => ({
                url: `brands/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getBrands'],
            onQueryStarted: onQueryStartedErrorToast,
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
