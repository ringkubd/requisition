import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import { Button, Card } from "flowbite-react";
import NavLink from "@/components/navLink";
import DataTable from "react-data-table-component";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Actions from "@/components/actions";
import { getPermissions, useDestroyPermissionsMutation, useGetPermissionsQuery, getRunningQueriesThunk } from "@/store/service/permissions";
import { wrapper } from "@/store";

export default function Permissions(){
    const router = useRouter();
    const {data, isLoading, isError, isSuccess} = useGetPermissionsQuery();
    const [destroy, destroyResponse] = useDestroyPermissionsMutation();
    const [columns, setColumns] = useState([]);
    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess){
            toast.success('Permission deleted.')
        }
    }, [destroyResponse])

    useEffect(() => {
        console.log(data)
    }, [isLoading, isError, isSuccess])

    useEffect(() => {
        if (!isLoading && !isError && data){
            setColumns([
                {
                    name: 'Name',
                    selector: row => row.name,
                    sortable: true,
                },
                {
                    name: 'Module',
                    selector: row => row.module?.replaceAll('-', ' ')?.toLocaleUpperCase(),
                    sortable: true,
                },
                {
                    name: 'Guard',
                    selector: row => row.guard_name,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.id}
                        destroy={destroy}
                        progressing={destroyResponse.isLoading}
                    />,
                    ignoreRowClick: true,
                }
            ]);
        }
    }, [isLoading, isError, data]);
    return (
        <AppLayout header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                Permissions Management.
            </h2>
        }>
            <Head>
                <title>Permissions Management.</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                <Card>
                    <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                        <NavLink
                            active={router.pathname === 'permissions/create'}
                            href={`permissions/create`}
                        >
                            <Button>Create</Button>
                        </NavLink>
                    </div>
                    {
                        !isLoading && !isError && data && (
                            <DataTable
                                columns={columns}
                                data={data.data}
                                pagination
                                responsive
                                progressPending={isLoading}
                                persistTableHead
                            />
                        )
                    }
                </Card>
            </div>
        </AppLayout>
    )
}
export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getPermissions.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})
