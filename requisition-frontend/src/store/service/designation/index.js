import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const DesignationApiService = createApi({
    reducerPath: 'designation',
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
    tagTypes: ['getDesignation', 'editDesignation'],
    endpoints: builder => ({
        getDesignation: builder.query({
            query: () => ({
                url: 'designations',
            }),
            providesTags: ['getDesignation'],
        }),
        editDesignation: builder.query({
            query: (id) => ({
                url: `designations/${id}`,
            }),
            providesTags: ['editDesignation'],
        }),
        updateDesignation: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `designations/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getDesignation', 'editDesignation']
        }),
        storeDesignation: builder.mutation({
            query: arg => ({
                url: 'designations',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getDesignation']
        }),
        destroyDesignation: builder.mutation({
            query : (arg) => ({
                url: `designations/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getDesignation']
        }),
    }),
})

export const {
    useGetDesignationQuery,
    useEditDesignationQuery,
    useUpdateDesignationMutation,
    useStoreDesignationMutation,
    useDestroyDesignationMutation,
    util: { getRunningQueriesThunk },
} = DesignationApiService;

export const {
    getDesignation,
    editDesignation,
    updateDesignation,
    storeDesignation,
    destroyDesignation,
} = DesignationApiService.endpoints;
