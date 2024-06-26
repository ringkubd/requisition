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
import Image from 'next/image'
import {
    getPurchase,
    useGetPurchaseQuery,
    useDestroyPurchaseMutation,
    getRunningQueriesThunk,
} from '@/store/service/purchase'
import Datepicker from 'react-tailwindcss-datepicker'
import { useGetDepartmentByOrganizationBranchQuery } from '@/store/service/deparment'
import { AiOutlineSearch } from 'react-icons/ai'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { setDateRange } from '@/store/slice/filterDateRange'

const Purchase = () => {
    const router = useRouter()
    const [searchParams, setSearchParams] = useState({})
    const { data, isLoading, isError, isSuccess } = useGetPurchaseQuery(
        searchParams,
    )
    const [destroy, destroyResponse] = useDestroyPurchaseMutation()
    const [columns, setColumns] = useState([])
    const {
        data: departments,
        isLoading: departmentsISLoading,
        isError: departmentsISError,
    } = useGetDepartmentByOrganizationBranchQuery()
    const dispatch = useDispatch()
    const dateRange = useSelector(state => state.filter_date_range)

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('Supplier deleted.')
        }
    }, [destroyResponse])

    useEffect(() => {
        if (isSuccess && data) {
            setColumns([
                {
                    name: 'SL',
                    selector: (row, index) => index + 1,
                    sortable: true,
                    width: '38px',
                    style: {
                        padding: 0,
                    },
                },
                {
                    name: 'Product',
                    selector: row => (
                        <Link href={`product/${row.product?.id}/view`}>
                            {row.product?.title +
                                (row.productOption?.title.includes('N/A')
                                    ? ''
                                    : ' - ' + row.productOption?.title)}
                        </Link>
                    ),
                    sortable: true,
                    minWidth: '220px',
                },
                {
                    name: 'Supplier',
                    selector: row =>
                        row.supplier?.logo ? (
                            <Link href={`/suppliers/${row.supplier_id}/view`}>
                                <Image
                                    width={30}
                                    height={30}
                                    alt={row.supplier?.name}
                                    src={row.supplier?.logo}
                                />
                            </Link>
                        ) : row.supplier?.name ? (
                            <Link href={`/suppliers/${row.supplier_id}/view`}>
                                {' '}
                                {row.supplier?.name}{' '}
                            </Link>
                        ) : null,
                    sortable: true,
                },
                {
                    name: 'P.R. No.',
                    selector: row => (
                        <Link
                            href={`purchase-requisition/${row.purchaseRequisition?.id}/view`}>
                            {row.purchaseRequisition?.prf_no}
                        </Link>
                    ),
                    sortable: true,
                    width: '96px',
                },
                {
                    name: 'Qty',
                    selector: row => row.qty + ' (' + row.product?.unit + ')',
                    sortable: true,
                    width: '90px',
                },
                {
                    name: 'Unit Price',
                    selector: row => row.unit_price,
                    sortable: true,
                    width: '100px',
                },
                {
                    name: 'Purchase Date',
                    selector: row => row.purchase_date,
                    sortable: true,
                },
                {
                    name: 'Available Qty.',
                    selector: row => row.available_qty,
                    sortable: true,
                },
                {
                    name: 'Total',
                    selector: row => row.total_price,
                    sortable: true,
                },
                {
                    name: 'Notes',
                    selector: row => row.notes,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: row => (
                        <Actions
                            itemId={row.id}
                            // edit={`/purchase/${row.id}/edit`}
                            view={`/purchase/${row.id}/view`}
                            destroy={destroy}
                            progressing={destroyResponse.isLoading}
                            permissionModule={`purchases`}
                        />
                    ),
                    ignoreRowClick: true,
                },
            ])
        }
    }, [data, isLoading, isSuccess])

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

    return (
        <>
            <Head>
                <title>Purchase Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Purchase Management.
                    </h2>
                }>
                <Head>
                    <title>Purchase Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'purchase/create'}
                                href={`purchase/create`}>
                                <Button>Create</Button>
                            </NavLink>
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
                                {departments ? (
                                    <label
                                        htmlFor={`department_id`}
                                        className={`flex flex-col sm:flex-row sm:items-center dark:text-black`}>
                                        Departments
                                        <Select
                                            className={`dark:text-black`}
                                            id={`department_id`}
                                            onChange={e => {
                                                changeSearchParams(
                                                    'department_id',
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
                        {!isLoading && !isError && data && (
                            <DataTable
                                columns={columns}
                                data={data.data}
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
                                paginationTotalRows={data?.total_rows}
                                paginationPerPage={10}
                            />
                        )}
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    store => async context => {
        // const params = context.params
        store.dispatch(getPurchase.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default Purchase
