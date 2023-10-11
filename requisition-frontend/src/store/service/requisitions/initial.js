import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@/lib/cookie";

export const InitialRequisitionApi = createApi({
    reducerPath: 'initial-requisition',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        prepareHeaders: headers => {
            fetch(
              process.env.NEXT_PUBLIC_BACKEND_URL + '/sanctum/csrf-cookie',
              {
                  method: 'GET',
                  credentials: 'include',
              },
            )
            const token = decodeURIComponent(getCookie('XSRF-TOKEN')) // <---- CHANGED
            headers.set('Accept', `application/json`)
            headers.set('Content-Type', `application/json`)
            headers.set('X-XSRF-TOKEN', token)
            return headers
        },
        credentials: 'include',
    }),
    tagTypes: ['initial-requisition', 'edit-initial-requisition'],
    endpoints: build => ({
        getInitialRequisition: build.query({
            query: () => ({
                url: 'initial-requisitions'
            }),
            providesTags: ['initial-requisition']
        }),
        editInitialRequisition: build.query({
            query: (id) => ({
                url: `initial-requisitions/${id}`
            }),
            providesTags: ['edit-initial-requisition']
        }),
        updateInitialRequisition: build.mutation({
            query: ({id, ...patch}) => ({
                url: `initial-requisitions/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: ['initial-requisition', 'edit-initial-requisition']
        }),
        storeInitialRequisition: build.mutation({
            query: arg => ({
                url: 'initial-requisitions',
                method: 'POST',
                body: arg,
            }),
            invalidatesTags: ['initial-requisition']
        }),
        destroyInitialRequisition: build.mutation({
            query : (arg) => ({
                url: `initial-requisitions/${arg}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['initial-requisition']
        }),
        lastPurchaseInformation: build.query({
            query: (arg) => ({
                url: 'last-purchase-information',
                method: 'GET',
                body: arg
            })
        })
    }),
})

export const {
    useGetInitialRequisitionQuery,
    useEditInitialRequisitionQuery,
    useUpdateInitialRequisitionMutation,
    useStoreInitialRequisitionMutation,
    useDestroyInitialRequisitionMutation,
    useLastPurchaseInformationQuery,
    util: { getRunningQueriesThunk },
} = InitialRequisitionApi;

export const {
    getInitialRequisition,
    editInitialRequisition
} = InitialRequisitionApi.endpoints;
