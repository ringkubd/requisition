import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

const CustomBaseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    prepareHeaders: (headers) => {
        fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + '/sanctum/csrf-cookie',
            {
                method: 'GET',
                credentials: 'include',
            },
        )
        let cookieArray = document.cookie.split(";");

        // this can probably be improved by using a regex.. but this works for now
        for(var i = 0; i < cookieArray.length; i++) {
            let cookiePair = cookieArray[i].split("=");

            if (cookiePair[0].trim() == 'XSRF-TOKEN-PORTAL') {
                headers.set('X-XSRF-TOKEN-PORTAL', decodeURIComponent(cookiePair[1]))
            }

        }
        headers.set('Accept', `application/json`)
        return headers
    },
    credentials: 'include',
})

export const BranchApiService = createApi({
    reducerPath: 'branch',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getBranch', 'editBranch'],
    endpoints: builder => ({
        getBranch: builder.query({
            query: () => ({
                url: 'branches',
            }),
            providesTags: ['getBranch'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getBranchByOrganization: builder.query({
            query: organization => ({
                url: `branches_organization`,
                method: 'GET',
                params: { organization: organization },
            }),
            providesTags: ['getBranch'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editBranch: builder.query({
            query: id => ({
                url: `branches/${id}`,
            }),
            providesTags: ['editBranch'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateBranch: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `branches/${id}`,
                method: 'PATCH',
                body: patch,
            }),
            invalidatesTags: ['getBranch', 'editBranch'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeBranch: builder.mutation({
            query: arg => ({
                url: 'branches',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getBranch'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyBranch: builder.mutation({
            query: arg => ({
                url: `branches/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getBranch'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetBranchQuery,
    useGetBranchByOrganizationQuery,
    useEditBranchQuery,
    useUpdateBranchMutation,
    useStoreBranchMutation,
    useDestroyBranchMutation,
    util: { getRunningQueriesThunk },
} = BranchApiService;

export const {
    getBranch,
    editBranch,
    updateBranch,
    storeBranch,
    destroyBranch,
} = BranchApiService.endpoints;

export default CustomBaseQuery;
