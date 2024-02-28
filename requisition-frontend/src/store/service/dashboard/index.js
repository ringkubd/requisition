import { BaseAPI } from "@/store/service/requisitions/BaseAPI";

export const DashboardAPI = BaseAPI.injectEndpoints({
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
            providesTags: ['dashboard_cash_requisition']
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
            invalidatesTags: ['general_requisition', 'edit-purchase-requisition', 'cash_requisition', 'dashboard_cash_requisition']
        }),
        updateCashStatus: builder.mutation({
            query: ({id, ...arg}) => ({
                url: `update_cash_status/${id}`,
                method: 'PUT',
                body: arg
            }),
            invalidatesTags: ['dashboard_cash_requisition', 'general_requisition', 'dashboard_cash_requisition']
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
