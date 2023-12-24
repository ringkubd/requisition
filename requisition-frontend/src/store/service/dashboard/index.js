import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const DashboardAPI = createApi({
    reducerPath: 'dashboard_api_service',
    baseQuery: CustomBaseQuery,
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
        })
    })
})

export const {
    useGetDashboardDataQuery,
    useGetDashboardCashDataQuery,
    util: { getRunningQueriesThunk },
} = DashboardAPI;

export const {
    getDashboardCashData,
    getDashboardData,
} = DashboardAPI.endpoints;
