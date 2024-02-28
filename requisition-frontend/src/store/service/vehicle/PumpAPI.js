import { BaseAPI } from "@/store/service/vehicle/BaseAPI";

export const PumpAPIService = BaseAPI.injectEndpoints({
    endpoints: (builder) => ({
        getPump: builder.query({
            query: (params) => ({
                url: 'pumps',
                params: params
            }),
            providesTags: ['pumps']
        }),
        singlePump: builder.query({
            query: (id) => ({
                url: `pumps/${id}`,
            }),
            providesTags: ['single-pumps']
        }),
        updatePump: builder.mutation({
            query: ({id, ...body}) => ({
                url: `pumps/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['single-pumps']
        }),
        deletePump: builder.mutation({
            query: (id) => ({
                url: `pumps/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['single-pumps', 'pumps']
        }),
        storePump: builder.mutation({
            query: (body) => ({
                url: `pumps`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['pumps']
        })
    })
})
export const {
    useGetPumpQuery,
    useSinglePumpQuery,
    useUpdatePumpMutation,
    useDeletePumpMutation,
    useStorePumpMutation,
    util: { getRunningQueriesThunk },
} = PumpAPIService;

export const {
    getPump
} = PumpAPIService.endpoints;
