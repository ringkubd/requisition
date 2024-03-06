import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const BranchApiService = GeneralBaseAPI.injectEndpoints({
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
