import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import DataTable from "react-data-table-component";
import Status from "@/components/requisition/status";
import {
    getDashboardCashData,
    getDashboardData,
    useGetDashboardCashDataQuery,
    useGetDashboardDataQuery,
    getRunningQueriesThunk
} from "@/store/service/dashboard";
import { useAuth } from "@/hooks/auth";
import { Tabs } from 'flowbite-react';
import { AiFillGolden, AiFillMoneyCollect } from "react-icons/ai";
import moment from "moment";
import { wrapper } from "@/store";
import Link from "next/link";

const Dashboard = () => {
    const { user } = useAuth()
    const [initialColumns, setInitialColumns] = useState([]);
    const [cashColumns, setCashColumns] = useState([]);
    const [searchParams, setSearchParams] = useState({});
    const [searchCashParams, setSearchCashParams] = useState({});
    const {data, isLoading, isError, isSuccess} = useGetDashboardDataQuery(searchParams);
    const {data: cash, isLoading: cashISLoading, isError: cashISError, isSuccess: cashISSuccess} = useGetDashboardCashDataQuery(searchCashParams);

    useEffect(() => {
        if (isSuccess && data && user){
            setInitialColumns([
                {
                    name: 'Sl',
                    selector: (row, sl) => sl + 1,
                    sortable: true,
                },
                {
                    name: 'I.R. NO.',
                    selector: row => <Link className={`underline text-blue-600`} href={`/initial-requisition/${row.id}/print_view`}>{row.irf_no}</Link>,
                    sortable: true,
                },
                {
                    name: 'P.R. NO.',
                    selector: row =>  row.purchase_requisitions ? <Link className={`underline text-blue-600`} href={`/purchase-requisition/${row.purchase_requisitions.id}/print_view`}>{row.purchase_requisitions?.prf_no}</Link> : null,
                    sortable: true,
                },
                {
                    name: 'Total Req. Unit',
                    selector: row => row.total_required_unit,
                    sortable: true,
                },
                {
                    name: 'Department',
                    selector: row => row.department?.name,
                    sortable: true,
                },
                {
                    name: 'Estimated Cost',
                    selector: row => parseFloat(row.purchase_requisitions?.estimated_total_amount ?? 0).toLocaleString('bd'),
                    sortable: true,
                },
                {
                    name: 'Generated By',
                    selector: row => row.user?.name,
                    sortable: true,
                },
                {
                    name: 'Created at',
                    selector: row => row.created_at,
                    sortable: true,
                },
                {
                    name: 'Initial',
                    selector: row => <Status key={row.id} requisition={row} type={'initial'} />,
                    omit: false
                },
                {
                    name: 'Purchase',
                    selector: row => row.purchase_requisitions ? <Status key={row.purchase_requisitions.id} requisition={row} type={'purchase'} /> : ''
                }
            ])
        }
    }, [data, isSuccess, user])
    useEffect(() => {
        if (cashISSuccess && cash && user){
            setCashColumns([
                {
                    name: 'Sl',
                    selector: (row, sl) => sl + 1,
                    sortable: true,
                },
                {
                    name: 'P.R. NO.',
                    selector: row => <Link className={`underline text-blue-600`} href={`/cash-requisition/${row.id}/print_view`}>{row.prf_no}</Link>,
                    sortable: true,
                },
                {
                    name: 'Department',
                    selector: row => row.department?.name,
                    sortable: true,
                },
                {
                    name: 'Estimated Cost',
                    selector: row => parseFloat(row.total_cost ?? 0).toLocaleString('bd'),
                    sortable: true,
                },
                {
                    name: 'Generated By',
                    selector: row => row.user?.name,
                    sortable: true,
                },
                {
                    name: 'Created at',
                    selector: row => moment(row.created_at).format('hh:mm DD MMM Y'),
                    sortable: true,
                },
                {
                    name: 'Status',
                    selector: row => <Status key={row.id} requisition={row} type={'cash'} />
                }
            ])
        }
    }, [cash, cashISSuccess, user])

    const changeSearchParams = (key, value) => {
        setSearchParams({...searchParams , [key]: value, page: 1});
    }

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }>
            <Head>
                <title>{process.env.APP_NAME} - Dashboard</title>
            </Head>

            <div className="py-12">
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <Card className={`overflow-x-auto`}>
                                <Tabs.Group aria-label={"Requisition Status and Approval Management"} style={`fullWidth`}>
                                    <Tabs.Item title={`General Requisition`} icon={AiFillGolden}>
                                        <DataTable
                                            columns={initialColumns}
                                            data={data?.initial}
                                            progressPending={isLoading}
                                            pagination
                                            paginationServer
                                            responsive
                                            persistTableHead
                                            onChangePage={(page, totalRows) => setSearchParams({
                                                ...searchParams,
                                                'page': page
                                            })}
                                            onChangeRowsPerPage={(currentRowsPerPage, currentPage) => setSearchParams({
                                                ...searchParams,
                                                'page': currentPage,
                                                per_page: currentRowsPerPage
                                            })}
                                            paginationTotalRows={data?.number_of_rows}
                                            paginationPerPage={15}
                                        />
                                    </Tabs.Item>
                                    <Tabs.Item title={`Cash Requisition`} icon={AiFillMoneyCollect}>
                                        <DataTable
                                            columns={cashColumns}
                                            data={cash?.cash}
                                            progressPending={isLoading}
                                            pagination
                                            paginationServer
                                            responsive
                                            persistTableHead
                                            onChangePage={(page, totalRows) => setSearchCashParams({
                                                ...searchCashParams,
                                                'page': page
                                            })}
                                            onChangeRowsPerPage={(currentRowsPerPage, currentPage) => setSearchCashParams({
                                                ...searchCashParams,
                                                'page': currentPage,
                                                per_page: currentRowsPerPage
                                            })}
                                            paginationTotalRows={cash?.number_of_rows}
                                            paginationPerPage={15}
                                        />
                                    </Tabs.Item>
                                </Tabs.Group>
                            </Card>

                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getDashboardData.initiate())
    store.dispatch(getDashboardCashData.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Dashboard
