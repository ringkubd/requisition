import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/clientHelper";

export const CountryApiService = createApi({
  reducerPath: 'countries',
  baseQuery: CustomBaseQuery,
  endpoints: builder => ({
    getCountries : builder.query({
      query: () => ({
        url: 'countries',
      }),
        onQueryStarted: onQueryStartedErrorToast,
    })
  })
});

export const {
  useGetCountriesQuery,
  util: { getRunningQueriesThunk },
} = CountryApiService;
