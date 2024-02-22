import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEditProductQuery } from "@/store/service/product/product";
import Head from "next/head";
import { Button, Card, Table } from "flowbite-react";
import Image from "next/image";
import moment from "moment";
import IssueLog from "@/components/product/IssueLog";
import PurchaseLog from "@/components/product/PurchaseLog";

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
                    <div className="flex flex-col space-2 md:gap-2 md:space-x-4 md:flex-row">
                        <div
                            className={`w-full p-2 overflow-scroll shadow-lg rounded`}>
                            <h2 className={`w-full border-b pb-2 font-bold`}>
                                Basic Information
                            </h2>
                            {!isLoading && !isError && data ? (
                                <Table className={`overflow-x-scroll`}>
                                    <Table.Body>
                                        <Table.Row className={`border`}>
                                            <Table.HeadCell className={`border !p-1`}>
                                                Title
                                            </Table.HeadCell>
                                            <Table.Cell className={`border !p-1`}>
                                                {data?.data?.title}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell className={`border !p-1`}>
                                                Category
                                            </Table.HeadCell>
                                            <Table.Cell className={`border !p-1`}>
                                                {data?.data?.category?.title}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell className={`border !p-1`}>
                                                Unit
                                            </Table.HeadCell>
                                            <Table.Cell className={`border !p-1`}>
                                                {data?.data?.unit}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell className={`border !p-1`}>
                                                Description
                                            </Table.HeadCell>
                                            <Table.Cell className={`border !p-1`}>
                                                {data?.data?.description}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell className={`border !p-1`}>
                                                Status
                                            </Table.HeadCell>
                                            <Table.Cell className={`border !p-1`}>
                                                {data?.data?.status}
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            ) : (
                                <h2>Data loading or error.</h2>
                            )}
                        </div>
                        <div
                            className={`w-full p-2 overflow-scroll shadow-lg rounded`}>
                            <h2 className={`w-full border-b pb-2 font-bold`}>
                                Variant Information
                            </h2>
                            {!isLoading && !isError && product_options ? (
                                <>
                                    <Table
                                        className={`table-auto overflow-x-scroll`}>
                                        <Table.Head>
                                            <Table.HeadCell>Sl#</Table.HeadCell>
                                            <Table.HeadCell>
                                                Option
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Value
                                            </Table.HeadCell>
                                            <Table.HeadCell>SKU</Table.HeadCell>
                                            <Table.HeadCell>
                                                Stock
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Notes
                                            </Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body>
                                            {product_options.map((p, index) => (
                                                <Table.Row key={index}>
                                                    <Table.Cell className={`border !p-0 text-center`}>
                                                        {index + 1}
                                                    </Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>
                                                        {p?.option?.name}
                                                    </Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>
                                                        {p.option_value}
                                                    </Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>
                                                        {p?.sku}
                                                    </Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>
                                                        {p.stock}
                                                    </Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>
                                                        {p?.notes}
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </>
                            ) : (
                                <h2>No data found.</h2>
                            )}
                        </div>
                        {!isLoading && !isError && product_metas?.length ? (
                            <div
                                className={`w-full shadow-lg rounded p-2 overflow-scroll`}>
                                <h2
                                    className={`w-full border-b pb-2 font-bold`}>
                                    Meta Information
                                </h2>

                                <Table className={`overflow-x-scroll`}>
                                    <Table.Body>
                                        {product_metas.map((m, index) => (
                                            <Table.Row key={index}>
                                                <Table.HeadCell>
                                                    {m.key.toUpperCase()}
                                                </Table.HeadCell>
                                                <Table.Cell>
                                                    {m.value}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                    <div className={` shadow-lg rounded p-2`}>
                        {/*   Product Purchase Log  */}
                        <h2 className={`w-full border-b pb-2 font-bold`}>
                            Purchase History
                        </h2>
                        <div className={`flex flex-row space-x-8 border-b`}>
                            <h2>
                                Total Purchase Till Now -{' '}
                            </h2>
                            <div>
                                {
                                    product_options?.reduce((o, n) => {
                                        return n?.option_purchase_history?.reduce((a,b) => {
                                            return a + b?.qty;
                                        },o)
                                    },0)?.toFixed(2)
                                }{data?.data?.unit}
                            </div>
                        </div>
                        {router.query.id && (
                            <PurchaseLog id={router.query.id} />
                        )}
                    </div>

                    <div className={` shadow-lg rounded p-2`}>
                        <h2 className={`w-full border-b pb-2 font-bold`}>
                            Issue History
                        </h2>
                        <div className={`flex flex-row space-x-8 border-b`}>
                            <h2>
                                Total Issue Till Now -{' '}
                            </h2>
                            <div>
                                {product_options
                                    ?.reduce(function (o, n) {
                                        return o + n.issue_qty
                                    }, 0)
                                    .toFixed(2)}{' '}
                                {data?.data?.unit}
                            </div>
                        </div>
                        {/*    Product Issue Log */}
                        {router.query.id && <IssueLog id={router.query.id} />}
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
export default View;
