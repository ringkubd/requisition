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
        auditReport: builder.query({
            query: arg => ({
                url: 'report/audit-report',
                params: arg,
                method: 'GET',
            }),
        }),
        summaryDepartmentCategory: builder.mutation({
            query: arg => ({
                url: 'report/summary/department-category',
                params: arg,
                method: 'GET',
            }),
        }),
        summaryCash: builder.mutation({
            query: arg => ({
                url: 'report/summary/cash',
                params: arg,
                method: 'GET',
            }),
        }),
        summaryCategoryItems: builder.mutation({
            query: arg => ({
                url: 'report/summary/category-items',
                params: arg,
                method: 'GET',
            }),
        }),
        summaryCashCategoryPropose: builder.query({
            query: arg => ({
                url: 'report/summary/cash-category/propose',
                params: arg,
            }),
        }),
        summaryCashCategoryStatus: builder.query({
            query: () => ({
                url: 'report/summary/cash-category/status',
            }),
        }),
        summaryCashCategoryApprove: builder.mutation({
            query: body => ({
                url: 'report/summary/cash-category/approve',
                method: 'POST',
                body,
            }),
        }),
        summaryCashCategoryClassify: builder.mutation({
            query: arg => ({
                url: 'report/summary/cash-category/classify',
                method: 'POST',
                body: arg || {},
            }),
        }),
        summaryCashCategoryReport: builder.mutation({
            query: arg => ({
                url: 'report/summary/cash-category/report',
                params: arg,
                method: 'GET',
            }),
        }),
        summaryCashCategoryItems: builder.mutation({
            query: arg => ({
                url: 'report/summary/cash-category/items',
                params: arg,
                method: 'GET',
            }),
        }),
        summaryCashCategoryOverride: builder.mutation({
            query: body => ({
                url: 'report/summary/cash-category/override',
                method: 'POST',
                body,
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
    useAuditReportQuery,
    useSummaryDepartmentCategoryMutation,
    useSummaryCashMutation,
    useSummaryCategoryItemsMutation,
    useLazySummaryCashCategoryProposeQuery,
    useLazySummaryCashCategoryStatusQuery,
    useSummaryCashCategoryApproveMutation,
    useSummaryCashCategoryClassifyMutation,
    useSummaryCashCategoryReportMutation,
    useSummaryCashCategoryItemsMutation,
    useSummaryCashCategoryOverrideMutation,
} = ReportAPI
