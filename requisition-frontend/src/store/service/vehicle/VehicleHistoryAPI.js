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
        })
    })
});

export const {
    util: { getRunningQueriesThunk },
} = VehicleHistoryAPI;
export const {} = VehicleHistoryAPI.endpoints;
