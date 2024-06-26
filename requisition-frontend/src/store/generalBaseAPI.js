import { createApi } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react'

export const GeneralBaseAPI = createApi({
    reducerPath: 'general_service',
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
            if (document) {
                let cookieArray = document.cookie.split(';')
                // this can probably be improved by using a regex.. but this works for now
                for (var i = 0; i < cookieArray.length; i++) {
                    let cookiePair = cookieArray[i].split('=')

                    if (cookiePair[0].trim() == 'XSRF-TOKEN-PORTAL') {
                        headers.set(
                            'X-XSRF-TOKEN-PORTAL',
                            decodeURIComponent(cookiePair[1]),
                        )
                    }
                }
                headers.set('Accept', `application/json`)
            }

            return headers
        },
        credentials: 'include',
    }),
    endpoints: () => ({}),
    tagTypes: [
        'getSuppliers',
        'editSuppliers',
        'getPurchase',
        'editPurchase',
        'select_suppliers',
        'units',
        'singleUnit',
        'getCategory',
        'editCategory',
        'sub-category',
        'getBrands',
        'editBrands',
        'getDesignation',
        'editDesignation',
        'navigation_branch',
        'navigation_department',
        'navigation_push_notification',
        'getOptions',
        'editOptions',
        'product',
        'editProduct',
        'productIssue',
        'productPurchase',
        'getDepartment',
        'editDepartment',
        'getOrganization',
        'issue',
        'editIssue',
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
        'pumps',
        'single-pumps',
        'vehicles',
        'single-vehicles',
        'vehicle-history',
        'single-vehicle-history',
        'getProductOptions',
        'issue_item',
        'edit_issue_item',
        'getPermissions',
        'editPermissions',
        'getRoles',
        'editRoles',
        'getAllUsers',
        'getBranch',
        'editBranch',
        'cash-requisition-select-vehicle',
    ],
})
