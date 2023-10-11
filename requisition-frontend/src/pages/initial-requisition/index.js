import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/NavLink";
import { useRouter } from "next/router";
import Actions from "@/components/Actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getInitialRequisition, getRunningQueriesThunk,
    useDestroyInitialRequisitionMutation,
    useGetInitialRequisitionQuery
} from "@/store/service/requisitions/initial";

const InitialRequisition = () => {
    const router = useRouter();
    const {data, isLoading, isError} = useGetInitialRequisitionQuery();
    const [destroy, destroyResponse] = useDestroyInitialRequisitionMutation();
    const [columns, setColumns] = useState([]);


    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess){
            toast.success('Options deleted.')
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
                    selector: row => row.estimated_cost,
                    sortable: true,
                },
                {
                    name: 'Purchase Requisition',
                    selector: row => row.is_purchase_requisition_generated ? 'Generated' : 'No',
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
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.id}
                        edit={!row.is_purchase_requisition_generated ? `/initial-requisition/${row.id}/edit`: false}
                        view={`/initial-requisition/${row.id}/view`}
                        print={`/initial-requisition/${row.id}/print_view`}
                        destroy={!row.is_purchase_requisition_generated ? destroy : false}
                        progressing={destroyResponse.isLoading}
                    />,
                    ignoreRowClick: true,
                }
            ]);
        }
    }, [isLoading, isError, data]);


    return (
        <>
            <Head>
                <title>Initial Requisition</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Initial Requisition.
                    </h2>
                }
            >
                <Head>
                    <title>Initial Requisition.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4 shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'initial-requisition/create'}
                                href={`initial-requisition/create`}
                            >
                                <Button>Create</Button>
                            </NavLink>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.data}
                            pagination
                            responsive
                            progressPending={isLoading}
                            persistTableHead
                        />
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getInitialRequisition.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default InitialRequisition;
