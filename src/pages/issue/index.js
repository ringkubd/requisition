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

const ProductIssue = () =>
{
    // Hooks & State
    const { user } = useAuth()
    const router = useRouter()
    const dispatch = useDispatch()
    const dateRange = useSelector( state => state.filter_date_range )

    // Client-side rendering protection
    const [ isMounted, setIsMounted ] = useState( false )

    // Local state
    const [ searchParams, setSearchParams ] = useState( {} )
    const [ dataTableData, setDataTableData ] = useState( [] )
    const [ columns, setColumns ] = useState( [] )
    const [ isStoreManager, setIsStoreManager ] = useState( false )

    // API Queries - will only run after component is mounted
    const {
        data,
        isLoading,
        isError
    } = useGetIssueQuery( searchParams, {
        skip: !isMounted
    } )

    const {
        data: departments,
    } = useGetDepartmentByOrganizationBranchQuery( undefined, {
        skip: !isMounted
    } )

    const [ destroy, destroyResponse ] = useDestroyIssueMutation()

    // Client-side only execution
    useEffect( () =>
    {
        setIsMounted( true )
    }, [] )

    // Setup store manager status
    useEffect( () =>
    {
        if ( !user ) return

        try
        {
            const isManager = user?.role_object?.filter(
                r => r && r.name && ( r.name === 'Store Manager' || r.name === 'Super Admin' )
            )?.length > 0 || false;

            setIsStoreManager( isManager )
        } catch ( error )
        {
            console.error( "Error determining store manager status:", error )
            setIsStoreManager( false )
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
        if ( isLoading || isError || !data ) return

        try
        {
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
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    store => async () =>
    {
        // No actions in getServerSideProps to avoid document/window errors
        return { props: {} }
    }
)

export default ProductIssue
