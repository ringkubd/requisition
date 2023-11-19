import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const CountryApiService = createApi({
  reducerPath: 'countries',
  baseQuery: CustomBaseQuery,
  endpoints: builder => ({
    getCountries : builder.query({
      query: () => ({
        url: 'countries',
      }),
    })
  })
});

export const {
  useGetCountriesQuery,
  util: { getRunningQueriesThunk },
} = CountryApiService;
