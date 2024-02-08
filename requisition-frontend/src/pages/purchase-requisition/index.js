import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { dispatch, wrapper } from "@/store";
import { Button, Card, Datepicker, TextInput } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import Actions from "@/components/actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getPurchaseRequisition,
    useDestroyPurchaseRequisitionMutation,
    useGetPurchaseRequisitionQuery,
    getRunningQueriesThunk
} from "@/store/service/requisitions/purchase";
import moment from "moment";
import { AiOutlineSearch } from "react-icons/ai";
import { InitialRequisitionApi } from "@/store/service/requisitions/initial";

const PurchaseRequisition = () => {
    const router = useRouter();
    const [searchParams, setSearchParams] = useState({});
    const {data, isLoading, isError} = useGetPurchaseRequisitionQuery(searchParams);
    const [destroy, destroyResponse] = useDestroyPurchaseRequisitionMutation();
    const [columns, setColumns] = useState([]);


    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess){
            toast.success('Requisition deleted.')
            dispatch(InitialRequisitionApi.util.invalidateTags(['initial-requisition']));
        }
    }, [destroyResponse])
    useEffect(() => {
        if (!isLoading && !isError && data){
            setColumns([
                {
                    name: 'I.R.F. No.',
                    selector: row => row.irf_no,
                    sortable: true,
                },
                {
                    name: 'P.R.F. NO.',
                    selector: row =>  row.prf_no,
                    sortable: true,
                },
                {
                    name: 'Category',
                    selector: row => row.purchase_requisition_products[0]?.product?.category?.title,
                    sortable: true,
                    maxWidth: "200px",
                },
                {
                    name: 'No. of Item',
                    selector: row => row.purchase_requisition_products.length,
                    sortable: true,
                },
                {
                    name: 'Department',
                    selector: row => row.department?.name,
                    sortable: true,
                },
                {
                    name: 'Estimated Cost',
                    selector: row => parseFloat(row.estimated_total_amount).toLocaleString(),
                    sortable: true,
                },
                {
                    name: 'Generated By',
                    selector: row => row.user?.name,
                    sortable: true,
                },
                {
                    name: 'Created at',
                    selector: row => moment(row.created_at).format("YYYY-MM-DD hh:mm:ss"),
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.id}
                        view={`/purchase-requisition/${row.id}/view`}
                        print={`/purchase-requisition/${row.id}/print_view`}
                        edit={moment(row.created_at).diff(moment(), 'days') <= 7 && !row.approval_status?.department_approved_by ? `/purchase-requisition/${row.id}/edit` : false}
                        destroy={destroy}
                        item={row}
                        progressing={destroyResponse.isLoading}
                        permissionModule={`purchase-requisitions`}
                    />,
                    ignoreRowClick: true,
                }
            ]);
        }
    }, [isLoading, isError, data]);


    return (
        <>
            <Head>
                <title>Purchase Requisition</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Purchase Requisition.
                    </h2>
                }
            >
                <Head>
                    <title>Purchase Requisition.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4 shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'purchase-requisition/create'}
                                href={`purchase-requisition/create`}
                            >
                                <Button>Create</Button>
                            </NavLink>
                            <div>
                                <Datepicker
                                    onSelectedDateChanged={(date) => setSearchParams({
                                        search: searchParams.search,
                                        date: moment(date).format('Y-MM-DD')
                                    })}
                                />
                            </div>
                            <div>
                                <TextInput
                                    icon={AiOutlineSearch}
                                    onBlur={(e) => {
                                        setSearchParams({
                                            search: e.target.value,
                                            date: searchParams.date
                                        })
                                    }}
                                />
                            </div>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.purchase}
                            pagination
                            responsive
                            progressPending={isLoading}
                            persistTableHead
                            paginationServer
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
                        />
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getPurchaseRequisition.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default PurchaseRequisition;
