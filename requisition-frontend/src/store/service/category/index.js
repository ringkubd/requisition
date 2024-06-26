import { onQueryStartedErrorToast } from '@/lib/clientHelper'
import { GeneralBaseAPI } from '@/store/generalBaseAPI'

export const CategoryApiService = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getCategory: builder.query({
            query: () => ({
                url: 'categories',
            }),
            providesTags: ['getCategory'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editCategory: builder.query({
            query: id => ({
                url: `categories/${id}`,
            }),
            providesTags: ['editCategory'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `categories/${id}`,
                method: 'PATCH',
                body: patch,
            }),
            invalidatesTags: ['getCategory', 'editCategory'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeCategory: builder.mutation({
            query: arg => ({
                url: 'categories',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getCategory'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyCategory: builder.mutation({
            query: arg => ({
                url: `categories/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getCategory'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getSubCategory: builder.query({
            query: parentId => ({
                url: `sub-category/${parentId}`,
                method: 'GET',
            }),
            providesTags: ['sub-category'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetCategoryQuery,
    useEditCategoryQuery,
    useUpdateCategoryMutation,
    useStoreCategoryMutation,
    useDestroyCategoryMutation,
    useGetSubCategoryQuery,
    util: { getRunningQueriesThunk },
} = CategoryApiService

export const { getCategory, editCategory } = CategoryApiService.endpoints
