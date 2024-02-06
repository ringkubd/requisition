import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useGetUsersQuery } from "@/store/service/user/management";
import { useEditIssueQuery } from "@/store/service/issue";
import DataTable from "react-data-table-component";
import { useAuth } from "@/hooks/auth";
import Quantity from "@/components/issue/Quantity";
const Edit = (props) => {
    const router = useRouter();
    const { user } = useAuth()
    const {data: users , isLoading: userIsLoading} = useGetUsersQuery({
        branch_id: user?.selected_branch,
        department_id: user?.selected_department
    });
    const { data: issue, isLoading: issueISLoading, isError: issueISError, isSuccess: issueISSuccess } = useEditIssueQuery(router.query.id, {
        skip: !router.query.id
    })
    const [items, setItems] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        setItems(issue?.data ?? [])
    }, [issue, issueISSuccess]);

    useEffect(() => {
        if (issueISSuccess){
            setColumns([
                {
                    name: 'Product',
                    selector: row => row.product_title ? row.product_title + " - " + row.product_option_name : row?.product?.title + " - " + row?.variant?.option_value,
                    sortable: true,
                },
                {
                    name: 'Qty',
                    selector: row => <Quantity row={row} />,
                    sortable: true,
                },
                {
                    name: 'Purpose',
                    selector: row => row.purpose,
                    sortable: true,
                },
                {
                    name: 'Uses Area',
                    selector: row => row.uses_area,
                    sortable: true,
                },
                {
                    name: 'Note',
                    selector: row => row.note,
                    sortable: true,
                },
            ]);
        }
    }, [issueISSuccess, issue]);


    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Issue a product.
                    </h2>
                }
            >
                <Head>
                    <title> Issue a product.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'issue'}
                                href={`/issue`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div
                            className={`flex flex-col basis-2/4 w-full`}>
                            <div
                                className={`flex flex-col my-4 p-4  sm:max-w-2xl`}>
                                <div className={`flex flex-row space-x-8 mt-4`}>
                                    <h2 className={`font-bold`}>Receiver</h2>
                                    <h4>{issue?.data?.receiver?.name}</h4>
                                </div>
                                <div className={`flex flex-row space-x-8 mt-4`}>
                                    <h2 className={`font-bold`}>
                                        Receiver Department
                                    </h2>
                                    <h4>
                                        {issue?.data?.receiver_department?.name}
                                    </h4>
                                </div>
                                <div className={`flex flex-row space-x-8 mt-4`}>
                                    <h2 className={`font-bold`}>Issuer</h2>
                                    <h4>{issue?.data?.issuer?.name}</h4>
                                </div>
                                <div className={`flex flex-row space-x-8 mt-4`}>
                                    <h2 className={`font-bold`}>
                                        Issuer Department
                                    </h2>
                                    <h4>
                                        {issue?.data?.issuer_department?.name}
                                    </h4>
                                </div>
                            </div>
                            <DataTable
                                columns={columns}
                                progressPending={issueISLoading}
                                data={items?.products}
                            />
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default Edit;
