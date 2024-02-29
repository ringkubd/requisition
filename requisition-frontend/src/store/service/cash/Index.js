import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const CashRequisitionAPIService = GeneralBaseAPI.injectEndpoints({
    endpoints: build => ({
        getCashRequisition: build.query({
            query: params => ({
                url: 'cash-requisitions',
                params: params
            }),
            providesTags: ['cash-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getSingleCashRequisition: build.query({
            query: id => ({
                url: `cash-requisitions/${id}`,
            }),
            providesTags: ['edit-cash-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateCashRequisition: build.mutation({
            query: ({id, ...params}) => ({
                url: `cash-requisitions/${id}`,
                method: 'PUT',
                body: params
            }),
            invalidatesTags: ['edit-cash-requisition', 'cash-requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        deleteCashRequisition: build.mutation({
            query: id => ({
                url: `cash-requisitions/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['edit-cash-requisition', 'cash-requisition', 'update-cash-product'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeCashRequisition: build.mutation({
            query: params => ({
                url: `cash-requisitions`,
                method: 'POST',
                body: params
            }),
            invalidatesTags: ['edit-cash-requisition', 'cash-requisition', 'dashboard_cash_requisition'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getCashProduct: build.query({
            query: params => ({
                url: `cash-products`
            }),
            providesTags: ['update-cash-product']
        }),
        storeCashProduct: build.mutation({
            query: params => ({
                url: `cash-products`,
                method: 'POST',
                body: params
            }),
            invalidatesTags: ['update-cash-product']
        }),
        deleteCashProduct: build.mutation({
            query: id => ({
                url: `cash-products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['update-cash-product']
        }),
    }),
})
export const {
    useGetCashRequisitionQuery,
    useGetSingleCashRequisitionQuery,
    useUpdateCashRequisitionMutation,
    useDeleteCashRequisitionMutation,
    useStoreCashRequisitionMutation,
    useGetCashProductQuery,
    useStoreCashProductMutation,
    useDeleteCashProductMutation,
    util: { getRunningQueriesThunk },
} = CashRequisitionAPIService;
export const { getCashRequisition } = CashRequisitionAPIService.endpoints;
