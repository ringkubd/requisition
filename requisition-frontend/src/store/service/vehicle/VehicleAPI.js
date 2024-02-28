import { BaseAPI } from "@/store/service/vehicle/BaseAPI";

export const VehicleAPIService = BaseAPI.injectEndpoints({
    endpoints: (builder) => ({
        getVehicle: builder.query({
            query: (params) => ({
                url: 'vehicles',
                params: params
            }),
            providesTags: ['vehicles']
        }),
        singleVehicle: builder.query({
            query: (id) => ({
                url: `vehicles/${id}`,
            }),
            providesTags: ['single-vehicles']
        }),
        updateVehicle: builder.mutation({
            query: ({id, ...body}) => ({
                url: `vehicles/${id}`,
                body,
                method: 'PUT',
            }),
            invalidatesTags: ['single-vehicles', 'vehicles']
        }),
        deleteVehicle: builder.mutation({
            query: (id) => ({
                url: `vehicles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['vehicles']
        }),
        storeVehicle: builder.mutation({
            query: (body) => ({
                url: `vehicles`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['single-vehicles', 'vehicles']
        })
    })
})
export const {
    useGetVehicleQuery,
    useSingleVehicleQuery,
    useUpdateVehicleMutation,
    useDeleteVehicleMutation,
    useStoreVehicleMutation,
    util: { getRunningQueriesThunk },
} = VehicleAPIService;

export const {
    getVehicle
} = VehicleAPIService.endpoints;
