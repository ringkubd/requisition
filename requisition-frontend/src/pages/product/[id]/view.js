import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEditProductQuery } from "@/store/service/product/product";
import Head from "next/head";
import { Button, Card, Table } from "flowbite-react";
import Image from "next/image";
import moment from "moment";

const View = (props) => {
    const router = useRouter();
    const {data, isLoading, isError} = useEditProductQuery(router.query.id, {
        skip: !router.query.id
    });

    const {product_metas, product_options} = data?.data ?? {};
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Product.
                </h2>
            }>
            <Head>
                <title>Product</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="min-h-screen">
                    <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                        <Button onClick={() => router.back()}>Back</Button>
                    </div>
                    <div className="flex flex-col space-y-2 md:gap-2 md:space-x-4 md:flex-row">
                        <div className={`w-full gap-2 space-x-4 shadow p-2 overflow-scroll`}>
                            <h2
                                className={`w-full border-b pb-2 font-bold`}>
                                Basic Information
                            </h2>
                            {
                                !isLoading && !isError && data ? (
                                        <Table className={`overflow-x-scroll`}>
                                            <Table.Body>
                                                <Table.Row>
                                                    <Table.HeadCell>Title</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.title}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Category</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.category?.title}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Unit</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.unit}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Description</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.description}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Status</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.status}</Table.Cell>
                                                </Table.Row>
                                            </Table.Body>
                                        </Table>
                                    )
                                    : <h2>Data loading or error.</h2>
                            }
                        </div>
                        <div className={`w-full gap-2 space-x-4 shadow p-2 overflow-scroll`}>
                            <h2
                                className={`w-full border-b pb-2 font-bold`}>
                                Variant Information
                            </h2>
                            {
                                !isLoading && !isError && product_options ? (
                                        <>
                                            <Table className={`table-auto overflow-x-scroll`}>
                                                <Table.Head>
                                                    <Table.HeadCell>Sl#</Table.HeadCell>
                                                    <Table.HeadCell>Option</Table.HeadCell>
                                                    <Table.HeadCell>Value</Table.HeadCell>
                                                    <Table.HeadCell>SKU</Table.HeadCell>
                                                    <Table.HeadCell>Stock</Table.HeadCell>
                                                    <Table.HeadCell>Notes</Table.HeadCell>
                                                </Table.Head>
                                                <Table.Body>
                                                    {
                                                        product_options.map((p, index) => (
                                                            <Table.Row key={index}>
                                                                <Table.Cell>{index + 1}</Table.Cell>
                                                                <Table.Cell>{p?.option?.name}</Table.Cell>
                                                                <Table.Cell>{p.option_value}</Table.Cell>
                                                                <Table.Cell>{p?.sku}</Table.Cell>
                                                                <Table.Cell>{p.stock}</Table.Cell>
                                                                <Table.Cell>{p?.notes}</Table.Cell>
                                                            </Table.Row>
                                                        ))
                                                    }
                                                </Table.Body>
                                            </Table>
                                        </>
                                    )
                                    : <h2>No data found.</h2>
                            }
                        </div>
                        {
                            !isLoading && !isError && product_metas?.length ? (
                                <div className={`w-full gap-2 space-x-4 shadow p-2 overflow-scroll`}>
                                    <h2
                                        className={`w-full border-b pb-2 font-bold`}>
                                        Meta Information
                                    </h2>

                                    <Table className={`overflow-x-scroll`}>
                                        <Table.Body>
                                            {
                                                product_metas.map((m, index) => (
                                                    <Table.Row key={index}>
                                                        <Table.HeadCell>{m.key.toUpperCase()}</Table.HeadCell>
                                                        <Table.Cell>{m.value}</Table.Cell>
                                                    </Table.Row>
                                                ))
                                            }
                                        </Table.Body>
                                    </Table>

                                </div>
                            ) : ''

                        }
                    </div>
                    <div>
                        <div className={`w-full gap-2 space-x-4 shadow p-2 overflow-scroll`}>
                            <h2
                                className={`w-full border-b pb-2 font-bold`}>
                                Purchase History
                            </h2>
                            {
                                !isLoading && !isError && product_options ? (
                                        <>
                                            <Table className={`border border-gray-300 overflow-x-scroll`} border={1}>
                                                <Table.Head>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Sl#</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Variant</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Origin</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Supplier</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Requisition</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Chalan</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Qty</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Unit Price
                                                    </Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Available Qty.</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Total</Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Stock Value</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Purchase
                                                        Date</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Expiry
                                                        Date</Table.HeadCell>
                                                </Table.Head>
                                                <Table.Body className={`border border-gray-300`}>
                                                    {
                                                        product_options.map((p, index) => (
                                                            <>
                                                                <Table.Row className={`border border-gray-300`} key={index * Math.round(Math.random() * 111)}>
                                                                    <Table.Cell className={`border border-gray-300`}
                                                                                rowSpan={p?.option_purchase_history?.length + 1}>{index + 1}</Table.Cell>
                                                                    <Table.Cell className={`border border-gray-300`}
                                                                                rowSpan={p?.option_purchase_history?.length + 1}>{p?.title}</Table.Cell>
                                                                </Table.Row>
                                                                {
                                                                    p?.option_purchase_history?.map((pur, i) => (
                                                                        <Table.Row className={`border border-gray-300`}
                                                                                   key={i * Math.round(Math.random() * 222)}>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{pur?.origin}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`flex align-middle justify-center items-center`}>
                                                                                {pur?.supplier && pur?.supplier?.logo ?
                                                                                    <Image src={pur?.supplier?.logo}
                                                                                           alt={pur?.supplier?.name}
                                                                                           width={50}
                                                                                           height={50} /> : pur?.supplier?.name}
                                                                            </Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{pur?.purchaseRequisition?.irf_no}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{pur?.chalan_no}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{parseFloat(pur?.qty).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{parseFloat(pur?.unit_price).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{parseFloat(pur?.available_qty).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{parseFloat(pur?.total_price).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{(parseFloat(pur?.unit_price) * parseFloat(pur?.available_qty)).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{moment(pur?.purchase_date).format("DD MMM YYYY")}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{pur.expiry_date ? moment(pur.expiry_date).format("DD MMM YYYY") : ''}</Table.Cell>
                                                                        </Table.Row>
                                                                    ))
                                                                }
                                                            </>
                                                        ))
                                                    }
                                                </Table.Body>
                                            </Table>
                                        </>
                                    )
                                    : <h2>No data found.</h2>
                            }
                        </div>
                    </div>

                    <div>
                        <div className={`w-full gap-2 space-x-4 shadow p-2 overflow-scroll`}>
                            <h2
                                className={`w-full border-b pb-2 font-bold`}>
                                Issue History
                            </h2>
                            {
                                !isLoading && !isError && product_options ? (
                                        <>
                                            <Table className={`border border-gray-300 overflow-x-scroll`} border={1}>
                                                <Table.Head>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Sl#</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>
                                                        Variant
                                                    </Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>
                                                        Department
                                                    </Table.HeadCell>
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Qty</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Avg. Unit
                                                        Price</Table.HeadCell>
                                                    {/*<Table.HeadCell className={`border border-gray-300`}>Available*/}
                                                    {/*    Qty.</Table.HeadCell>*/}
                                                    <Table.HeadCell
                                                        className={`border border-gray-300`}>Total</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Issue
                                                        Date</Table.HeadCell>
                                                    {/*<Table.HeadCell className={`border border-gray-300`}>Expiry*/}
                                                    {/*    Date</Table.HeadCell>*/}
                                                </Table.Head>
                                                <Table.Body className={`border border-gray-300`}>
                                                    {
                                                        product_options.map((p, index) => (
                                                            <>
                                                                <Table.Row className={`border border-gray-300`} key={index * Math.round(Math.random() * 444)}>
                                                                    <Table.Cell className={`border border-gray-300`}
                                                                                rowSpan={p?.product_issue?.length + 1}>{index + 1}</Table.Cell>
                                                                    <Table.Cell className={`border border-gray-300`}
                                                                                rowSpan={p?.product_issue?.length + 1}>{p?.title}</Table.Cell>
                                                                </Table.Row>
                                                                {
                                                                    p?.product_issue?.map((pur, i) => (
                                                                        <Table.Row className={`border border-gray-300`}
                                                                                   key={i * Math.round(Math.random() * 555)}>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{pur?.receiver_department?.name}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{parseFloat(pur?.quantity).toLocaleString()} {data?.data?.unit}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{parseFloat(pur?.average_rate).toLocaleString()}</Table.Cell>
                                                                            {/*<Table.Cell*/}
                                                                            {/*    className={`border border-gray-300`}>{parseFloat(pur?.available_qty).toLocaleString()}</Table.Cell>*/}
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{parseFloat(pur?.total_price).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell
                                                                                className={`border border-gray-300`}>{pur?.issue_time ? moment(pur?.issue_time).format("DD MMM YYYY") : null}</Table.Cell>
                                                                            {/*<Table.Cell*/}
                                                                            {/*    className={`border border-gray-300`}>{pur.expiry_date ? moment(pur.expiry_date).format("DD MMM YYYY") : ''}</Table.Cell>*/}
                                                                        </Table.Row>
                                                                    ))
                                                                }
                                                            </>
                                                        ))
                                                    }
                                                    {
                                                        product_options.reduce(function(o, n) {
                                                            return 0 + n.issue_qty;
                                                        },0) > 0 ? (
                                                            <Table.Row>
                                                                <Table.Cell className={`border border-gray-300 text-right text-black font-bold`} colSpan={3}>Total</Table.Cell>
                                                                <Table.Cell className={`border border-gray-300 text-black`}>{
                                                                    product_options.reduce(function(o, n) {
                                                                        return 0 + n.issue_qty;
                                                                    },0)
                                                                } {data?.data?.unit}</Table.Cell>
                                                                <Table.Cell className={`border border-gray-300 text-black`}>{
                                                                    product_options.reduce(function(o, n) {
                                                                        return n.product_issue.reduce((old, nw) => {
                                                                            return old + nw.average_rate;
                                                                        }, o) / n.product_issue?.length
                                                                    },0)
                                                                }</Table.Cell>
                                                                <Table.Cell className={`border border-gray-300 text-black`}>{
                                                                    product_options.reduce(function(o, n) {
                                                                        return n.product_issue.reduce((old, nw) => {
                                                                            return old + nw.total_price;
                                                                        }, o)
                                                                    },0)
                                                                }</Table.Cell>
                                                            </Table.Row>
                                                        ) : null
                                                    }

                                                </Table.Body>
                                            </Table>
                                        </>
                                    )
                                    : <h2>No data found.</h2>
                            }
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
export default View;
