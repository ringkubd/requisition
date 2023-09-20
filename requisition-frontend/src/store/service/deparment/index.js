import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const DepartmentApiService = createApi({
    reducerPath: 'department',
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
    }),
})

export const {
    useGetDepartmentQuery,
    useEditDepartmentQuery,
    useUpdateDepartmentMutation,
    useStoreDepartmentMutation,
    useDestroyDepartmentMutation,
    util: { getRunningQueriesThunk },
} = DepartmentApiService;

export const {
    getDepartment,
    editDepartment,
    updateDepartment,
    storeDepartment,
    destroyDepartment,
} = DepartmentApiService.endpoints;
