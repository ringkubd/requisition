import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";

export const CategoryApiService = createApi({
    reducerPath: 'category',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getCategory', 'editCategory', 'sub-category'],
    endpoints: builder => ({
        getCategory: builder.query({
            query: () => ({
                url: 'categories',
            }),
            providesTags: ['getCategory'],
        }),
        editCategory: builder.query({
            query: (id) => ({
                url: `categories/${id}`,
            }),
            providesTags: ['editCategory'],
        }),
        updateCategory: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `categories/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getCategory', 'editCategory']
        }),
        storeCategory: builder.mutation({
            query: arg => ({
                url: 'categories',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getCategory']
        }),
        destroyCategory: builder.mutation({
            query : (arg) => ({
                url: `categories/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getCategory']
        }),
        getSubCategory: builder.query({
            query: (parentId) => ({
                url: `sub-category/${parentId}`,
                method: 'GET'
            }),
            providesTags: ['sub-category']
        })
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
} = CategoryApiService;

export const {
    getCategory,
    editCategory
} = CategoryApiService.endpoints;
