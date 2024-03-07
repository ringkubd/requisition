import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import Actions from "@/components/actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getVehicle,
    getRunningQueriesThunk,
    useGetVehicleQuery,
    useDeleteVehicleMutation
} from "@/store/service/vehicle/VehicleAPI";

const Vehicle = () => {
    const router = useRouter();
    const {data, isLoading, isError} = useGetVehicleQuery();
    const [destroy, destroyResponse] = useDeleteVehicleMutation();
    const [columns, setColumns] = useState([]);


    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess){
            toast.success('Vehicle deleted.')
        }
    }, [destroyResponse])
    useEffect(() => {
        if (!isLoading && !isError && data){
            setColumns([
                {
                    name: 'Brand',
                    selector: row => row.brand,
                    sortable: true,
                },
                {
                    name: 'Model',
                    selector: row => row.model,
                    sortable: true,
                },
                {
                    name: 'Reg. No.',
                    selector: row => row.reg_no,
                    sortable: true,
                },
                {
                    name: 'Related Item',
                    selector: row => row.cashProduct?.title,
                    sortable: true,
                },
                {
                    name: 'Ownership',
                    selector: row => !row.ownership ? 'Owned' : 'Rental',
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.id}
                        edit={`/vehicle/${row.id}/edit`}
                        // view={`/category/${row.id}/view`}
                        destroy={destroy}
                        progressing={destroyResponse.isLoading}
                        permissionModule={`vehicles`}
                    />,
                    ignoreRowClick: true,
                }
            ]);
        }
    }, [isLoading, isError, data]);


    return (
        <>
            <Head>
                <title>Vehicle Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Vehicle Management.
                    </h2>
                }
            >
                <Head>
                    <title>Vehicle Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'vehicle/create'}
                                href={`/vehicle/create`}
                            >
                                <Button>Create</Button>
                            </NavLink>
                            <Button color={`dark`} onClick={() => router.push('/vehicle/report')}>Back</Button>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.data}
                            pagination
                            responsive
                            progressPending={isLoading}
                            persistTableHead
                            fixedHeader
                            dense
                        />
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getVehicle.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Vehicle;
