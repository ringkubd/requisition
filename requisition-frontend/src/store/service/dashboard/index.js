import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const DashboardAPI = createApi({
    reducerPath: 'dashboard_api_service',
    baseQuery: CustomBaseQuery,
    tagTypes: [],
    endpoints: builder => ({
        getDashboardData : builder.query({
            query: arg => ({
                url: 'dashboard-data',
                params: arg
            })
        })
    })
})

export const {
    useGetDashboardDataQuery
} = DashboardAPI;
