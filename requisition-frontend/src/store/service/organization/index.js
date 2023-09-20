import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const OrganizationApiService = createApi({
    reducerPath: 'organization',
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
    tagTypes: ['getOrganization'],
    endpoints: builder => ({
        getOrganization: builder.query({
            query: () => ({
                url: 'organization',
            }),
            providesTags: ['getOrganization'],
        }),
        editOrganization: builder.query({
            query: (id) => ({
                url: `organization/${id}`,
            }),
            providesTags: ['editOrganization'],
        }),
        updateOrganization: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `organization/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getOrganization', 'editOrganization']
        }),
        storeOrganization: builder.mutation({
            query: arg => ({
                url: 'organization',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getOrganization']
        }),
        destroyOrganization: builder.mutation({
            query : (arg) => ({
                url: `organization/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getOrganization']
        }),
    }),
})

export const {
    useGetOrganizationQuery,
    useEditOrganizationQuery,
    useUpdateOrganizationMutation,
    useStoreOrganizationMutation,
    useDestroyOrganizationMutation,
    util: { getRunningQueriesThunk },
} = OrganizationApiService;

export const {
    getOrganization,
    editOrganization,
    updateOrganization,
    storeOrganization,
    destroyOrganization,
} = OrganizationApiService.endpoints;
