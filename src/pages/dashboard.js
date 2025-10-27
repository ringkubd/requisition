import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Badge, Card } from "flowbite-react";
import DataTable from "react-data-table-component";
import Status from "@/components/requisition/status";
import {
    getDashboardCashData,
    getDashboardData,
    useGetDashboardCashDataQuery,
    useGetDashboardDataQuery,
    getRunningQueriesThunk,
} from "@/store/service/dashboard";
import { useAuth } from "@/hooks/auth";
import { Tabs } from "flowbite-react";
import { AiFillGolden, AiFillMoneyCollect } from "react-icons/ai";
import moment from "moment";
import { wrapper } from "@/store";
import Link from "next/link";
import { isMobile } from "react-device-detect";

const Dashboard = () => {
    const { user } = useAuth();
    const [initialColumns, setInitialColumns] = useState([]);
    const [cashColumns, setCashColumns] = useState([]);
    const [searchParams, setSearchParams] = useState({});
    const [searchCashParams, setSearchCashParams] = useState({});
    const { data, isLoading, isError, isSuccess } = useGetDashboardDataQuery(
        searchParams
    );

    const {
        data: cash,
        isLoading: cashISLoading,
        isError: cashISError,
        isSuccess: cashISSuccess,
    } = useGetDashboardCashDataQuery(searchCashParams);
    const [initialPending, setInitialPending] = useState(0);
    const [cashPending, setCashPending] = useState(0);

    useEffect(() => {
        if (isSuccess && data && user) {
            const pending = data.initial.filter((d) => {
                // return (d.current_status?.status === "Pending" || d.purchase_current_status?.status === "Pending")
                return d.purchase_current_status?.status === "Pending";
            }).length;
            setInitialPending(pending);
            setInitialColumns([
                {
                    name: "Sl",
                    selector: (row, sl) => sl + 1,
                    sortable: true,
                    maxWidth: "61px",
                    minWidth: "10px",
                    omit: isMobile,
                },
                {
                    name: "P.R. NO.",
                    selector: (row) =>
                        row.purchase_requisitions ? (
                            <Link
                                className={`underline text-blue-600 text-[10px] sm:text-sm font-medium`}
                                href={`/purchase-requisition/${row.purchase_requisitions.id}/print_view`}
                            >
                                {row.purchase_requisitions?.prf_no}
                            </Link>
                        ) : null,
                    sortable: true,
                    minWidth: "70px",
                    maxWidth: "100px",
                    compact: true,
                },
                {
                    name: "Category",
                    selector: (row) => row.category,
                    sortable: true,
                    maxWidth: "200px",
                    omit: isMobile,
                },
                {
                    name: "Req. Item",
                    selector: (row) => (
                        <div
                            className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-[200px]"
                            title={row.required_item}
                        >
                            {row.required_item}
                        </div>
                    ),
                    sortable: true,
                    minWidth: "90px",
                    grow: 1,
                    compact: true,
                },
                {
                    name: "Department",
                    selector: (row) => (
                        <div
                            className="text-[10px] sm:text-sm truncate max-w-[80px] sm:max-w-[100px]"
                            title={row.department?.name}
                        >
                            {row.department?.name}
                        </div>
                    ),
                    sortable: true,
                    minWidth: "70px",
                    maxWidth: "100px",
                    compact: true,
                },
                {
                    name: "Est. Cost",
                    selector: (row) => (
                        <div className="text-[10px] sm:text-sm font-semibold">
                            {Math.round(
                                parseFloat(
                                    row.purchase_requisitions
                                        ?.estimated_total_amount ?? 0
                                )
                            ).toLocaleString("bd")}
                        </div>
                    ),
                    sortable: true,
                    minWidth: "65px",
                    maxWidth: "100px",
                    right: true,
                    compact: true,
                },
                {
                    name: "Initialized By",
                    selector: (row) => row.user?.name,
                    sortable: true,
                    omit: isMobile,
                },
                {
                    name: "Generated at",
                    selector: (row) => row.created_at,
                    sortable: true,
                    omit: isMobile,
                },
                {
                    name: "Dept. Approved by",
                    selector: (row) => (
                        <div
                            className="text-[10px] sm:text-sm truncate max-w-[100px] sm:max-w-[120px]"
                            title={
                                row?.approval_status?.departmentApprovedBy?.name
                            }
                        >
                            {row?.approval_status?.departmentApprovedBy?.name}
                        </div>
                    ),
                    sortable: true,
                    compact: true,
                },
                // {
                //     name: 'Initial',
                //     selector: row => <Status key={initialPending+row.id} requisition={row} type={'initial'} />,
                //     omit: (row) =>  {
                //         console.log(row)
                //     }
                // },
                {
                    name: "Approval Status",
                    selector: (row) =>
                        row.purchase_requisitions ? (
                            <div className="py-0.5 sm:py-1">
                                <Status
                                    key={
                                        initialPending +
                                        row.purchase_requisitions.id
                                    }
                                    requisition={row}
                                    type={"purchase"}
                                />
                            </div>
                        ) : (
                            ""
                        ),
                    minWidth: "100px",
                    compact: true,
                },
            ]);
        }
    }, [data, isSuccess, user]);
    useEffect(() => {
        if (cashISSuccess && cash && user) {
            const pending = cash.cash.filter((d) => {
                return d.current_status?.status === "Pending";
            }).length;
            setCashPending(pending);
            setCashColumns([
                {
                    name: "Sl",
                    selector: (row, sl) => sl + 1,
                    sortable: true,
                    maxWidth: "61px",
                    minWidth: "10px",
                    omit: isMobile,
                },
                {
                    name: "P.R. NO.",
                    selector: (row) => (
                        <Link
                            className={`underline text-blue-600 text-[10px] sm:text-sm font-medium`}
                            href={`/cash-requisition/${row.id}/print_view`}
                        >
                            {row.prf_no}
                        </Link>
                    ),
                    sortable: true,
                    minWidth: "70px",
                    maxWidth: "100px",
                    compact: true,
                },
                {
                    name: "Department",
                    selector: (row) => (
                        <div
                            className="text-[10px] sm:text-sm truncate max-w-[80px] sm:max-w-[100px]"
                            title={row.department?.name}
                        >
                            {row.department?.name}
                        </div>
                    ),
                    sortable: true,
                    minWidth: "70px",
                    maxWidth: "100px",
                    omit: isMobile,
                    compact: true,
                },
                {
                    name: "Est. Cost",
                    selector: (row) => (
                        <div className="text-[10px] sm:text-sm font-semibold">
                            {parseFloat(row.total_cost ?? 0).toLocaleString(
                                "bd"
                            )}
                        </div>
                    ),
                    sortable: true,
                    minWidth: "65px",
                    maxWidth: "100px",
                    right: true,
                    compact: true,
                },
                {
                    name: "Generated By",
                    selector: (row) => row.user?.name,
                    sortable: true,
                    omit: isMobile,
                },
                {
                    name: "Generated at",
                    selector: (row) =>
                        moment(row.created_at).format("hh:mm DD MMM Y"),
                    sortable: true,
                    omit: isMobile,
                },
                {
                    name: "Dept. Approved by",
                    selector: (row) => (
                        <div
                            className="text-[10px] sm:text-sm truncate max-w-[100px] sm:max-w-[120px]"
                            title={
                                row?.approval_status?.departmentApprovedBy?.name
                            }
                        >
                            {row?.approval_status?.departmentApprovedBy?.name}
                        </div>
                    ),
                    sortable: true,
                    omit: isMobile,
                    compact: true,
                },
                {
                    name: "Approval Status",
                    selector: (row) => (
                        <div className="py-0.5 sm:py-1">
                            <Status
                                key={cashPending + row.id}
                                requisition={row}
                                type={"cash"}
                            />
                        </div>
                    ),
                    minWidth: "100px",
                    compact: true,
                },
            ]);
        }
    }, [cash, cashISSuccess, user]);

    const changeSearchParams = (key, value) => {
        setSearchParams({ ...searchParams, [key]: value, page: 1 });
    };

    const conditionalRowStyles = [
        {
            when: (row) =>
                row?.current_status?.status === "Rejected" ||
                row?.purchase_current_status?.status === "Rejected",
            style: (row) => ({
                backgroundColor: "#f5e6f1",
                boxShadow: "10px 10px red",
                textShadow: "text-shadow: 2px 2px red",
            }),
        },
    ];

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head>
                <title>{process.env.APP_NAME} - Dashboard</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
                />
            </Head>

            <div className="py-2 sm:py-4 md:py-12 w-full">
                <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-1 sm:p-4 bg-white border-b border-gray-200">
                            <Card className={`shadow-none border-0`}>
                                <Tabs.Group
                                    aria-label={
                                        "Requisition Status and Approval Management"
                                    }
                                    style={`fullWidth`}
                                    className="text-xs sm:text-sm"
                                >
                                    <Tabs.Item
                                        title={
                                            <div
                                                className={`flex flex-row items-center gap-1 text-xs sm:text-sm px-1`}
                                            >
                                                <span className="hidden sm:inline">
                                                    General Requisition
                                                </span>
                                                <span className="sm:hidden text-[10px]">
                                                    General
                                                </span>
                                                {initialPending ? (
                                                    <Badge
                                                        className={`animate-bounce ml-0.5 sm:ml-1 text-[9px] sm:text-xs`}
                                                        color={`pink`}
                                                    >
                                                        {initialPending}
                                                    </Badge>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        }
                                        icon={AiFillGolden}
                                    >
                                        <div className="overflow-x-auto -mx-1 sm:-mx-4">
                                            <div className="inline-block min-w-full align-middle">
                                                <div
                                                    className="overflow-hidden"
                                                    style={{
                                                        minWidth: "800px",
                                                    }}
                                                >
                                                    <DataTable
                                                        columns={initialColumns}
                                                        data={data?.initial}
                                                        progressPending={
                                                            isLoading
                                                        }
                                                        pagination
                                                        paginationServer
                                                        responsive
                                                        persistTableHead
                                                        dense={isMobile}
                                                        highlightOnHover
                                                        pointerOnHover
                                                        onChangePage={(
                                                            page,
                                                            totalRows
                                                        ) =>
                                                            setSearchParams({
                                                                ...searchParams,
                                                                page: page,
                                                            })
                                                        }
                                                        onChangeRowsPerPage={(
                                                            currentRowsPerPage,
                                                            currentPage
                                                        ) =>
                                                            setSearchParams({
                                                                ...searchParams,
                                                                page: currentPage,
                                                                per_page: currentRowsPerPage,
                                                            })
                                                        }
                                                        paginationTotalRows={
                                                            data?.number_of_rows
                                                        }
                                                        paginationPerPage={15}
                                                        paginationRowsPerPageOptions={[
                                                            10,
                                                            15,
                                                            25,
                                                            50,
                                                        ]}
                                                        conditionalRowStyles={
                                                            conditionalRowStyles
                                                        }
                                                        customStyles={{
                                                            headRow: {
                                                                style: {
                                                                    fontSize: isMobile
                                                                        ? "9px"
                                                                        : "14px",
                                                                    fontWeight:
                                                                        "600",
                                                                    minHeight: isMobile
                                                                        ? "36px"
                                                                        : "48px",
                                                                    paddingLeft: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                    paddingRight: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                },
                                                            },
                                                            rows: {
                                                                style: {
                                                                    fontSize: isMobile
                                                                        ? "10px"
                                                                        : "13px",
                                                                    minHeight: isMobile
                                                                        ? "40px"
                                                                        : "56px",
                                                                    paddingLeft: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                    paddingRight: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                },
                                                            },
                                                            cells: {
                                                                style: {
                                                                    paddingLeft: isMobile
                                                                        ? "2px"
                                                                        : "8px",
                                                                    paddingRight: isMobile
                                                                        ? "2px"
                                                                        : "8px",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title={
                                            <div
                                                className={`flex flex-row items-center gap-1 text-xs sm:text-sm px-1`}
                                            >
                                                <span className="hidden sm:inline">
                                                    Cash Requisition
                                                </span>
                                                <span className="sm:hidden text-[10px]">
                                                    Cash
                                                </span>
                                                {cashPending ? (
                                                    <Badge
                                                        className={`animate-bounce ml-0.5 sm:ml-1 text-[9px] sm:text-xs`}
                                                        color={`pink`}
                                                    >
                                                        {cashPending}
                                                    </Badge>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        }
                                        icon={AiFillMoneyCollect}
                                    >
                                        <div className="overflow-x-auto -mx-1 sm:-mx-4">
                                            <div className="inline-block min-w-full align-middle">
                                                <div
                                                    className="overflow-hidden"
                                                    style={{
                                                        minWidth: "800px",
                                                    }}
                                                >
                                                    <DataTable
                                                        columns={cashColumns}
                                                        data={cash?.cash}
                                                        progressPending={
                                                            isLoading
                                                        }
                                                        pagination
                                                        paginationServer
                                                        responsive
                                                        persistTableHead
                                                        dense={isMobile}
                                                        highlightOnHover
                                                        pointerOnHover
                                                        onChangePage={(
                                                            page,
                                                            totalRows
                                                        ) =>
                                                            setSearchCashParams(
                                                                {
                                                                    ...searchCashParams,
                                                                    page: page,
                                                                }
                                                            )
                                                        }
                                                        onChangeRowsPerPage={(
                                                            currentRowsPerPage,
                                                            currentPage
                                                        ) =>
                                                            setSearchCashParams(
                                                                {
                                                                    ...searchCashParams,
                                                                    page: currentPage,
                                                                    per_page: currentRowsPerPage,
                                                                }
                                                            )
                                                        }
                                                        paginationTotalRows={
                                                            cash?.number_of_rows
                                                        }
                                                        paginationPerPage={15}
                                                        paginationRowsPerPageOptions={[
                                                            10,
                                                            15,
                                                            25,
                                                            50,
                                                        ]}
                                                        conditionalRowStyles={
                                                            conditionalRowStyles
                                                        }
                                                        customStyles={{
                                                            headRow: {
                                                                style: {
                                                                    fontSize: isMobile
                                                                        ? "9px"
                                                                        : "14px",
                                                                    fontWeight:
                                                                        "600",
                                                                    minHeight: isMobile
                                                                        ? "36px"
                                                                        : "48px",
                                                                    paddingLeft: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                    paddingRight: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                },
                                                            },
                                                            rows: {
                                                                style: {
                                                                    fontSize: isMobile
                                                                        ? "10px"
                                                                        : "13px",
                                                                    minHeight: isMobile
                                                                        ? "40px"
                                                                        : "56px",
                                                                    paddingLeft: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                    paddingRight: isMobile
                                                                        ? "4px"
                                                                        : "16px",
                                                                },
                                                            },
                                                            cells: {
                                                                style: {
                                                                    paddingLeft: isMobile
                                                                        ? "2px"
                                                                        : "8px",
                                                                    paddingRight: isMobile
                                                                        ? "2px"
                                                                        : "8px",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Tabs.Item>
                                </Tabs.Group>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        // const params = context.params
        store.dispatch(getDashboardData.initiate());
        store.dispatch(getDashboardCashData.initiate());
        await Promise.all(store.dispatch(getRunningQueriesThunk()));
        return {
            props: {},
        };
    }
);

export default Dashboard;
