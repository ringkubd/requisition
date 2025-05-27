import { createApi } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react'

// Helper function to safely get CSRF token from cookies
const getCSRFToken = () => {
    if (typeof document === 'undefined') return null;
    
    try {
        const cookieArray = document.cookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            const cookiePair = cookieArray[i].split('=');
            if (cookiePair[0].trim() === 'XSRF-TOKEN-PORTAL') {
                return decodeURIComponent(cookiePair[1]);
            }
        }
    } catch (error) {
        console.error('Error extracting CSRF token:', error);
    }
    return null;
};

// Helper to refresh CSRF token
const refreshCSRF = async () => {
    if (typeof window === 'undefined') return null;
    
    try {
        const response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + '/sanctum/csrf-cookie',
            {
                method: 'GET',
                credentials: 'include',
            }
        );
        
        if (response.ok) {
            // Wait a moment for cookies to be set
            await new Promise(resolve => setTimeout(resolve, 100));
            return getCSRFToken();
        }
    } catch (error) {
        console.error('Error refreshing CSRF token:', error);
    }
    return null;
};

// Create a base query with retry logic for auth failures
const baseQueryWithRetry = async (args, api, extraOptions) => {
    // Prepare headers with initial CSRF token
    const prepareHeaders = () => {
        const headers = new Headers();
        headers.set('Accept', 'application/json');
        
        const token = getCSRFToken();
        if (token) {
            headers.set('X-XSRF-TOKEN-PORTAL', token);
        }
        
        return headers;
    };

    // First attempt
    let result = await fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        prepareHeaders,
        credentials: 'include',
    })(args, api, extraOptions);

    // If we get a 401, try refreshing CSRF token and retry once
    if (result.error && result.error.status === 401) {
        console.log('Received 401 error, attempting to refresh CSRF token and retry');
        
        // Refresh the CSRF token
        await refreshCSRF();
        
        // Retry the request with new token
        result = await fetchBaseQuery({
            baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
            prepareHeaders,
            credentials: 'include',
        })(args, api, extraOptions);
        
        // Log the final result for debugging
        if (result.error) {
            console.error('Request still failed after retry:', result.error);
        } else {
            console.log('Request succeeded after retry');
        }
    }

    return result;
};

// Enhanced API with better error handling and authentication
export const GeneralBaseAPI = createApi({
    reducerPath: 'general_service',
    baseQuery: baseQueryWithRetry,
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
