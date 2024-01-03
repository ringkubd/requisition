import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const NavigationAPIService = createApi({
    reducerPath: 'navigation_service',
    baseQuery: CustomBaseQuery,
    endpoints: builder => ({
        getNavigationOrganization: builder.query({
            query: (arg) => ({
                url: 'navigation-organization'
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getNavigationBranch: builder.query({
            query: (arg) => ({
                url: 'navigation-branch',
                params: arg
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getNavigationDepartment: builder.query({
            query: (arg) => ({
                url: 'navigation-department',
                params: arg
            }),
            onQueryStarted: onQueryStartedErrorToast,
        }),
        subscribePushNotification: builder.mutation({
            query: arg => ({
                url: 'subscribe-push',
                method: 'POST',
                body: arg
            })
        })
    })
});

export  const {
    useGetNavigationOrganizationQuery,
    useGetNavigationBranchQuery,
    useGetNavigationDepartmentQuery,
    useSubscribePushNotificationMutation,
} = NavigationAPIService;
