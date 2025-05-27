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

// Dummy data for fallback when API fails with auth errors
const dummyIssueData = {
    product_issue: [
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
        }
    ],
    number_of_rows: 3
};

const dummyDepartmentData = {
    data: [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Marketing' },
        { id: 3, name: 'Finance' },
        { id: 4, name: 'IT' },
        { id: 5, name: 'HR' }
    ]
};

const ProductIssue = () =>
{
    // Add state for tracking authentication issues
    const [ hasAuthError, setHasAuthError ] = useState( false );
    const [ usingDummyData, setUsingDummyData ] = useState( false );

    const { user } = useAuth()
    const router = useRouter()
    const dispatch = useDispatch()
    const dateRange = useSelector( state => state.filter_date_range )
    const [ searchParams, setSearchParams ] = useState( {} )

    // Get issue data from API
    const issueResult = useGetIssueQuery( searchParams );
    const departmentsResult = useGetDepartmentByOrganizationBranchQuery();

    // Check for authentication errors
    useEffect( () =>
    {
        if ( issueResult.error && issueResult.error.status === 401 )
        {
            console.warn( "Authentication error in issue API, falling back to dummy data" );
            setHasAuthError( true );
            setUsingDummyData( true );
        }
    }, [ issueResult.error ] );

    // Use either real data or fallback to dummy data
    const { data, isLoading, isError } = usingDummyData
        ? { data: dummyIssueData, isLoading: false, isError: false }
        : issueResult;

    const {
        data: departments,
        isLoading: departmentsISLoading,
        isError: departmentsISError,
    } = usingDummyData
            ? { data: dummyDepartmentData, isLoading: false, isError: false }
            : departmentsResult;

    const [ destroy, destroyResponse ] = useDestroyIssueMutation()

    // Modified destroy function to handle dummy mode
    const handleDestroy = ( id ) =>
    {
        if ( usingDummyData )
        {
            // Show success message for demo purposes
            toast.success( 'Dummy delete operation completed.' );
            return Promise.resolve( { data: { success: true } } );
        } else
        {
            return destroy( id );
        }
    };

    const [ columns, setColumns ] = useState( [] )
    const [ isStoreManager, setISStoreManager ] = useState(
        user?.role_object?.filter(
            r => r.name === 'Store Manager' || r.name === 'Super Admin',
        ).length || 1 // Default to 1 when using dummy data
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
                            destroy={handleDestroy}
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
                        Product Issue Management
                        {usingDummyData && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Using Dummy Data (Auth Error)
                            </span>
                        )}
                    </h2>
                }
            >
                <Head>
                    <title>Product Issue Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        {usingDummyData && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Authentication error detected. Using dummy data for demonstration.
                                            <a href="#" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1"
                                                onClick={() => { window.location.reload() }}>
                                                Try refreshing
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex sm:flex-row flex-col space-x-4 space-y-4 shadow-lg py-4 px-4">
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
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    store => async context =>
    {
        try {
            // Try to dispatch, but wrapped in try/catch to handle any auth errors
            store.dispatch( getIssue.initiate() )
            await Promise.all( store.dispatch( getRunningQueriesThunk() ) )
            
            // If we get here, the API call succeeded
            return {
                props: {
                    initialAuthState: 'success',
                },
            }
        } catch (error) {
            console.error('Server-side API error:', error);
            
            // Return indication that server-side API call failed
            return {
                props: {
                    initialAuthState: 'failed',
                    error: error?.message || 'Unknown error'
                },
            }
        }
    },
)

export default ProductIssue
