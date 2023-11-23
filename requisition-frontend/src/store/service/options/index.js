import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";
import CustomBaseQuery from "@/store/service/branch";
import { onQueryStartedErrorToast } from "@/lib/helpers";

export const OptionsApiService = createApi({
    reducerPath: 'options',
    baseQuery: CustomBaseQuery,
    tagTypes: ['getOptions', 'editOptions'],
    endpoints: builder => ({
        getOptions: builder.query({
            query: () => ({
                url: 'options',
            }),
            providesTags: ['getOptions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        editOptions: builder.query({
            query: (id) => ({
                url: `options/${id}`,
            }),
            providesTags: ['editOptions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        updateOptions: builder.mutation({
            query: ({id, ...patch}) => ({
                url: `options/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['getOptions', 'editOptions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        storeOptions: builder.mutation({
            query: arg => ({
                url: 'options',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['getOptions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
        destroyOptions: builder.mutation({
            query : (arg) => ({
                url: `options/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['getOptions'],
            onQueryStarted: onQueryStartedErrorToast,
        }),
    }),
})

export const {
    useGetOptionsQuery,
    useEditOptionsQuery,
    useUpdateOptionsMutation,
    useStoreOptionsMutation,
    useDestroyOptionsMutation,
    util: { getRunningQueriesThunk },
} = OptionsApiService;

export const {
    getOptions,
    editOptions
} = OptionsApiService.endpoints;
