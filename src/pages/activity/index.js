import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from '@/lib/axios'
import { Card, TextInput, Button, Select, Label, Dropdown } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import { setActivity } from '@/store/slice/activitySlice'
import moment from 'moment'
import { AiOutlineSearch, AiOutlineCalendar, AiOutlineFilter } from 'react-icons/ai'
import Datepicker from 'react-tailwindcss-datepicker'

const Activity = () =>
{
    const dispatch = useDispatch()
    const activity = useSelector( state => state.activity )
    const [ initialColumns, setInitialColumns ] = useState( [] )

    // State for pagination, sorting, and search
    const [ loading, setLoading ] = useState( false )
    const [ loadingFilters, setLoadingFilters ] = useState( false )
    const [ totalRows, setTotalRows ] = useState( 0 )
    const [ perPage, setPerPage ] = useState( 10 )
    const [ currentPage, setCurrentPage ] = useState( 1 )
    const [ searchTerm, setSearchTerm ] = useState( '' )
    const [ sortColumn, setSortColumn ] = useState( 'created_at' )
    const [ sortDirection, setSortDirection ] = useState( 'desc' )
    const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState( '' )

    // Filter states
    const [ userFilter, setUserFilter ] = useState( '' )
    const [ modelFilter, setModelFilter ] = useState( '' )
    const [ eventFilter, setEventFilter ] = useState( '' )
    const [ dateFilter, setDateFilter ] = useState( {
        startDate: moment().subtract( 30, 'days' ).format( 'YYYY-MM-DD' ),
        endDate: moment().format( 'YYYY-MM-DD' )
    } )
    const [ showFilters, setShowFilters ] = useState( false )

    // Options for filters
    const [ userOptions, setUserOptions ] = useState( [] )
    const [ modelOptions, setModelOptions ] = useState( [] )
    const [ eventOptions, setEventOptions ] = useState( [] )

    // Debug state to help diagnose issues
    const [ responseStructure, setResponseStructure ] = useState( null )
    const [ activityData, setActivityData ] = useState( [] )

    // Function to fetch filter options from server
    const fetchFilterOptions = async () =>
    {
        setLoadingFilters( true )
        try
        {
            // Fetch users for the filter dropdown
            const usersResponse = await axios.get( '/api/activity/users' )

            // Fetch models for the filter dropdown
            const modelsResponse = await axios.get( '/api/activity/models' )

            // Fetch events for the filter dropdown
            const eventsResponse = await axios.get( '/api/activity/events' )

            // Process and set the user options
            if ( usersResponse.data && Array.isArray( usersResponse.data ) )
            {
                setUserOptions( usersResponse.data )
            } else if ( usersResponse.data && Array.isArray( usersResponse.data.data ) )
            {
                setUserOptions( usersResponse.data.data )
            }

            // Process and set the model options
            if ( modelsResponse.data && Array.isArray( modelsResponse.data ) )
            {
                setModelOptions( modelsResponse.data )
            } else if ( modelsResponse.data && Array.isArray( modelsResponse.data.data ) )
            {
                setModelOptions( modelsResponse.data.data )
            }

            // Process and set the event options
            if ( eventsResponse.data && Array.isArray( eventsResponse.data ) )
            {
                setEventOptions( eventsResponse.data )
            } else if ( eventsResponse.data && Array.isArray( eventsResponse.data.data ) )
            {
                setEventOptions( eventsResponse.data.data )
            }

        } catch ( error )
        {
            console.error( "Error fetching filter options:", error )
        } finally
        {
            setLoadingFilters( false )
        }
    }

    // Function to fetch data with pagination, search and sort parameters
    const fetchActivityData = async ( page = currentPage, size = perPage, search = searchTerm, sortField = sortColumn, sortDir = sortDirection, filters = {} ) =>
    {
        setLoading( true )

        try
        {
            const response = await axios.get( '/api/activity', {
                params: {
                    page,
                    per_page: size,
                    search,
                    sort_field: sortField,
                    sort_direction: sortDir,
                    user_id: filters.userId || userFilter,
                    model: filters.model || modelFilter,
                    event: filters.event || eventFilter,
                    start_date: filters.startDate || dateFilter.startDate,
                    end_date: filters.endDate || dateFilter.endDate
                }
            } )

            // Log the response to help debug structure issues
            console.log( 'API Response:', response.data )
            setResponseStructure( JSON.stringify( response.data, null, 2 ) )

            // Identify and extract the proper data structure
            let dataArray = []
            let total = 0

            // Handle different possible API response structures
            if ( response.data && response.data.activity && Array.isArray( response.data.activity.data ) )
            {
                // Structure: { activity: { data: [...], total: X } }
                dataArray = response.data.activity.data
                total = response.data.activity.total || response.data.meta?.total || dataArray.length
            } else if ( response.data && Array.isArray( response.data.data ) )
            {
                // Structure: { data: [...], total: X }
                dataArray = response.data.data
                total = response.data.total || response.data.meta?.total || dataArray.length
            } else if ( response.data && Array.isArray( response.data ) )
            {
                // Structure: [...]
                dataArray = response.data
                total = dataArray.length
            }

            // Update local state for direct use
            setActivityData( dataArray )

            // Also update Redux store (maintaining existing structure expectations)
            dispatch( setActivity( {
                activity: {
                    data: dataArray,
                    total: total
                },
                meta: {
                    total: total
                }
            } ) )

            // Set total rows for pagination
            setTotalRows( total )

        } catch ( error )
        {
            console.error( "Error fetching activity data:", error )
        } finally
        {
            setLoading( false )
        }
    }

    // Load filter options when component mounts or showFilters is toggled on
    useEffect( () =>
    {
        if ( showFilters && userOptions.length === 0 && modelOptions.length === 0 && eventOptions.length === 0 )
        {
            fetchFilterOptions()
        }
    }, [ showFilters ] )

    // Debounce search input to prevent too many API calls
    useEffect( () =>
    {
        const timer = setTimeout( () =>
        {
            setDebouncedSearchTerm( searchTerm )
        }, 500 )

        return () => clearTimeout( timer )
    }, [ searchTerm ] )

    // Fetch data when pagination, sorting or search parameters change
    useEffect( () =>
    {
        fetchActivityData( currentPage, perPage, debouncedSearchTerm, sortColumn, sortDirection )
    }, [ currentPage, perPage, debouncedSearchTerm, sortColumn, sortDirection ] )

    // Apply filters
    const applyFilters = () =>
    {
        setCurrentPage( 1 ) // Reset to page 1 when filters change
        fetchActivityData( 1, perPage, searchTerm, sortColumn, sortDirection )
    }

    // Reset all filters
    const resetFilters = () =>
    {
        setUserFilter( '' )
        setModelFilter( '' )
        setEventFilter( '' )
        setDateFilter( {
            startDate: moment().subtract( 30, 'days' ).format( 'YYYY-MM-DD' ),
            endDate: moment().format( 'YYYY-MM-DD' )
        } )

        // Fetch with reset filters
        setCurrentPage( 1 )
        fetchActivityData( 1, perPage, searchTerm, sortColumn, sortDirection, {
            userId: '',
            model: '',
            event: '',
            startDate: moment().subtract( 30, 'days' ).format( 'YYYY-MM-DD' ),
            endDate: moment().format( 'YYYY-MM-DD' )
        } )
    }

    // Handle page change
    const handlePageChange = page =>
    {
        setCurrentPage( page )
    }

    // Handle rows per page change
    const handlePerRowsChange = ( newPerPage, page ) =>
    {
        setPerPage( newPerPage )
        setCurrentPage( page )
    }

    // Handle search change
    const handleSearch = e =>
    {
        setSearchTerm( e.target.value )
        setCurrentPage( 1 ) // Reset to first page on new search
    }

    // Handle sorting
    const handleSort = ( column, sortDirection ) =>
    {
        setSortColumn( column.sortField || column.selector.name || 'created_at' )
        setSortDirection( sortDirection )
    }

    // Handle date range change
    const handleDateRangeChange = ( newDateRange ) =>
    {
        setDateFilter( newDateRange )
    }

    useEffect( () =>
    {
        // Set columns regardless of data state to ensure they're defined
        setInitialColumns( [
            {
                name: 'User',
                selector: row => row.causer?.name ?? 'N/A',
                sortable: true,
                sortField: 'causer_name',
            },
            {
                name: 'Model',
                selector: row => row.subject_type ?? 'N/A',
                sortable: true,
                sortField: 'subject_type',
            },
            {
                name: 'Model ID',
                selector: row => row.subject_id ?? 'N/A',
                sortable: true,
                sortField: 'subject_id',
            },
            {
                name: 'Event',
                selector: row => row.event ?? 'N/A',
                sortable: true,
                sortField: 'event',
            },
            {
                name: 'Description',
                selector: row => row.description ?? 'N/A',
                sortable: true,
                sortField: 'description',
            },
            {
                name: 'Old',
                selector: row => (
                    <pre className="max-w-xs overflow-x-auto">
                        {JSON.stringify( row.properties?.old || {}, null, 2 )}
                    </pre>
                ),
                sortable: false,
            },
            {
                name: 'Created at',
                selector: row =>
                    row.created_at ? moment( row.created_at ).format( 'hh:mm DD-MMM-Y' ) : 'N/A',
                sortable: true,
                sortField: 'created_at',
            },
        ] )
    }, [] )  // No dependencies, set once

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Activity
                </h2>
            }>
            <Head>
                <title>{process.env.APP_NAME} - Activity</title>
            </Head>

            <div className="py-8">
                <div className="max-w-screen mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <Card>
                                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                    <h2 className="text-xl font-bold">
                                        Latest Activity
                                        {loading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-full">
                                            <TextInput
                                                id="search"
                                                type="text"
                                                icon={AiOutlineSearch}
                                                placeholder="Search activities..."
                                                value={searchTerm}
                                                onChange={handleSearch}
                                            />
                                        </div>
                                        <Button
                                            color={showFilters ? "light" : "gray"}
                                            size="sm"
                                            onClick={() => setShowFilters( !showFilters )}
                                        >
                                            <AiOutlineFilter className="mr-2" />
                                            Filters {userFilter || modelFilter || eventFilter ? '(Active)' : ''}
                                        </Button>
                                    </div>
                                </div>

                                {/* Advanced Filters Section */}
                                {showFilters && (
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                        {loadingFilters ? (
                                            <div className="text-center py-4">
                                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                                                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                                                        Loading...
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500">Loading filter options...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {/* User Filter */}
                                                    <div>
                                                        <Label htmlFor="user-filter" value="User" className="mb-2" />
                                                        <Select
                                                            id="user-filter"
                                                            value={userFilter}
                                                            onChange={e => setUserFilter( e.target.value )}
                                                        >
                                                            <option value="">All Users</option>
                                                            {userOptions.map( user => (
                                                                <option key={user.id} value={user.id}>
                                                                    {user.name}
                                                                </option>
                                                            ) )}
                                                        </Select>
                                                    </div>

                                                    {/* Model Filter */}
                                                    <div>
                                                        <Label htmlFor="model-filter" value="Model" className="mb-2" />
                                                        <Select
                                                            id="model-filter"
                                                            value={modelFilter}
                                                            onChange={e => setModelFilter( e.target.value )}
                                                        >
                                                            <option value="">All Models</option>
                                                            {modelOptions.map( model => (
                                                                <option key={model} value={model}>
                                                                    {typeof model === 'string' ? model.split( '\\' ).pop() : model}
                                                                </option>
                                                            ) )}
                                                        </Select>
                                                    </div>

                                                    {/* Event Filter */}
                                                    <div>
                                                        <Label htmlFor="event-filter" value="Event" className="mb-2" />
                                                        <Select
                                                            id="event-filter"
                                                            value={eventFilter}
                                                            onChange={e => setEventFilter( e.target.value )}
                                                        >
                                                            <option value="">All Events</option>
                                                            {eventOptions.map( event => (
                                                                <option key={event} value={event}>
                                                                    {event}
                                                                </option>
                                                            ) )}
                                                        </Select>
                                                    </div>

                                                    {/* Date Range Filter */}
                                                    <div>
                                                        <Label htmlFor="date-filter" value="Date Range" className="mb-2" />
                                                        <Datepicker
                                                            inputId="date-filter"
                                                            inputClassName="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                            containerClassName="relative w-full"
                                                            value={dateFilter}
                                                            onChange={handleDateRangeChange}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-end gap-2">
                                                    <Button color="light" onClick={resetFilters}>
                                                        Reset Filters
                                                    </Button>
                                                    <Button onClick={applyFilters}>
                                                        Apply Filters
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Use the local activity data directly */}
                                <DataTable
                                    columns={initialColumns}
                                    data={activityData}
                                    progressPending={loading}
                                    pagination
                                    paginationServer
                                    paginationTotalRows={totalRows}
                                    paginationPerPage={perPage}
                                    paginationRowsPerPageOptions={[ 10, 20, 50, 100 ]}
                                    onChangePage={handlePageChange}
                                    onChangeRowsPerPage={handlePerRowsChange}
                                    sortServer
                                    onSort={handleSort}
                                    responsive
                                    highlightOnHover
                                    pointerOnHover
                                    striped
                                    fixedHeader
                                    persistTableHead
                                    defaultSortFieldId="created_at"
                                    defaultSortAsc={false}
                                    paginationComponentOptions={{
                                        rowsPerPageText: 'Records per page:',
                                        rangeSeparatorText: 'of',
                                        noRowsPerPage: false,
                                        selectAllRowsItem: false,
                                    }}
                                    noDataComponent={
                                        <div className="p-4 text-center">
                                            No activity records found
                                        </div>
                                    }
                                />

                                {/* Debug info section - can be removed in production */}
                                {process.env.NODE_ENV !== 'production' && (
                                    <details className="mt-4 p-3 bg-gray-50 rounded">
                                        <summary className="cursor-pointer text-sm text-gray-600">Debug Information</summary>
                                        <div className="mt-2">
                                            <p>Data Count: {activityData ? activityData.length : 0}</p>
                                            <p>Total Rows: {totalRows}</p>
                                            <p>Current Page: {currentPage}</p>
                                            <p>Sort: {sortColumn} ({sortDirection})</p>
                                            <p>Search: {searchTerm}</p>
                                            <p>Filters: User={userFilter}, Model={modelFilter}, Event={eventFilter}, DateRange={JSON.stringify( dateFilter )}</p>
                                            <div className="mt-2">
                                                <p className="font-medium">Response Structure:</p>
                                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                                                    {responseStructure || 'No data loaded yet'}
                                                </pre>
                                            </div>
                                            <div className="mt-2">
                                                <p className="font-medium">Filter Options:</p>
                                                <p>Users: {userOptions.length}, Models: {modelOptions.length}, Events: {eventOptions.length}</p>
                                            </div>
                                        </div>
                                    </details>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default Activity
