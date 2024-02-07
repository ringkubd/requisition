import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import { Button, Card, Table } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { useEditIssueQuery } from "@/store/service/issue";
import React, { useEffect, useState } from "react";
import moment from "moment";
import DataTable from "react-data-table-component";
import Status from "@/components/issue/Status";

const IssueView = () => {
    const router = useRouter();
    const {data: issue, isLoading: issueISLoading, isSuccess: issueISSuccess, isError: issueISError} = useEditIssueQuery(router.query?.id, {
        skip: !router.query?.id
    })
    const [columns, setColumns] = useState([]);
    useEffect(() => {
        if (!issueISLoading && !issueISError && issue) {
            setColumns([
                {
                    name: 'Product',
                    selector: row => row.product?.title + ( !row.variant?.option_value.includes('N/A') ? " - "+row.variant?.option_value : ""),
                    sortable: true,
                },
                {
                    name: 'Qty',
                    selector: row => row.quantity,
                    sortable: true,
                },
                {
                    name: 'Unit',
                    selector: row => row.product?.unit,
                    sortable: true,
                },
                {
                    name: 'Purpose',
                    selector: row => row.purpose,
                    sortable: false,
                },
                {
                    name: 'Uses Area',
                    selector: row => row.uses_area,
                    sortable: false,
                },
                {
                    name: 'Note',
                    selector: row => row.note,
                    sortable: false,
                },
                {
                    name: 'Before',
                    selector: row => row.balance_before_issue,
                    sortable: true,
                },
                {
                    name: 'After',
                    selector: row => row.balance_after_issue,
                    sortable: true,
                },
            ])
        }
    }, [issueISLoading, issue])

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Product Issue Details.
                </h2>
            }>
            <Head>
                <title>Product Issue Details</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                <Card>
                    <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                        <NavLink
                            active={router.pathname === 'issue'}
                            href={`/issue`}>
                            <Button>Back</Button>
                        </NavLink>
                        <div className={`pt-1`}>
                            {issue?.data ? <Status row={issue?.data} /> : null}
                        </div>
                    </div>
                    <div
                        className={`overflow-auto hidden sm:flex w-full flex-col`}>
                        <div className={`flex flex-col my-4 p-4  sm:max-w-2xl`}>
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
                                <h4>{issue?.data?.issuer_department?.name}</h4>
                            </div>
                            <div className={`flex flex-row space-x-8 mt-4`}>
                                <h2 className={`font-bold`}>Issue Time</h2>
                                <h4>
                                    {issue?.data?.issue_time
                                        ? moment(
                                              issue?.data?.issue_time,
                                          ).format('DD MMM Y @ H:mm A')
                                        : null}
                                </h4>
                            </div>
                        </div>
                        <div>
                            <DataTable
                                columns={columns}
                                data={issue?.data.products}
                                expandableRowDisabled={false}
                                title={`Issued product list`}
                            />
                        </div>
                    </div>
                    <div className={`overflow-auto my-8`}>
                        <h2 className={`border-b-2 mb-2`}>Product Rate Log</h2>
                        <Table className={`border-b-2`}>
                            <Table.Head className={`border-b-2`}>
                                <Table.HeadCell>Product</Table.HeadCell>
                                <Table.HeadCell>Purchase Date</Table.HeadCell>
                                <Table.HeadCell>Quantity</Table.HeadCell>
                                <Table.HeadCell>Unit Price</Table.HeadCell>
                                <Table.HeadCell>Total Price</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {issue?.data &&
                                    issue?.data?.products?.map(p =>
                                        p?.rateLog.map((r, i) => (
                                            <Table.Row
                                                className={`border-2`}
                                                key={r.id}>
                                                <Table.HeadCell
                                                    className={`border-2`}>
                                                    {p?.product?.title}
                                                </Table.HeadCell>
                                                <Table.Cell
                                                    className={`border-2`}>
                                                    {moment(
                                                        r.purchase_date,
                                                    ).format('DD MMM Y')}
                                                </Table.Cell>
                                                <Table.Cell
                                                    className={`border-2`}>
                                                    {r.qty}
                                                </Table.Cell>
                                                <Table.Cell
                                                    className={`border-2`}>
                                                    {r.unit_price}
                                                </Table.Cell>
                                                <Table.Cell
                                                    className={`border-2`}>
                                                    {parseFloat(
                                                        r.total_price,
                                                    ).toLocaleString('bd')}
                                                </Table.Cell>
                                            </Table.Row>
                                        )),
                                    )}
                            </Table.Body>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

export default IssueView;
