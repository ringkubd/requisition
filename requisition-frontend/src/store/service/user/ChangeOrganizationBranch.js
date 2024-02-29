import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const ChangeOrganizationBranchApi = GeneralBaseAPI.injectEndpoints({
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
        setDepartment: builder.mutation({
            query: arg => ({
                url: 'change-departments',
                method: 'POST',
                body: arg,
            }),
        }),
    }),
})

export const {
  useSetBranchMutation,
  useSetOrganizationMutation,
  useSetDepartmentMutation,
  util: {
    getRunningQueriesThunk
  }
} = ChangeOrganizationBranchApi;
