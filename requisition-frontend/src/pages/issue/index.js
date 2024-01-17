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
    useGetIssueQuery,
    useEditIssueQuery,
    useDestroyIssueMutation,
    getRunningQueriesThunk, getIssue
} from "@/store/service/issue";
import moment from "moment";
import IssueStatus from "@/components/issue/Status";
import { useAuth } from "@/hooks/auth";

const ProductIssue = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [searchParams, setSearchParams] = useState({});
    const {data, isLoading, isError} = useGetIssueQuery(searchParams);
    const [destroy, destroyResponse] = useDestroyIssueMutation();
    const [columns, setColumns] = useState([]);
    const [isStoreManager, setISStoreManager] = useState(user?.role_object?.filter(r => r.name === "Store Manager").length);
    const [dataTableData, setDataTableData] = useState([]);

    useEffect(() => {
        if (user){
            setISStoreManager(user?.role_object?.filter(r => r.name === "Store Manager").length);
        }
    }, [user]);


    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess){
            toast.success('Product Issue removed.')
        }
    }, [destroyResponse])

    useEffect(() => {
        if (!isLoading && !isError && data ) {
            const issueData = data?.product_issue;
            // const tableData = Object.keys(issueData).map((pi) => {
            //     return {
            //         uuid : pi,
            //         number_of_item : issueData[pi].length,
            //         receiver : issueData[pi].reduce((prev, curr) => {
            //             if (!prev.includes(curr.receiver?.name)){
            //                 return prev ? prev + "," + curr.receiver?.name : curr.receiver?.name
            //             }
            //             return curr.receiver.name
            //         }, ""),
            //         issuer : issueData[pi].reduce((prev, curr) => {
            //             if (!prev.includes(curr.issuer.name)){
            //                 return prev ? prev + "," + curr.issuer?.name : curr.issuer?.name
            //             }
            //             return curr.issuer?.name
            //         }, ""),
            //         issue_time: issueData[pi][0].issue_time,
            //         receiver_department_id: issueData[pi][0].receiver_department_id,
            //         department_status: issueData[pi][0].department_status,
            //         store_status: issueData[pi][0].store_status,
            //         receiver_department: issueData[pi][0].receiver_department,
            //     };
            // })

            setDataTableData(issueData);
            setColumns([
                {
                    name: 'SL.',
                    selector: (row, index) => index + 1,
                    sortable: true,
                },
                {
                    name: 'No. of Item',
                    selector: row => row.products?.length,
                    sortable: true,
                },
                {
                    name: 'Receiver',
                    selector: row => row.receiver?.name,
                    sortable: true,
                },
                {
                    name: 'Department',
                    selector: row => row.receiver_department?.name,
                    sortable: true,
                },
                {
                    name: 'Issuer',
                    selector: row => row.issuer?.name,
                    sortable: true,
                },
                // {
                //     name: 'Purpose',
                //     selector: row => row.purpose,
                //     sortable: false,
                // },
                // {
                //     name: 'Uses Area',
                //     selector: row => row.uses_area,
                //     sortable: false,
                // },
                // {
                //     name: 'Note',
                //     selector: row => row.note,
                //     sortable: false,
                // },
                {
                    name: 'Issue Time',
                    selector: row => moment(row.issue_time).format('D MMM Y @ H:mm '),
                    sortable: true,
                },
                {
                    name: 'Status',
                    selector: row => <IssueStatus key={row.uuid} row={row} />
                },
                {
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.uuid}
                        edit={isStoreManager && !row.store_status ? `/issue/${row.uuid}/edit` : false}
                        view={`/issue/${row.uuid}/view`}
                        print={`/issue/${row.uuid}/print_view`}
                        destroy={destroy}
                        progressing={destroyResponse.isLoading}
                        permissionModule={`product-issues`}
                    />,
                    ignoreRowClick: true,
                }
            ])
        }
    }, [isLoading, data, isStoreManager])

    const changeSearchParams = (key, value) => {
        setSearchParams({...searchParams , [key]: value, page: 1});
    }

    return (
        <>
            <Head>
                <title>Product Issue Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Issue Management.
                    </h2>
                }
            >
                <Head>
                    <title>Product Issue Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'issue/create'}
                                href={`issue/create`}
                            >
                                <Button>Create</Button>
                            </NavLink>
                        </div>

                        <DataTable
                            columns={columns}
                            data={dataTableData}
                            pagination
                            responsive
                            progressPending={isLoading}
                            persistTableHead={true}
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
    store.dispatch(getIssue.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default ProductIssue;
