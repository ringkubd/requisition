import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const ReportAPI = createApi({
    reducerPath: 'report',
    baseQuery: CustomBaseQuery,
    tagTypes: [],
    endpoints: builder => ({
        daily: builder.query({
            query: arg => ({
                url: 'daily',
                params: arg
            })
        }),
        purchaseReport: builder.mutation({
            query: arg => ({
                url: 'report/purchase',
                params: arg,
                method: 'GET'
            })
        }),
        issuesReport: builder.mutation({
            query: arg => ({
                url: 'report/issues',
                params: arg,
                method: 'GET'
            })
        })
    })
});

export const {
    useDailyQuery,
    usePurchaseReportMutation,
    useIssuesReportMutation,
} = ReportAPI;
