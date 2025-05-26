import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { wrapper } from '@/store'
import { Button, Card, Label, Select, TextInput } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import Actions from '@/components/actions'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import
{
    useGetIssueQuery,
    useDestroyIssueMutation,
    getRunningQueriesThunk,
    getIssue,
} from '@/store/service/issue'
import moment from 'moment'
import IssueStatus from '@/components/issue/Status'
import { useAuth } from '@/hooks/auth'
import Datepicker from 'react-tailwindcss-datepicker'
import { useGetDepartmentByOrganizationBranchQuery } from '@/store/service/deparment'
import { AiOutlineSearch } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { setDateRange } from '@/store/slice/filterDateRange'
import { hasPermission } from '@/lib/helpers'

// Debug helper function - safe to call on both client and server
const safeDebug = (section, message, data = {}) => {
    if (typeof window !== 'undefined') {
        console.log(`[DEBUG][${section}] ${message}`, data);
    }
};

// Dummy data for debugging purposes
const dummyIssueData = [
    {
        id: 1,
        uuid: 'abc-123',
        receiver: { name: 'John Doe' },
        receiver_department: { name: 'Engineering', id: 1 },
        issuer: { name: 'Jane Smith' },
        products: [ { id: 101 }, { id: 102 }, { id: 103 } ],
        created_at: '2025-05-24T10:30:00Z',
        department_status: true,
        store_status: true,
        updated_at: '2025-05-24T11:30:00Z'
    },
    {
        id: 2,
        uuid: 'def-456',
        receiver: { name: 'Robert Brown' },
        receiver_department: { name: 'Marketing', id: 2 },
        issuer: { name: 'Sarah Wilson' },
        products: [ { id: 201 }, { id: 202 } ],
        created_at: '2025-05-25T09:15:00Z',
        department_status: true,
        store_status: false,
        updated_at: '2025-05-25T09:45:00Z'
    },
    {
        id: 3,
        uuid: 'ghi-789',
        receiver: { name: 'Michael Lee' },
        receiver_department: { name: 'Finance', id: 3 },
        issuer: { name: 'Lisa Chen' },
        products: [ { id: 301 } ],
        created_at: '2025-05-26T08:00:00Z',
        department_status: false,
        store_status: false,
        updated_at: '2025-05-26T08:10:00Z'
    },
    {
        id: 4,
        uuid: 'jkl-012',
        receiver: { name: 'David Miller' },
        receiver_department: { name: 'IT', id: 4 },
        issuer: { name: 'Emily Jones' },
        products: [ { id: 401 }, { id: 402 }, { id: 403 }, { id: 404 } ],
        created_at: '2025-05-20T14:30:00Z',
        department_status: true,
        store_status: true,
        updated_at: '2025-05-20T15:00:00Z'
    }
];

// Dummy departments data
const dummyDepartmentsData = {
    data: [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Marketing' },
        { id: 3, name: 'Finance' },
        { id: 4, name: 'IT' },
        { id: 5, name: 'HR' },
        { id: 6, name: 'Operations' }
    ]
};

