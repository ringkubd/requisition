import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { wrapper } from '@/store'
import { useAuth } from '@/hooks/auth'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import moment from 'moment'

// UI Components
import { Button, Card, Label, Select, TextInput } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import Datepicker from 'react-tailwindcss-datepicker'
import { AiOutlineSearch } from 'react-icons/ai'

// Navigation & Layout
import AppLayout from '@/components/Layouts/AppLayout'
import NavLink from '@/components/navLink'
import Actions from '@/components/actions'

// Services & Helpers
import
{
    useGetIssueQuery,
    useDestroyIssueMutation,
    getRunningQueriesThunk,
    getIssue,
} from '@/store/service/issue'
import { useGetDepartmentByOrganizationBranchQuery } from '@/store/service/deparment'
import { setDateRange } from '@/store/slice/filterDateRange'
import { hasPermission } from '@/lib/helpers'

// Create debug function that safely logs to console in both client and server environments
const safeDebug = ( location, message, data ) =>
{
    try
    {
        // Check if we're on client side
        if ( typeof window !== 'undefined' )
        {
            console.log( `[ISSUE-DEBUG][${location}]`, message, data );
        }
    } catch ( e )
    {
        // Fail silently if any errors occur during logging
    }
};

const ProductIssue = () =>
{
    // Debug initialization
    safeDebug( 'Component Init', 'Starting ProductIssue component', { time: new Date().toISOString() } );

    // Hooks & State
    const { user } = useAuth()
    safeDebug( 'Auth Hook', 'User auth loaded', { userExists: !!user } );

    const router = useRouter()
    const dispatch = useDispatch()

    // Debug Redux state
    let dateRange;
    try
    {
        dateRange = useSelector( state =>
        {
            safeDebug( 'Redux State', 'Reading filter_date_range', state?.filter_date_range );
            return state?.filter_date_range || {};
        } );
    } catch ( err )
    {
        safeDebug( 'Redux Error', 'Error reading filter_date_range', err );
        dateRange = {};
    }

    // Client-side rendering protection
    const [ isMounted, setIsMounted ] = useState( false )
    safeDebug( 'State Init', 'isMounted initial state', { isMounted: false } );

    // Local state
    const [ searchParams, setSearchParams ] = useState( {} )
    const [ dataTableData, setDataTableData ] = useState( [] )
    const [ columns, setColumns ] = useState( [] )
    const [ isStoreManager, setIsStoreManager ] = useState( false )
    const [ debugLog, setDebugLog ] = useState( [] ) // State to store debug logs

    // API Queries - will only run after component is mounted
    safeDebug( 'API Query Setup', 'Setting up API queries', { searchParams, isMounted } );

    // Debug wrapper for API hooks
    const useDebugQuery = ( queryHook, ...args ) =>
    {
        const result = queryHook( ...args );
        safeDebug( 'API Query Result', 'Query result', {
            isLoading: result.isLoading,
            isError: result.isError,
            hasData: !!result.data,
            errorMessage: result.error?.message
        } );
        return result;
    };

    const {
        data,
        isLoading,
        isError,
        error
    } = useDebugQuery( useGetIssueQuery, searchParams, {
        skip: !isMounted
    } );

    // Add error to debug log if present
    useEffect( () =>
    {
        if ( error )
        {
            safeDebug( 'API Error', 'Error in useGetIssueQuery', {
                message: error.message,
                status: error.status,
                data: error.data,
                stack: error.stack
            } );
            setDebugLog( prev => [ ...prev, {
                time: new Date().toISOString(),
                type: 'error',
                source: 'useGetIssueQuery',
                message: error.message
            } ] );
        }
    }, [ error ] );

    const {
        data: departments,
        error: departmentsError
    } = useDebugQuery( useGetDepartmentByOrganizationBranchQuery, undefined, {
        skip: !isMounted
    } );

    const [ destroy, destroyResponse ] = useDestroyIssueMutation()

    // Client-side only execution
    useEffect( () =>
    {
        safeDebug( 'Lifecycle', 'Component mounted', { timestamp: new Date().toISOString() } );
        setIsMounted( true );

        // Record environment info for debugging
        try
        {
            const envInfo = {
                isServer: typeof window === 'undefined',
                isClient: typeof window !== 'undefined',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
                url: typeof window !== 'undefined' ? window.location.href : 'N/A',
                nextData: typeof window !== 'undefined' && window.__NEXT_DATA__ ?
                    {
                        buildId: window.__NEXT_DATA__.buildId,
                        page: window.__NEXT_DATA__.page
                    } : 'N/A'
            };
            safeDebug( 'Environment', 'Environment information', envInfo );
            setDebugLog( prev => [ ...prev, {
                time: new Date().toISOString(),
                type: 'info',
                source: 'mount',
                message: 'Component mounted',
                data: envInfo
            } ] );
        } catch ( err )
        {
            safeDebug( 'Error', 'Error collecting environment info', err );
        }

        // Define cleanup function
        return () =>
        {
            safeDebug( 'Lifecycle', 'Component unmounting', { timestamp: new Date().toISOString() } );
        };
    }, [] )

    // Setup store manager status
    useEffect( () =>
    {
        safeDebug( 'User Effect', 'User effect running', { hasUser: !!user } );

        if ( !user )
        {
            safeDebug( 'User Effect', 'No user available', null );
            setDebugLog( prev => [ ...prev, {
                time: new Date().toISOString(),
                type: 'warning',
                source: 'userEffect',
                message: 'No user available'
            } ] );
            return;
        }

        try
        {
            // Debug user object safely
            const userSummary = {
                id: user?.id,
                hasRoleObject: !!user?.role_object,
                roleObjectType: user?.role_object ? typeof user.role_object : 'undefined',
                isArray: Array.isArray( user?.role_object ),
                roles: Array.isArray( user?.role_object ) ?
                    user.role_object.map( r => r?.name ).filter( Boolean ) : [],
                selectedDepartment: user?.selected_department
            };
            safeDebug( 'User Info', 'User data summary', userSummary );

            // Add user info to debug log
            setDebugLog( prev => [ ...prev, {
                time: new Date().toISOString(),
                type: 'info',
                source: 'userEffect',
                message: 'User data processed',
                data: userSummary
            } ] );

            const isManager = user?.role_object?.filter(
                r => r && r.name && ( r.name === 'Store Manager' || r.name === 'Super Admin' )
            )?.length > 0 || false;

            safeDebug( 'Permission Check', 'Store manager status determined', { isManager } );
            setIsStoreManager( isManager );
        } catch ( error )
        {
            safeDebug( 'Error', 'Error determining store manager status', error );
            setDebugLog( prev => [ ...prev, {
                time: new Date().toISOString(),
                type: 'error',
                source: 'userEffect',
                message: 'Error determining store manager status',
                error: error.message
            } ] );
            setIsStoreManager( false );
        }
    }, [ user ] )

    // Handle destroy response
    useEffect( () =>
    {
        if ( !destroyResponse.isLoading && destroyResponse.isSuccess )
        {
            toast.success( 'Product Issue removed.' )
        }
    }, [ destroyResponse ] )

    // Setup table columns and data
    useEffect( () =>
    {
        safeDebug( 'Table Effect', 'Table effect running', {
            isLoading,
            isError,
            hasData: !!data
        } );

        if ( isLoading || isError || !data )
        {
            if ( isLoading )
            {
                safeDebug( 'Table Effect', 'Loading data, returning early', null );
            } else if ( isError )
            {
                safeDebug( 'Table Effect', 'Error loading data, returning early', null );
            } else if ( !data )
            {
                safeDebug( 'Table Effect', 'No data available, returning early', null );
            }
            return;
        }

        try
        {
            // Debug data structure
            const dataStructure = {
                hasProductIssue: !!data?.product_issue,
                productIssueType: data?.product_issue ? typeof data.product_issue : 'undefined',
                isArray: Array.isArray( data?.product_issue ),
                itemCount: Array.isArray( data?.product_issue ) ? data.product_issue.length : 0,
                sampleItem: data?.product_issue?.[ 0 ] ? {
                    hasUuid: !!data.product_issue[ 0 ].uuid,
                    hasProducts: !!data.product_issue[ 0 ].products,
                    departmentStatus: data.product_issue[ 0 ].department_status,
                    storeStatus: data.product_issue[ 0 ].store_status
                } : 'No items'
            };
            safeDebug( 'Data Structure', 'Data structure analysis', dataStructure );

            // Add data structure to debug log
            setDebugLog( prev => [ ...prev, {
                time: new Date().toISOString(),
                type: 'info',
                source: 'tableEffect',
                message: 'Analyzing data structure',
                data: dataStructure
            } ] );

            const issueData = data?.product_issue || []
            setDataTableData( issueData )

            const tableColumns = [
                {
                    name: 'SL.',
                    cell: row =>
                    {
                        try
                        {
                            return row.receiver_department?.name + '/' + row.id
                        } catch ( e )
                        {
                            return row?.id || 'N/A'
                        }
                    },
                    sortable: true,
                },
                {
                    name: 'No. of Items',
                    cell: row =>
                    {
                        try
                        {
                            return Array.isArray( row.products ) ? row.products.length : 0
                        } catch ( e )
                        {
                            return 0
                        }
                    },
                    sortable: true,
                },
                {
                    name: 'Receiver',
                    cell: row =>
                    {
                        try
                        {
                            return row.receiver?.name || 'N/A'
                        } catch ( e )
                        {
                            return 'N/A'
                        }
                    },
                    sortable: true,
                },
                {
                    name: 'Department',
                    cell: row =>
                    {
                        try
                        {
                            return row.receiver_department?.name || 'N/A'
                        } catch ( e )
                        {
                            return 'N/A'
                        }
                    },
                    sortable: true,
                },
                {
                    name: 'Issuer',
                    cell: row =>
                    {
                        try
                        {
                            return row.issuer?.name || 'N/A'
                        } catch ( e )
                        {
                            return 'N/A'
                        }
                    },
                    sortable: true,
                },
                {
                    name: 'Issue Time',
                    cell: row =>
                    {
                        try
                        {
                            return moment( row.created_at ).format( 'D MMM Y @ H:mm' )
                        } catch ( e )
                        {
                            return 'N/A'
                        }
                    },
                    sortable: true,
                },
                {
                    name: 'Status',
                    cell: row =>
                    {
                        if ( !row ) return "N/A"

                        try
                        {
                            // Simple text representation of status
                            if ( row.department_status && row.store_status )
                            {
                                return <span className="text-green-600 font-medium">Approved & Issued</span>
                            } else if ( row.department_status )
                            {
                                return <span className="text-yellow-600">Pending in store</span>
                            } else
                            {
                                return <span className="text-blue-600">Pending in department</span>
                            }
                        } catch ( e )
                        {
                            return "Status unavailable"
                        }
                    },
                    sortable: false,
                },
                {
                    name: 'Actions',
                    cell: row =>
                    {
                        if ( !row || !row.uuid ) return null

                        try
                        {
                            const editAllowed = isStoreManager &&
                                ( !row.store_status || moment().diff( moment( row.updated_at ), 'days' ) < 1 )

                            return (
                                <Actions
                                    itemId={row.uuid}
                                    edit={editAllowed ? `/issue/${row.uuid}/edit` : false}
                                    destroy={destroy}
                                    print={`/issue/${row.uuid}/print_view`}
                                    progressing={destroyResponse.isLoading}
                                    permissionModule="product-issues"
                                />
                            )
                        } catch ( e )
                        {
                            console.error( "Error rendering actions:", e )
                            return null
                        }
                    },
                    ignoreRowClick: true,
                },
            ]

            setColumns( tableColumns )
        } catch ( error )
        {
            console.error( "Error setting up table:", error )
            setDataTableData( [] )
        }
    }, [ isLoading, data, isStoreManager, destroyResponse.isLoading ] )

    // Update search parameters
    const changeSearchParams = ( key, value ) =>
    {
        setSearchParams( prev => ( { ...prev, [ key ]: value, page: 1 } ) )
    }

    // Handle date range changes
    useEffect( () =>
    {
        try
        {
            const filteredData = Object.fromEntries(
                Object.entries( dateRange ).filter( ( [ _, v ] ) => v != null )
            )

            if ( Object.keys( filteredData ).length )
            {
                changeSearchParams( 'dateRange', JSON.stringify( dateRange ) )
            } else
            {
                changeSearchParams( 'dateRange', '' )
            }
        } catch ( error )
        {
            console.error( "Error processing date range:", error )
        }
    }, [ dateRange ] )

    // Error component
    const ErrorComponent = () => (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 my-4 text-center">
            <h3 className="text-red-600 font-semibold text-lg mb-2">Error Loading Data</h3>
            <p className="text-gray-700 mb-4">There was a problem loading the product issues.</p>
            <Button
                color="failure"
                onClick={() => window.location.reload()}
            >
                Refresh Page
            </Button>
        </div>
    )

    // Main render
    return (
        <>
            <Head>
                <title>Product Issue Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Issue Management
                    </h2>
                }
            >
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        {/* Filters and Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
                            {hasPermission( 'create_product-issues', user ) && (
                                <div>
                                    <NavLink
                                        active={router.pathname === 'issue/create'}
                                        href="issue/create"
                                    >
                                        <Button>Create</Button>
                                    </NavLink>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-start gap-2">
                                <Label htmlFor="date_range" value="Date Range" className="font-medium pt-2" />
                                <Datepicker
                                    inputId="date_range"
                                    inputName="date_range"
                                    onChange={d => dispatch( setDateRange( d ) )}
                                    value={dateRange}
                                    classNames="z-50" // Ensure proper stacking
                                />
                            </div>

                            {departments && isStoreManager && (
                                <div className="flex flex-col sm:flex-row items-start gap-2">
                                    <Label htmlFor="user_department_id" className="font-medium pt-2">
                                        Departments
                                    </Label>
                                    <Select
                                        id="user_department_id"
                                        onChange={e => changeSearchParams( 'issuer_department_id', e.target.value )}
                                        className="min-w-[200px]"
                                    >
                                        <option value="">All Departments</option>
                                        {departments?.data?.map( department => (
                                            <option key={department.id} value={department.id}>
                                                {department.name}
                                            </option>
                                        ) )}
                                    </Select>
                                </div>
                            )}

                            <div className="flex-grow">
                                <TextInput
                                    icon={AiOutlineSearch}
                                    placeholder="Search..."
                                    onKeyPress={e =>
                                    {
                                        if ( e.key === 'Enter' )
                                        {
                                            changeSearchParams( 'search', e.target.value )
                                        }
                                    }}
                                    onBlur={e => changeSearchParams( 'search', e.target.value )}
                                />
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="p-2">
                            {isError ? (
                                <ErrorComponent />
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={dataTableData || []}
                                    pagination
                                    responsive
                                    progressPending={isLoading || !isMounted}
                                    progressComponent={
                                        <div className="p-6 text-center">
                                            <div className="loader mx-auto"></div>
                                            <p className="mt-4 text-gray-600">Loading data...</p>
                                        </div>
                                    }
                                    persistTableHead
                                    paginationServer
                                    noDataComponent={
                                        <div className="p-6 text-center text-gray-500">No product issues found</div>
                                    }
                                    onChangePage={page =>
                                        setSearchParams( prev => ( {
                                            ...prev,
                                            page: page,
                                        } ) )
                                    }
                                    onChangeRowsPerPage={( currentRowsPerPage, currentPage ) =>
                                        setSearchParams( prev => ( {
                                            ...prev,
                                            page: currentPage,
                                            per_page: currentRowsPerPage,
                                        } ) )
                                    }
                                    paginationTotalRows={data?.number_of_rows || 0}
                                    paginationPerPage={15}
                                    paginationComponentOptions={{
                                        rowsPerPageText: 'Items per page:',
                                    }}
                                />
                            )}
                        </div>

                        {/* Debug Panel - Visible only in development or with ?debug=true query param */}
                        {typeof window !== 'undefined' &&
                            ( process.env.NODE_ENV === 'development' ||
                                ( typeof window.location.search === 'string' &&
                                    window.location.search.includes( 'debug=true' ) ) ) && (
                                <div className="mt-4 p-4 border-t border-gray-200">
                                    <details className="bg-gray-50 rounded-lg p-3">
                                        <summary className="font-bold text-red-600 cursor-pointer">
                                            Debug Information (click to expand)
                                        </summary>
                                        <div className="mt-3 overflow-auto max-h-96 bg-gray-100 p-3 rounded text-xs font-mono">
                                            <h3 className="font-bold mb-2">Component State:</h3>
                                            <pre className="overflow-auto p-2 bg-white border rounded">
                                                {JSON.stringify( {
                                                    isMounted,
                                                    isStoreManager,
                                                    hasData: !!data,
                                                    hasColumns: columns.length,
                                                    dataRowCount: dataTableData?.length || 0,
                                                    searchParams
                                                }, null, 2 )}
                                            </pre>

                                            <h3 className="font-bold mt-4 mb-2">Debug Log:</h3>
                                            <div className="overflow-auto p-2 bg-white border rounded">
                                                {debugLog.map( ( log, i ) => (
                                                    <div key={i} className={`mb-1 p-1 border-b ${log.type === 'error' ? 'bg-red-50' :
                                                            log.type === 'warning' ? 'bg-yellow-50' : 'bg-white'
                                                        }`}>
                                                        <span className="text-gray-500">{log.time}</span>
                                                        <span className={`ml-2 font-bold ${log.type === 'error' ? 'text-red-600' :
                                                                log.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                                            }`}>
                                                            [{log.source}]
                                                        </span>
                                                        <span className="ml-2">{log.message}</span>
                                                    </div>
                                                ) )}
                                            </div>

                                            <h3 className="font-bold mt-4 mb-2">API Errors:</h3>
                                            <pre className="overflow-auto p-2 bg-white border rounded">
                                                {JSON.stringify( {
                                                    error: error ? {
                                                        message: error.message,
                                                        status: error.status
                                                    } : null,
                                                    departmentsError: departmentsError ? {
                                                        message: departmentsError.message,
                                                        status: departmentsError.status
                                                    } : null
                                                }, null, 2 )}
                                            </pre>
                                        </div>
                                    </details>
                                </div>
                            )}
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

// export const getServerSideProps = wrapper.getServerSideProps(
// Helper for server-side debugging
const serverDebug = ( location, message, data = {} ) =>
{
    try
    {
        console.log( `[SERVER-DEBUG][${location}]`, message, JSON.stringify( data, null, 2 ) );
    } catch ( e )
    {
        console.log( `[SERVER-DEBUG][Error]`, "Error serializing debug data" );
    }
};

export const getServerSideProps = wrapper.getServerSideProps(
    store => async ( context ) =>
    {
        serverDebug( 'getServerSideProps', 'Starting server-side rendering', {
            path: context.resolvedUrl,
            query: context.query
        } );

        // We don't run any API fetches here to avoid document/window errors

        // Check environment
        const environment = {
            nodeEnv: process.env.NODE_ENV,
            isProduction: process.env.NODE_ENV === 'production',
            hasCookies: !!context.req?.headers?.cookie,
            userAgent: context.req?.headers[ 'user-agent' ]
        };

        serverDebug( 'getServerSideProps', 'Environment information', environment );

        try
        {
            return { props: {} };
        } catch ( error )
        {
            serverDebug( 'getServerSideProps', 'Error in server-side props', {
                error: error.message,
                stack: error.stack
            } );

            return { props: {} };
        }
    }
)

export default ProductIssue
