import { createApi } from "@reduxjs/toolkit/query/react";
import CustomBaseQuery from "@/store/service/branch";

export const BaseAPI = createApi({
    reducerPath: 'requisition',
    baseQuery: CustomBaseQuery,
    endpoints: () => ({}),
    tagTypes: [
        'initial-requisition',
        'edit-initial-requisition',
        'purchase-requisition',
        'edit-purchase-requisition',
        'get-initial-requisition-for-purchase',
        'general_requisition',
        'dashboard_cash_requisition',
        'cash-requisition',
        'cash_requisition',
        'edit-cash-requisition',
        'get-cash-product',
        'update-cash-product',
    ]
})
