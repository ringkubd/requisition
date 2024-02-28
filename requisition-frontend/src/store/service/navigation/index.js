import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const NavigationAPIService = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getNavigationOrganization: builder.query({
            query: (arg) => ({
                url: 'navigation-organization'
            }),
            invalidatesTags: ['navigation_branch', 'navigation_department'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getNavigationBranch: builder.query({
            query: (arg) => ({
                url: 'navigation-branch',
                params: arg
            }),
            providesTags: ['navigation_branch'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getNavigationDepartment: builder.query({
            query: (arg) => ({
                url: 'navigation-department',
                params: arg
            }),
            providesTags: ['navigation_department'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        subscribePushNotification: builder.mutation({
            query: arg => ({
                url: 'subscribe-push',
                method: 'POST',
                body: arg
            }),
            providesTags: ['navigation_push_notification'],
        })
    })
});

export  const {
    useGetNavigationOrganizationQuery,
    useGetNavigationBranchQuery,
    useGetNavigationDepartmentQuery,
    useSubscribePushNotificationMutation,
} = NavigationAPIService;
