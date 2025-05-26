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
import {
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


const ProductIssue = () => {
    const { user } = useAuth()
    const router = useRouter()
    const dispatch = useDispatch()
    const dateRange = useSelector(state => state.filter_date_range)
    const [searchParams, setSearchParams] = useState({})
    const { data, isLoading, isError } = useGetIssueQuery(searchParams)
    const {
        data: departments,
        isLoading: departmentsISLoading,
        isError: departmentsISError,
    } = useGetDepartmentByOrganizationBranchQuery()
    const [destroy, destroyResponse] = useDestroyIssueMutation()
    const [columns, setColumns] = useState([])
    const [isStoreManager, setISStoreManager] = useState(
        user?.role_object?.filter(
            r => r.name === 'Store Manager' || r.name === 'Super Admin',
        ).length,
    )
    const [dataTableData, setDataTableData] = useState([])

    // Debug: Log initial states
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.debug('ProductIssue: user', user)
        console.debug('ProductIssue: searchParams', searchParams)
        console.debug('ProductIssue: data', data)
        console.debug('ProductIssue: isLoading', isLoading)
        console.debug('ProductIssue: isError', isError)
        console.debug('ProductIssue: departments', departments)
        console.debug('ProductIssue: columns', columns)
        console.debug('ProductIssue: dataTableData', dataTableData)
    }

    useEffect(() => {
        if (user) {
            setISStoreManager(
                user?.role_object?.filter(
                    r => r.name === 'Store Manager' || r.name === 'Super Admin',
                ).length,
            )
        }
    }, [user])

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('Product Issue removed.')
        }
    }, [destroyResponse])

    useEffect(() => {
        try {
            if (!isLoading && !isError && data) {
                const issueData = data?.product_issue
                setDataTableData(issueData)
                setColumns([
                {
                    name: 'SL.',
                    selector: (row, index) =>
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
                        moment(row.created_at).format('D MMM Y @ H:mm '),
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
                                (!row.store_status ||
                                    moment().diff(
                                        moment(row.updated_at),
                                        'days',
                                    ) < 1)
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
                ])
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('ProductIssue: Error in useEffect (columns/data)', err)
        }
    }, [isLoading, data, isStoreManager])

    const changeSearchParams = (key, value) => {
        setSearchParams({ ...searchParams, [key]: value, page: 1 })
    }

    useEffect(() => {
        const filterdData = Object.fromEntries(
            Object.entries(dateRange).filter(([_, v]) => v != null),
        )
        if (Object.keys(filterdData).length) {
            changeSearchParams('dateRange', JSON.stringify(dateRange))
        } else {
            changeSearchParams('dateRange', '')
        }
    }, [dateRange])

    // Debug: Wrap DataTable in try/catch
    let dataTableRender = null
    try {
        dataTableRender = (
            <DataTable
                columns={columns}
                data={dataTableData}
                pagination
                responsive
                progressPending={isLoading}
                persistTableHead={true}
                paginationServer
                onChangePage={(page, totalRows) =>
                    setSearchParams({
                        ...searchParams,
                        page: page,
                    })
                }
                onChangeRowsPerPage={(
                    currentRowsPerPage,
                    currentPage,
                ) =>
                    setSearchParams({
                        ...searchParams,
                        page: currentPage,
                        per_page: currentRowsPerPage,
                    })
                }
                paginationResetDefaultPage={false}
                paginationTotalRows={data?.number_of_rows}
                paginationPerPage={15}
            />
        )
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('ProductIssue: Error rendering DataTable', err)
        dataTableRender = <div style={{ color: 'red' }}>Error rendering DataTable</div>
    }

    return (
        <>
            <Head>
                <title>Product Issue Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Issue Management.
                    </h2>
                }>
                <Head>
                    <title>Product Issue Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex sm:flex-row flex-col space-x-4 space-y-4  shadow-lg py-4 px-4">
                            {hasPermission('create_product-issues', user) ? (
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
                                    onChange={d => {
                                        dispatch(setDateRange(d))
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
                                            onChange={e => {
                                                changeSearchParams(
                                                    'issuer_department_id',
                                                    e.target.value,
                                                )
                                            }}>
                                            <option></option>
                                            {departments?.data?.map(o => (
                                                <option key={o.id} value={o.id}>
                                                    {o.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </label>
                                ) : null}
                            </div>
                            <div>
                                <TextInput
                                    icon={AiOutlineSearch}
                                    onBlur={e => {
                                        changeSearchParams(
                                            'search',
                                            e.target.value,
                                        )
                                    }}
                                />
                            </div>
                        </div>

                        {dataTableRender}
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    store => async context => {
        // const params = context.params
        store.dispatch(getIssue.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default ProductIssue
