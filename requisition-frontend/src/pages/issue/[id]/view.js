import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import { Button, Card, Table } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { useEditIssueQuery } from "@/store/service/issue";
import { useEffect } from "react";
import moment from "moment";

const IssueView = () => {
    const router = useRouter();
    const {data: issue, isLoading: issueISLoading, isSuccess: issueISSuccess} = useEditIssueQuery(router.query?.id, {
        skip: !router.query?.id
    })

    useEffect(() => {
        if (issueISSuccess){
            console.log(issue)
        }
    }, [issue, issueISSuccess])

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Product Issue Details.
                </h2>
            }
        >
            <Head>
                <title>Product Issue Details</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                <Card>
                    <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                        <NavLink
                            active={router.pathname === "issue"}
                            href={`/issue`}
                        >
                            <Button>Back</Button>
                        </NavLink>
                    </div>
                    <div className={`overflow-auto hidden sm:flex w-full flex-col`}>
                        <Table>
                            <Table.Head>
                                <Table.HeadCell>Item</Table.HeadCell>
                                <Table.HeadCell>Variant</Table.HeadCell>
                                <Table.HeadCell>Receiver</Table.HeadCell>
                                <Table.HeadCell>Department</Table.HeadCell>
                                <Table.HeadCell>Quantity</Table.HeadCell>
                                <Table.HeadCell>Total Price</Table.HeadCell>
                                <Table.HeadCell>Avg. Rate</Table.HeadCell>
                                <Table.HeadCell>Issue Time</Table.HeadCell>
                                <Table.HeadCell>Usage Area</Table.HeadCell>
                                <Table.HeadCell>Purpose</Table.HeadCell>
                                <Table.HeadCell>Note</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>{issue?.data?.product?.title}</Table.Cell>
                                    <Table.Cell>{issue?.data?.variant?.option_name}</Table.Cell>
                                    <Table.Cell>{issue?.data?.receiver?.name}</Table.Cell>
                                    <Table.Cell>{issue?.data?.receiver_department?.name}</Table.Cell>
                                    <Table.Cell>{issue?.data?.quantity}</Table.Cell>
                                    <Table.Cell>{issue?.data?.total_price}</Table.Cell>
                                    <Table.Cell>{issue?.data?.average_rate}</Table.Cell>
                                    <Table.Cell>{issue?.data?.issue_time ? moment(issue?.data?.issue_time).format("hh:mm DD-MMM-Y") : null}</Table.Cell>
                                    <Table.Cell>{issue?.data?.uses_area}</Table.Cell>
                                    <Table.Cell>{issue?.data?.purpose}</Table.Cell>
                                    <Table.Cell>{issue?.data?.note}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                    <div className={`overflow-auto sm:hidden flex w-full flex-col`}>
                        <Table>
                            <Table.Body>
                                <Table.Row>
                                    <Table.HeadCell>Item</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.product?.title}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Variant</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.variant?.option_name}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Receiver</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.receiver?.name}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Department</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.receiver_department?.name}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Quantity</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.quantity}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Issue Time</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.issue_time ? moment(issue?.data?.issue_time).format("hh:mm DD-MMM-Y") : null}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Usage Area</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.uses_area}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Purpose</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.purpose}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeadCell>Note</Table.HeadCell>
                                    <Table.Cell>{issue?.data?.note}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                    <div className={`overflow-auto my-8`}>
                        <h2 className={`border-b-2 mb-2`}>Product Rate Log</h2>
                        <Table className={`border-b-2`}>
                            <Table.Head className={`border-b-2`}>
                                <Table.HeadCell>Purchase Date</Table.HeadCell>
                                <Table.HeadCell>Quantity</Table.HeadCell>
                                <Table.HeadCell>Unit Price</Table.HeadCell>
                                <Table.HeadCell>Total Price</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {
                                    issue?.data?.rateLog && (
                                        issue?.data?.rateLog?.map((r) => (
                                            <Table.Row className={`border-2`} key={r.id}>
                                                <Table.Cell className={`border-2`}>{moment(r.purchase_date).format("DD MMM Y")}</Table.Cell>
                                                <Table.Cell className={`border-2`}>{r.qty}</Table.Cell>
                                                <Table.Cell className={`border-2`}>{r.unit_price}</Table.Cell>
                                                <Table.Cell className={`border-2`}>{parseFloat(r.total_price).toLocaleString('bd')}</Table.Cell>
                                            </Table.Row>
                                        ))
                                    )
                                }
                            </Table.Body>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
)
}

export default IssueView;
