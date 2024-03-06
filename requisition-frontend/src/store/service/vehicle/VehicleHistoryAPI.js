import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const VehicleHistoryAPI = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getVehicleHistory: builder.query({
            query: (params) => ({
                url: 'vehicle-histories',
                params: params
            }),
            providesTags: ['vehicle-history'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getSingleVehicleHistory: builder.query({
            query: (id) => ({
                url: `vehicle-histories/${id}`,
            }),
            providesTags: ['single-vehicles'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeVehicleHistory: builder.mutation({
            query: (body) => ({
                url: `vehicle-histories`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['vehicle-history'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateVehicleHistory: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `vehicle-histories/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['vehicle-history'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyVehicleHistory: builder.mutation({
            query: (id) => ({
                url: `vehicle-histories/${id}`,
                method: 'delete',
            }),
            invalidatesTags: ['vehicle-history'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        getCashRequisitionSelect: builder.query({
            query: (params) => ({
                url: 'vehicle-cash-requisition-select',
                method: 'GET',
                params
            }),
            providesTags: ['cash-requisition-select-vehicle']
        })
    })
});

export const {
    useGetVehicleHistoryQuery,
    useGetSingleVehicleHistoryQuery,
    useStoreVehicleHistoryMutation,
    useUpdateVehicleHistoryMutation,
    useGetCashRequisitionSelectQuery,
    useDestroyVehicleHistoryMutation,
    util: { getRunningQueriesThunk },
} = VehicleHistoryAPI;
export const {
    getVehicleHistory
} = VehicleHistoryAPI.endpoints;
