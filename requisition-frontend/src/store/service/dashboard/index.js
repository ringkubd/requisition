import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const DashboardAPI = createApi({
    reducerPath: 'dashboard_api_service',
    baseQuery: CustomBaseQuery,
    refetchOnMountOrArgChange: true,
    tagTypes: ['general_requisition', 'cash_requisition'],
    endpoints: builder => ({
        getDashboardData : builder.query({
            query: arg => ({
                url: 'dashboard-data',
                params: arg
            }),
            providesTags: ['general_requisition']
        }),
        getDashboardCashData : builder.query({
            query: arg => ({
                url: 'dashboard-cash-data',
                params: arg
            }),
            providesTags: ['cash_requisition']
        }),
        updateInitialStatus: builder.mutation({
            query: ({id, ...arg}) => ({
                url: `update_initial_status/${id}`,
                method: 'PUT',
                body: arg
            }),
            invalidatesTags: ['general_requisition']
        }),
        updatePurchaseStatus: builder.mutation({
            query: ({id, ...arg}) => ({
                url: `update_purchase_status/${id}`,
                method: 'PUT',
                body: arg
            }),
            invalidatesTags: ['general_requisition']
        }),
        updateCashStatus: builder.mutation({
            query: ({id, ...arg}) => ({
                url: `update_cash_status/${id}`,
                method: 'PUT',
                body: arg
            }),
            invalidatesTags: ['cash_requisition']
        })
    })
})

export const {
    useGetDashboardDataQuery,
    useGetDashboardCashDataQuery,
    useUpdateInitialStatusMutation,
    useUpdatePurchaseStatusMutation,
    useUpdateCashStatusMutation,
    util: { getRunningQueriesThunk },
} = DashboardAPI;

export const {
    getDashboardCashData,
    getDashboardData,
} = DashboardAPI.endpoints;
