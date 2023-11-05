import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";

export const ChangeOrganizationBranchApi = createApi({
    reducerPath: 'change_organization_branch',
    baseQuery: CustomBaseQuery,
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
