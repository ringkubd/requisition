import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

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
        }),
        editDepartment: builder.query({
            query: (id) => ({
                url: `departments/${id}`,
            }),
            providesTags: ['editDepartment'],
        }),
        updateDepartment: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `departments/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getDepartment', 'editDepartment']
        }),
        storeDepartment: builder.mutation({
            query: arg => ({
                url: 'departments',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getDepartment']
        }),
        destroyDepartment: builder.mutation({
            query : (arg) => ({
                url: `departments/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getDepartment']
        }),
        getDepartmentByOrganizationBranch: builder.query({
            query: (arg) => ({
                url: 'departments-by-organization-branch',
                method: 'GET',
                params: arg
            })
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
