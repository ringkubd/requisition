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
    getCategory,
    getRunningQueriesThunk,
    useDestroyCategoryMutation,
    useGetCategoryQuery
} from "@/store/service/category";

const Branch = () => {
    const router = useRouter();
    const {data, isLoading, isError} = useGetCategoryQuery();
    const [destroy, destroyResponse] = useDestroyCategoryMutation();
    const [columns, setColumns] = useState([]);


    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess){
            toast.success('Category deleted.')
        }
    }, [destroyResponse])
    useEffect(() => {
        if (!isLoading && !isError && data){
            setColumns([
                {
                    name: 'Title',
                    selector: row => row.title,
                    sortable: true,
                },
                {
                    name: 'Code',
                    selector: row => row.code,
                    sortable: true,
                },
                {
                    name: 'Parent',
                    selector: row => row.parent?.title,
                    sortable: true,
                },
                {
                    name: 'Description',
                    selector: row => row.description,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.id}
                        edit={`/category/${row.id}/edit`}
                        // view={`/category/${row.id}/view`}
                        destroy={destroy}
                        progressing={destroyResponse.isLoading}
                    />,
                    ignoreRowClick: true,
                }
            ]);
        }
        console.log(isLoading)
    }, [isLoading, isError, data]);


    return (
        <>
            <Head>
                <title>Category Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Category Management.
                    </h2>
                }
            >
                <Head>
                    <title>Category Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4 shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'category/create'}
                                href={`category/create`}
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
    store.dispatch(getCategory.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Branch;
