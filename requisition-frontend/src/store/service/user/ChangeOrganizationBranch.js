import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const ChangeOrganizationBranchApi = createApi({
    reducerPath: 'change_organization_branch',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        prepareHeaders: headers => {
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
    tagTypes: [],
    endpoints: builder => ({
        setBranch: builder.mutation({
            query: arg => ({
                url: 'change-branch',
                method: 'POST',
                body: arg,
            }),
            transformResponse: (response, meta, arg) => {
                return response;
            },
        }),
        setOrganization: builder.mutation({
            query: arg => ({
                url: 'change-organization',
                method: 'POST',
                body: arg,
            }),
        }),
    }),
})

export const {
  useSetBranchMutation,
  useSetOrganizationMutation,
  util: {
    getRunningQueriesThunk
  }
} = ChangeOrganizationBranchApi;
