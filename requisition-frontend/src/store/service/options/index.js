import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const OptionsApiService = createApi({
    reducerPath: 'options',
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
    editOptions,
    updateOptions,
    storeOptions,
    destroyOptions,
} = OptionsApiService.endpoints;
