import { onQueryStartedErrorToast } from "@/lib/clientHelper";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

export const CountryApiService = GeneralBaseAPI.injectEndpoints({
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