const ProductIssue = () =>
{
    // Debug state
    const [useDummyData, setUseDummyData] = useState(false);
    const [debugLog, setDebugLog] = useState([]);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    
    // Check URL for debug mode on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const debugMode = urlParams.get('debug') === 'true';
            setUseDummyData(debugMode);
            setShowDebugPanel(debugMode);
            if (debugMode) {
                safeDebug('Init', 'Debug mode enabled, using dummy data');
                setDebugLog(prev => [...prev, {
                    time: new Date().toISOString(),
                    type: 'info',
                    source: 'init',
                    message: 'Debug mode enabled, using dummy data'
                }]);
            }
        }
    }, []);
    
    // Original code starts here
    const { user } = useAuth()
    const router = useRouter()
    const dispatch = useDispatch()
    const dateRange = useSelector( state => state.filter_date_range )
    const [ searchParams, setSearchParams ] = useState( {} )
    
    // Modified API calls with debug wrapper
    const issueQueryResult = useGetIssueQuery( searchParams );
    const departmentsQueryResult = useGetDepartmentByOrganizationBranchQuery();
    const [ destroy, destroyResponse ] = useDestroyIssueMutation();
    
    // Use either real or dummy data based on debug mode
    const { data, isLoading, isError } = useDummyData ? 
        { 
            data: { product_issue: dummyIssueData, number_of_rows: dummyIssueData.length }, 
            isLoading: false, 
            isError: false 
        } : 
        issueQueryResult;
        
    const {
        data: departments,
        isLoading: departmentsISLoading,
        isError: departmentsISError,
    } = useDummyData ? 
        { 
            data: dummyDepartmentsData, 
            isLoading: false, 
            isError: false 
        } : 
        departmentsQueryResult;
    
    // Log API errors for debugging
    useEffect(() => {
        if (issueQueryResult.error && !useDummyData) {
            safeDebug('API Error', 'Issue query error', issueQueryResult.error);
            setDebugLog(prev => [...prev, {
                time: new Date().toISOString(),
                type: 'error',
                source: 'useGetIssueQuery',
                message: issueQueryResult.error?.message || 'API request failed'
            }]);
        }
        
        if (departmentsQueryResult.error && !useDummyData) {
            safeDebug('API Error', 'Departments query error', departmentsQueryResult.error);
            setDebugLog(prev => [...prev, {
                time: new Date().toISOString(),
                type: 'error',
                source: 'useGetDepartmentByOrganizationBranchQuery',
                message: departmentsQueryResult.error?.message || 'API request failed'
            }]);
        }
    }, [issueQueryResult.error, departmentsQueryResult.error]);

    const [ columns, setColumns ] = useState( [] )
    const [ isStoreManager, setISStoreManager ] = useState(
        user?.role_object?.filter(
            r => r.name === 'Store Manager' || r.name === 'Super Admin',
        ).length,
    )
    const [ dataTableData, setDataTableData ] = useState( [] )

    useEffect( () =>
    {
        if ( user )
        {
            setISStoreManager(
                user?.role_object?.filter(
                    r => r.name === 'Store Manager' || r.name === 'Super Admin',
                ).length,
            )
        }
    }, [ user ] )

    useEffect( () =>
    {
        if ( !destroyResponse.isLoading && destroyResponse.isSuccess )
        {
            toast.success( 'Product Issue removed.' )
        }
    }, [ destroyResponse ] )

    useEffect( () =>
    {
        if ( !isLoading && !isError && data )
        {
            const issueData = data?.product_issue
            setDataTableData( issueData )
            setColumns( [
                {
                    name: 'SL.',
                    selector: ( row, index ) =>
                        row.receiver_department?.name + '/' + row.id,
                    sortable: true,
                },
                {
                    name: 'No. of Item',
                    selector: row => row.products?.length,
                    sortable: true,
                },
                {
                    name: 'Receiver',
                    selector: row => row.receiver?.name,
                    sortable: true,
                },
                {
                    name: 'Department',
                    selector: row => row.receiver_department?.name,
                    sortable: true,
                },
                {
                    name: 'Issuer',
                    selector: row => row.issuer?.name,
                    sortable: true,
                },
                {
                    name: 'Issue Time',
                    selector: row =>
                        moment( row.created_at ).format( 'D MMM Y @ H:mm ' ),
                    sortable: true,
                },
                {
                    name: 'Status',
                    selector: row => <IssueStatus key={row.uuid} row={row} />,
                },
                {
                    name: 'Actions',
                    cell: row => (
                        <Actions
                            itemId={row.uuid}
                            edit={
                                isStoreManager &&
                                    ( !row.store_status ||
                                        moment().diff(
                                            moment( row.updated_at ),
                                            'days',
                                        ) < 1 )
                                    ? `/issue/${row.uuid}/edit`
                                    : false
                            }
                            // view={`/issue/${row.uuid}/view`}
                            destroy={destroy}
                            print={`/issue/${row.uuid}/print_view`}
                            progressing={destroyResponse.isLoading}
                            permissionModule={`product-issues`}
                        />
                    ),
                    ignoreRowClick: true,
                },
            ] )
        }
    }, [ isLoading, data, isStoreManager ] )

    const changeSearchParams = ( key, value ) =>
    {
        setSearchParams( { ...searchParams, [ key ]: value, page: 1 } )
    }

    useEffect( () =>
    {
        const filterdData = Object.fromEntries(
            Object.entries( dateRange ).filter( ( [ _, v ] ) => v != null ),
        )
        if ( Object.keys( filterdData ).length )
        {
            changeSearchParams( 'dateRange', JSON.stringify( dateRange ) )
        } else
        {
            changeSearchParams( 'dateRange', '' )
        }
    }, [ dateRange ] )

    return (
        <>
            <Head>
                <title>Product Issue Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Issue Management{useDummyData && 
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
                                Debug Mode (Using Dummy Data)
                            </span>
                        }
                    </h2>
                }>
                <Head>
                    <title>Product Issue Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex sm:flex-row flex-col space-x-4 space-y-4  shadow-lg py-4 px-4">
                            {useDummyData && (
                                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center">
                                    <span className="text-sm text-yellow-800 mr-2">Debug Mode:</span>
                                    <Button 
                                        size="sm" 
                                        color={useDummyData ? "warning" : "light"}
                                        onClick={() => setUseDummyData(!useDummyData)}
                                    >
                                        {useDummyData ? 'Using Dummy Data' : 'Use Real Data'}
                                    </Button>
                                </div>
                            )}
                        
                            {hasPermission( 'create_product-issues', user ) ? (
                                <NavLink
                                    active={router.pathname === 'issue/create'}
                                    href={`issue/create`}>
                                    <Button>Create</Button>
                                </NavLink>
                            ) : null}
                            <div className={`flex sm:flex-row flex-col`}>
                                <Label
                                    htmlFor={`date_range`}
                                    value={'Date Range'}
                                    className={`font-bold`}
                                />
                                <Datepicker
                                    inputId={`date_range`}
                                    inputName={`date_range`}
                                    onChange={d =>
                                    {
                                        dispatch( setDateRange( d ) )
                                    }}
                                    value={dateRange}
                                />
                            </div>
                            <div>
                                {departments && isStoreManager ? (
                                    <label
                                        htmlFor={`user_department_id`}
                                        className={`flex flex-col sm:flex-row sm:items-center dark:text-black`}>
                                        Departments
                                        <Select
                                            className={`dark:text-black`}
                                            id={`user_department_id`}
                                            onChange={e =>
                                            {
                                                changeSearchParams(
                                                    'issuer_department_id',
                                                    e.target.value,
                                                )
                                            }}>
                                            <option></option>
                                            {departments?.data?.map( o => (
                                                <option key={o.id} value={o.id}>
                                                    {o.name}
                                                </option>
                                            ) )}
                                        </Select>
                                    </label>
                                ) : null}
                            </div>
                            <div>
                                <TextInput
                                    icon={AiOutlineSearch}
                                    onBlur={e =>
                                    {
                                        changeSearchParams(
                                            'search',
                                            e.target.value,
                                        )
                                    }}
                                />
                            </div>
                        </div>

                        <DataTable
                            columns={columns}
                            data={dataTableData}
                            pagination
                            responsive
                            progressPending={isLoading}
                            persistTableHead={true}
                            paginationServer
                            onChangePage={( page, totalRows ) =>
                                setSearchParams( {
                                    ...searchParams,
                                    page: page,
                                } )
                            }
                            onChangeRowsPerPage={(
                                currentRowsPerPage,
                                currentPage,
                            ) =>
                                setSearchParams( {
                                    ...searchParams,
                                    page: currentPage,
                                    per_page: currentRowsPerPage,
                                } )
                            }
                            paginationResetDefaultPage={false}
                            paginationTotalRows={data?.number_of_rows}
                            paginationPerPage={15}
                        />
                        
                        {/* Debug Panel - Only shown in debug mode */}
                        {showDebugPanel && (
                            <div className="mt-4 p-4 border-t border-gray-200">
                                <details className="bg-gray-50 rounded-lg p-3">
                                    <summary className="font-bold text-red-600 cursor-pointer">
                                        Debug Information (click to expand)
                                    </summary>
                                    <div className="mt-3 overflow-auto max-h-96 bg-gray-100 p-3 rounded text-xs font-mono">
                                        <div className="mb-3 flex space-x-2">
                                            <Button 
                                                size="xs" 
                                                color={useDummyData ? "warning" : "light"}
                                                onClick={() => setUseDummyData(!useDummyData)}
                                            >
                                                {useDummyData ? 'Using Dummy Data' : 'Switch to Dummy Data'}
                                            </Button>
                                            <Button 
                                                size="xs" 
                                                color="light"
                                                onClick={() => setDebugLog([])}
                                            >
                                                Clear Debug Log
                                            </Button>
                                        </div>
                                        
                                        <h3 className="font-bold mb-2">Component State:</h3>
                                        <pre className="overflow-auto p-2 bg-white border rounded">
                                            {JSON.stringify({
                                                useDummyData,
                                                isLoading,
                                                isError,
                                                dataRowCount: dataTableData?.length || 0,
                                                hasRealApiData: !useDummyData && !!issueQueryResult.data,
                                                hasColumns: columns?.length > 0,
                                                searchParams
                                            }, null, 2)}
                                        </pre>

                                        <h3 className="font-bold mt-4 mb-2">Debug Log:</h3>
                                        <div className="overflow-auto p-2 bg-white border rounded">
                                            {debugLog.map((log, i) => (
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
                                            ))}
                                        </div>

                                        {!useDummyData && (
                                            <>
                                                <h3 className="font-bold mt-4 mb-2">API Errors:</h3>
                                                <pre className="overflow-auto p-2 bg-white border rounded">
                                                    {JSON.stringify({
                                                        issueQueryError: issueQueryResult.error ? {
                                                            message: issueQueryResult.error.message,
                                                            status: issueQueryResult.error.status
                                                        } : null,
                                                        departmentsQueryError: departmentsQueryResult.error ? {
                                                            message: departmentsQueryResult.error.message,
                                                            status: departmentsQueryResult.error.status
                                                        } : null
                                                    }, null, 2)}
                                                </pre>
                                            </>
                                        )}

                                        {useDummyData && (
                                            <>
                                                <h3 className="font-bold mt-4 mb-2">Sample Dummy Data:</h3>
                                                <pre className="overflow-auto p-2 bg-white border rounded">
                                                    {JSON.stringify(dummyIssueData[0], null, 2)}
                                                </pre>
                                            </>
                                        )}
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

export const getServerSideProps = wrapper.getServerSideProps(
    store => async context =>
    {
        // Check for debug mode in URL
        const debugMode = context.query?.debug === 'true';
        if (debugMode) {
            console.log('[SERVER] Debug mode enabled, skipping API calls');
            return { props: {} };
        }
        
        // Only run API calls if not in debug mode
        store.dispatch( getIssue.initiate() )
        await Promise.all( store.dispatch( getRunningQueriesThunk() ) )
        return {
            props: {},
        }
    },
)

export default ProductIssue
