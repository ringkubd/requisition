import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";

export const OptionsApiService = createApi({
    reducerPath: 'options',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getOptions', 'editOptions'],
    endpoints: builder => ({
        getOptions: builder.query({
            query: () => ({
                url: 'options',
            }),
            providesTags: ['getOptions'],
        }),
        editOptions: builder.query({
            query: (id) => ({
                url: `options/${id}`,
            }),
            providesTags: ['editOptions'],
        }),
        updateOptions: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `options/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getOptions', 'editOptions']
        }),
        storeOptions: builder.mutation({
            query: arg => ({
                url: 'options',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getOptions']
        }),
        destroyOptions: builder.mutation({
            query : (arg) => ({
                url: `options/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getOptions']
        }),
    }),
})

export const {
    useGetOptionsQuery,
    useEditOptionsQuery,
    useUpdateOptionsMutation,
    useStoreOptionsMutation,
    useDestroyOptionsMutation,
    util: { getRunningQueriesThunk },
} = OptionsApiService;

export const {
    getOptions,
    editOptions
} = OptionsApiService.endpoints;
