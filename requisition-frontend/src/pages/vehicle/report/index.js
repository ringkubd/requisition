import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { wrapper } from '@/store'
import { Button, Card, Label } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import Actions from '@/components/actions'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import {
    getVehicleHistory,
    useDestroyVehicleHistoryMutation,
    useGetVehicleHistoryQuery,
    getRunningQueriesThunk,
} from '@/store/service/vehicle/VehicleHistoryAPI'
import moment from 'moment'
import Select from 'react-select'
import { useReactToPrint } from 'react-to-print'
import Datepicker from 'react-tailwindcss-datepicker'
import { useGetVehicleQuery } from "@/store/service/vehicle/VehicleAPI";

const Vehicle = () => {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [month, setMonth] = useState('')
    const [vehicle, setVehicle] = useState('')
    const [date, setDate] = useState('')
    const dateRef = useRef()
    const {
        data: vehicles,
        isLoading: vehicleIsLoading,
        isError: vehicleIsError,
    } = useGetVehicleQuery()
    const { data, isLoading, isError } = useGetVehicleHistoryQuery({
        page,
        month,
        date,
        vehicle
    })
    const [destroy, destroyResponse] = useDestroyVehicleHistoryMutation()
    const [columns, setColumns] = useState([])
    const dataRef = useRef(null)

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('Fuel entry deleted.')
        }
    }, [destroyResponse])
    useEffect(() => {
        if (!isLoading && !isError && data) {
            setColumns([
                {
                    name: 'Vehicle',
                    selector: row => row?.vehicle,
                    sortable: true,
                    width: '350px',
                },
                {
                    name: 'Date',
                    selector: row => moment(row.refuel_date).format('DD MMM Y'),
                    sortable: true,
                },
                {
                    name: 'P.R. No.',
                    selector: row => row?.cashRequisition?.prf_no,
                    sortable: true,
                },
                {
                    name: 'Bill No.',
                    selector: row => row.bill_no,
                    sortable: true,
                },
                {
                    name: 'Fuel',
                    selector: row => row.unit,
                    sortable: true,
                },
                {
                    name: 'Quantity',
                    selector: row => row.quantity,
                    sortable: true,
                },
                {
                    name: 'Rate',
                    selector: row => row.rate,
                    sortable: true,
                },
                {
                    name: 'Value',
                    selector: row =>
                        parseFloat(row.rate * row.quantity).toFixed(2),
                    sortable: true,
                },
                {
                    name: 'Supplier',
                    selector: row => row?.pump?.name,
                    sortable: true,
                },
                {
                    name: 'Last Mileage',
                    selector: row => row?.last_mileage,
                    sortable: true,
                },
                {
                    name: 'Current Mileage',
                    selector: row => row?.current_mileage,
                    sortable: true,
                },
                {
                    name: 'Mileage',
                    selector: row => row?.current_mileage - row?.last_mileage,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: row => (
                        <Actions
                            itemId={row.id}
                            // edit={`/vehicle/${row.id}/edit`}
                            // view={`/category/${row.id}/view`}
                            destroy={destroy}
                            progressing={destroyResponse.isLoading}
                            permissionModule={`vehicles`}
                        />
                    ),
                    ignoreRowClick: true,
                },
            ])
        }
    }, [isLoading, isError, data])

    const handlePrint = useReactToPrint({
        content: () => dataRef.current,
        onBeforePrint: a => console.log(a),
    })

    return (
        <>
            <Head>
                <title>Vehicle Fuel Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Vehicle Fuel Management.
                    </h2>
                }>
                <Head>
                    <title>Vehicle Fuel Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row shadow-lg py-4 px-4">
                            <NavLink
                                active={
                                    router.pathname === 'vehicle/report/create'
                                }
                                href={`/vehicle/report/create`}>
                                <Button>Add New</Button>
                            </NavLink>
                            <NavLink
                                active={router.pathname === 'vehicle'}
                                href={`/vehicle`}>
                                <Button color="success">Vehicle</Button>
                            </NavLink>
                            <NavLink
                                active={router.pathname === 'pump'}
                                href={`/vehicle/pump`}>
                                <Button color="purple">Pump</Button>
                            </NavLink>
                            <NavLink
                                active={router.pathname === 'pump'}
                                href={`/vehicle/report/monthly`}>
                                <Button color="indigo">Monthly Report</Button>
                            </NavLink>
                            <Button
                                color="indigo"
                                className={`m-3`}
                                onClick={handlePrint}>
                                Print
                            </Button>
                            <div
                                className={`flex flex-row justify-center items-center space-x-3 ml-4`}>
                                <Label>Month</Label>
                                <Select
                                    options={Array.from(
                                        { length: 24 - 1 + 1 },
                                        (_, i) => i,
                                    ).map((m, index) => ({
                                        label: moment()
                                            .subtract(index, 'month')
                                            .format('MMM y'),
                                        value: moment()
                                            .subtract(index, 'month')
                                            .format('MM-y'),
                                    }))}
                                    defaultValue={{
                                        value: moment().format('MM-y'),
                                        label: moment().format('MMM y'),
                                    }}
                                    onChange={value => {
                                        setMonth(value.value)
                                    }}
                                />
                            </div>
                            {vehicles && (
                                <div
                                    className={`flex flex-row justify-center items-center space-x-3 ml-4`}>
                                    <Label>Vehicle</Label>
                                    <Select
                                        options={vehicles?.data?.map(d => ({
                                            label: d.reg_no,
                                            value: d.id,
                                        }))}
                                        onChange={value => {
                                            setVehicle(value.value)
                                        }}
                                    />
                                </div>
                            )}

                            <div
                                className={`flex flex-row justify-center items-center space-x-3 ml-4`}>
                                <Label>Date</Label>
                                <Datepicker
                                    ref={dateRef}
                                    useRange={false}
                                    asSingle={true}
                                    onChange={d => setDate(d.startDate)}
                                    value={{ startDate: date, endDate: date }}
                                />
                            </div>
                        </div>
                        {data && !isLoading ? (
                            <div ref={dataRef}>
                                <DataTable
                                    loading={isLoading}
                                    defaultSortField="id"
                                    defaultSortAsc={false}
                                    highlightOnHover
                                    columns={columns}
                                    data={data?.data}
                                    responsive
                                    progressPending={isLoading}
                                    pagination
                                    persistTableHead
                                    paginationPerPage={15}
                                    paginationServer
                                    paginationTotalRows={data?.number_of_rows}
                                    onChangePage={page => setPage(page)}
                                />
                            </div>
                        ) : null}
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    store => async context => {
        // const params = context.params
        store.dispatch(getVehicleHistory.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default Vehicle
