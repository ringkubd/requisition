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
        })
    })
});

export const {
    useDailyQuery
} = ReportAPI;
