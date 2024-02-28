import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const UnitsApiService = GeneralBaseAPI.injectEndpoints({
    endpoints: builder => ({
        getUnits : builder.query({
            query: () => ({
                url: 'measurement-units',
            }),
            providesTags: ['units'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        singleUnits : builder.query({
            query: (id) => ({
                url: `measurement-units/${id}`,
            }),
            providesTags: ['singleUnit'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeUnits : builder.mutation({
            query: (params) => ({
                url: `measurement-units`,
                method: 'POST',
                body: params
            }),
            invalidatesTags: ['units'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateUnit : builder.mutation({
            query: (id,...params) => ({
                url: `measurement-units/${id}`,
                method: 'PUT',
                body: params
            }),
            invalidatesTags: ['units'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        deleteUnits : builder.mutation({
            query: (id) => ({
                url: `measurement-units/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['units'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    })
});

export const {
    useGetUnitsQuery,
    useSingleUnitsQuery,
    useStoreUnitsMutation,
    useDeleteUnitsMutation,
    useUpdateUnitMutation,
    util: { getRunningQueriesThunk },
} = UnitsApiService;
export const {
    getUnits
} = UnitsApiService.endpoints;
