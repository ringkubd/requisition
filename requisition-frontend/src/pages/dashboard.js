import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useEffect, useState } from "react";
import { Badge, Card } from "flowbite-react";
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
import {isMobile} from "react-device-detect";

const Dashboard = () => {
    const { user } = useAuth()
    const [initialColumns, setInitialColumns] = useState([]);
    const [cashColumns, setCashColumns] = useState([]);
    const [searchParams, setSearchParams] = useState({});
    const [searchCashParams, setSearchCashParams] = useState({});
    const {data, isLoading, isError, isSuccess} = useGetDashboardDataQuery(searchParams);
    const {data: cash, isLoading: cashISLoading, isError: cashISError, isSuccess: cashISSuccess} = useGetDashboardCashDataQuery(searchCashParams);
    const [initialPending, setInitialPending] = useState(0);
    const [cashPending, setCashPending] = useState(0);

    useEffect(() => {
        if (isSuccess && data && user){
            const pending = data.initial.filter(d => {
                return  d.purchase_current_status?.status === "Pending"
            }).length;
            setInitialPending(pending);
            setInitialColumns([
                {
                    name: 'Sl',
                    selector: (row, sl) => sl + 1,
                    sortable: true,
                    maxWidth: "61px",
                    minWidth: "10px",
                    omit: isMobile
                },
                {
                    name: 'P.R. NO.',
                    selector: row =>  row.purchase_requisitions ? <Link className={`underline text-blue-600`} href={`/purchase-requisition/${row.purchase_requisitions.id}/print_view`}>{row.purchase_requisitions?.prf_no}</Link> : null,
                    sortable: true,
                    maxWidth: "50px",
                },
                {
                    name: 'Category',
                    selector: row => row.category,
                    sortable: true,
                    maxWidth: "200px",
                    omit: isMobile
                },
                {
                    name: 'Req. Item',
                    selector: row => row.required_item,
                    sortable: true,
                    maxWidth: "105px",
                },
                {
                    name: 'Department',
                    selector: row => row.department?.name,
                    sortable: true,
                    maxWidth: "120px",
                    minWidth: "10px",
                },
                {
                    name: 'Est. Cost',
                    selector: row => Math.round(parseFloat(row.purchase_requisitions?.estimated_total_amount ?? 0)).toLocaleString('bd'),
                    sortable: true,
                    maxWidth: "140px",
                    minWidth: "10px",
                },
                {
                    name: 'Initialized By',
                    selector: row => row.user?.name,
                    sortable: true,
                    omit: isMobile
                },
                {
                    name: 'Generated at',
                    selector: row => row.created_at,
                    sortable: true,
                    omit: isMobile
                },
                {
                    name: 'Dept. Approved by',
                    selector: row => row?.approval_status?.departmentApprovedBy?.name,
                    sortable: true,
                },
                // {
                //     name: 'Initial',
                //     selector: row => <Status key={initialPending+row.id} requisition={row} type={'initial'} />,
                //     omit: (row) =>  {
                //         console.log(row)
                //     }
                // },
                {
                    name: 'Approval Status',
                    selector: row => row.purchase_requisitions ? <Status key={initialPending + row.purchase_requisitions.id} requisition={row} type={'purchase'} /> : ''
                }
            ])
        }
    }, [data, isSuccess, user])
    useEffect(() => {
        if (cashISSuccess && cash && user){
            const pending = cash.cash.filter(d => {
                return d.current_status?.status === "Pending"
            }).length;
            setCashPending(pending);
            setCashColumns([
                {
                    name: 'Sl',
                    selector: (row, sl) => sl + 1,
                    sortable: true,
                    maxWidth: "61px",
                    minWidth: "10px",
                    omit: isMobile
                },
                {
                    name: 'P.R. NO.',
                    selector: row => <Link className={`underline text-blue-600`} href={`/cash-requisition/${row.id}/print_view`}>{row.prf_no}</Link>,
                    sortable: true,
                    maxWidth: "50px",
                },
                {
                    name: 'Department',
                    selector: row => row.department?.name,
                    sortable: true,
                    maxWidth: "120px",
                    minWidth: "10px",
                    omit: isMobile
                },
                {
                    name: 'Est. Cost',
                    selector: row => parseFloat(row.total_cost ?? 0).toLocaleString('bd'),
                    sortable: true,
                    maxWidth: "140px",
                    minWidth: "10px",
                },
                {
                    name: 'Generated By',
                    selector: row => row.user?.name,
                    sortable: true,
                    omit: isMobile
                },
                {
                    name: 'Generated at',
                    selector: row => moment(row.created_at).format('hh:mm DD MMM Y'),
                    sortable: true,
                    omit: isMobile
                },
                {
                    name: 'Dept. Approved by',
                    selector: row => row?.approval_status?.departmentApprovedBy?.name,
                    sortable: true,
                },
                {
                    name: 'Approval Status',
                    selector: row => <Status key={cashPending+row.id} requisition={row} type={'cash'} />
                }
            ])
        }
    }, [cash, cashISSuccess, user])

    const changeSearchParams = (key, value) => {
        setSearchParams({...searchParams , [key]: value, page: 1});
    }

    const conditionalRowStyles = [{
        when: row => row?.current_status?.status == 'Rejected',
        style: row => ({ backgroundColor:'#f5e6f1', boxShadow: '10px 10px red', textShadow: 'text-shadow: 2px 2px red' }),
    }];

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
                <div className="md:py-8  mx-0 lg:px-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-2 bg-white border-b border-gray-200">
                            <Card className={`overflow-x-auto`}>
                                <Tabs.Group aria-label={"Requisition Status and Approval Management"} style={`fullWidth`}>
                                    <Tabs.Item title={<div className={`flex flex-row`}>General Requisition {initialPending ? <sup><Badge className={`animate-bounce`} color={`pink`}>{initialPending}</Badge></sup> : ""}</div>} icon={AiFillGolden}>
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
                                            conditionalRowStyles={conditionalRowStyles}
                                        />
                                    </Tabs.Item>
                                    <Tabs.Item title={<div className={`flex flex-row`}>Cash Requisition { cashPending ? <sup><Badge className={`animate-bounce`} color={`pink`}>{cashPending}</Badge></sup> : ""}</div>} icon={AiFillMoneyCollect}>
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
                                            conditionalRowStyles={conditionalRowStyles}
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
