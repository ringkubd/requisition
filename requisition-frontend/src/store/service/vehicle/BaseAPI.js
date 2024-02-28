import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const BaseAPI = createApi({
    reducerPath: 'vehicle',
    baseQuery: CustomBaseQuery,
    endpoints: () => ({}),
    tagTypes: [
        'pumps',
        'single-pumps',
        'vehicles',
        'single-vehicles',
        'vehicle-history',
        'single-vehicle-history',
    ]
})
