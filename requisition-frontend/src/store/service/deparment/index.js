import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/helpers";

export const DepartmentApiService = createApi({
    reducerPath: 'department',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getDepartment', 'editDepartment'],
    endpoints: builder => ({
        getDepartment: builder.query({
            query: () => ({
                url: 'departments',
            }),
            providesTags: ['getDepartment'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editDepartment: builder.query({
            query: (id) => ({
                url: `departments/${id}`,
            }),
            providesTags: ['editDepartment'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateDepartment: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `departments/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getDepartment', 'editDepartment'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeDepartment: builder.mutation({
            query: arg => ({
                url: 'departments',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getDepartment'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyDepartment: builder.mutation({
            query : (arg) => ({
                url: `departments/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getDepartment'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getDepartmentByOrganizationBranch: builder.query({
            query: (arg) => ({
                url: 'departments-by-organization-branch',
                method: 'GET',
                params: arg
            }),
            onQueryStarted: onQueryStartedErrorToast,
        })
    }),
})

export const {
    useGetDepartmentQuery,
    useEditDepartmentQuery,
    useUpdateDepartmentMutation,
    useStoreDepartmentMutation,
    useDestroyDepartmentMutation,
    useGetDepartmentByOrganizationBranchQuery,
    util: { getRunningQueriesThunk },
} = DepartmentApiService;

export const {
    getDepartment,
    editDepartment,
    updateDepartment,
    storeDepartment,
    destroyDepartment,
} = DepartmentApiService.endpoints;
