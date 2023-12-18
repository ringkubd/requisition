import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card, Label, TextInput } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import Actions from "@/components/actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getProduct,
    getRunningQueriesThunk,
    useDestroyProductMutation,
    useGetProductQuery
} from "@/store/service/product/product";
import moment from "moment";
import Select from "react-select";
import { useGetCategoryQuery } from "@/store/service/category";


const Product = () => {
    const router = useRouter();
    const [searchParams, setSearchParams] = useState({});
    const {data, isLoading, isError} = useGetProductQuery(searchParams);
    const [destroy, destroyResponse] = useDestroyProductMutation();
    const [columns, setColumns] = useState([]);
    const {data: category, isLoading: categoryISLoading} = useGetCategoryQuery();

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess){
            toast.success('Options deleted.')
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
                    name: 'Unit',
                    selector: row => row.unit,
                    sortable: true,
                },
                {
                    name: 'Stock',
                    selector: row => row.total_stock,
                    sortable: true,
                },
                {
                    name: 'Category',
                    selector: row => row.category?.title,
                    sortable: true,
                },
                {
                    name: 'Last Purchase',
                    selector: row => row.last_purchase?.created_at ? moment(row.last_purchase?.created_at).format('DD MMM Y') : null,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.id}
                        edit={`/product/${row.id}/edit`}
                        view={`/product/${row.id}/view`}
                        destroy={destroy}
                        progressing={destroyResponse.isLoading}
                        permissionModule={`products`}
                    />,
                    ignoreRowClick: true,
                }
            ]);
        }
    }, [isLoading, isError, data]);

    const changeSearchParams = (key, value) => {
        setSearchParams({...searchParams , [key]: value, page: 1});
    }


    return (
        <>
            <Head>
                <title>Product Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Management.
                    </h2>
                }
            >
                <Head>
                    <title>Product Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'product/create'}
                                href={`product/create`}
                            >
                                <Button>Create</Button>
                            </NavLink>
                            <div className={`flex flex-row justify-center space-x-4 items-center`}>
                                <Label htmlFor={`category`} value={`Category`} />
                                <Select
                                    id={`category`}
                                    className={`select !min-w-[70px]`}
                                    classNames={{
                                        control: state => 'select'
                                    }}
                                    options={category?.data?.filter((c) => !c.parent_id).map((c) => {
                                        const sub = c.subCategory?.map((s) => ({label: '=> ' + s.title, value: s.id}))
                                        return {
                                            label: c.title,
                                            options: [
                                                {label: c.title, value: c.id},
                                                ...sub
                                            ]
                                        };
                                    })}
                                    isLoading={categoryISLoading}
                                    isSearchable
                                    placeholder={`Search by category`}
                                    isClearable
                                    onChange={(newValue) => changeSearchParams('category_id', newValue?.value)}
                                />
                            </div>
                            <div className={`flex flex-row justify-center space-x-4 items-center`}>
                                <Label htmlFor={`search`} value={`Search`} />
                                <TextInput onChange={(e) => e.target.value.length > 1 ? changeSearchParams('search',e.target.value) : ''} />
                            </div>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.data}
                            pagination
                            paginationServer
                            responsive
                            progressPending={isLoading}
                            persistTableHead
                            onChangePage={(page, totalRows) => setSearchParams({...searchParams, 'page': page})}
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
    store.dispatch(getProduct.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Product;
