import { GeneralBaseAPI } from '@/store/generalBaseAPI'

export const ReportAPI = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        daily: builder.query({
            query: arg => ({
                url: 'daily',
                params: arg,
            }),
        }),
        purchaseReport: builder.mutation({
            query: arg => ({
                url: 'report/purchase',
                params: arg,
                method: 'GET',
            }),
        }),
        issuesReport: builder.mutation({
            query: arg => ({
                url: 'report/issues',
                params: arg,
                method: 'GET',
            }),
        }),
        bothReport: builder.mutation({
            query: arg => ({
                url: 'report/both',
                params: arg,
                method: 'GET',
            }),
        }),
        productCurrentBalance: builder.mutation({
            query: arg => ({
                url: 'report/product-current-balance',
                params: arg,
                method: 'GET',
            }),
        }),
        productCurrentBalanceOption: builder.mutation({
            query: arg => ({
                url: 'report/product-current-balance-option',
                params: arg,
                method: 'GET',
            }),
        }),
    }),
})

export const {
    useDailyQuery,
    usePurchaseReportMutation,
    useIssuesReportMutation,
    useBothReportMutation,
    useProductCurrentBalanceMutation,
    useProductCurrentBalanceOptionMutation,
} = ReportAPI
