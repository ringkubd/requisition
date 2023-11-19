import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const UnitsApiService = createApi({
  reducerPath: 'units',
  baseQuery: CustomBaseQuery,
  tagTypes: ['units', 'singleUnit'],
  endpoints: builder => ({
    getUnits : builder.query({
      query: () => ({
        url: 'measurement-units',
      }),
      providesTags: ['units']
    }),
    singleUnits : builder.query({
      query: (id) => ({
        url: `measurement-units/${id}`,
      }),
      providesTags: ['singleUnit']
    }),
    storeUnits : builder.mutation({
      query: (params) => ({
        url: `measurement-units`,
        method: 'POST',
        body: params
      }),
      invalidatesTags: ['units']
    }),
    updateUnit : builder.mutation({
      query: (id,...params) => ({
        url: `measurement-units/${id}`,
        method: 'PUT',
        body: params
      }),
      invalidatesTags: ['units']
    }),
    deleteUnits : builder.mutation({
      query: (id) => ({
        url: `measurement-units/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['units']
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
