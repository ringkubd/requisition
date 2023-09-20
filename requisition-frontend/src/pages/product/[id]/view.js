import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEditProductQuery } from "@/store/service/product/product";
import Head from "next/head";
import { Button, Card, Table } from "flowbite-react";
import NavLink from "@/components/NavLink";
import Actions from "@/components/Actions";

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
                        <NavLink
                            active={router.pathname === 'product'}
                            href={`/product`}>
                            <Button>Back</Button>
                        </NavLink>
                    </div>
                    <div className="flex flex-col gap-2 space-x-4 md:flex-row">
                        <div className={`w-full gap-2 space-x-4 shadow  p-2`}>
                            <h2
                                className={`w-full border-b pb-2 font-bold`}>
                                Basic Information
                            </h2>
                            {
                                !isLoading && !isError && data ? (
                                        <Table>
                                            <Table.Body>
                                                <Table.Row>
                                                    <Table.HeadCell>Title</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.title}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Sl. No.</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.sl_no}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Unit</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.title}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Category</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.category?.title}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Description</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.description}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Status</Table.HeadCell>
                                                    <Table.Cell>{data?.data?.status}</Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeadCell>Action</Table.HeadCell>
                                                    <Table.Cell>
                                                        <Actions />
                                                    </Table.Cell>
                                                </Table.Row>
                                            </Table.Body>
                                        </Table>
                                    )
                                    : <h2>Data loading or error.</h2>
                            }
                        </div>
                        <div className={`w-full gap-2 space-x-4 shadow p-2`}>
                            <h2
                                className={`w-full border-b pb-2 font-bold`}>
                                Variant Information
                            </h2>
                            {
                                !isLoading && !isError && product_options ? (
                                        <Table>
                                            <Table.Head>
                                                <Table.HeadCell>Sl#</Table.HeadCell>
                                                <Table.HeadCell>Option</Table.HeadCell>
                                                <Table.HeadCell>Value</Table.HeadCell>
                                                <Table.HeadCell>SKU</Table.HeadCell>
                                                <Table.HeadCell>Unit Price</Table.HeadCell>
                                                <Table.HeadCell>Stock</Table.HeadCell>
                                                <Table.HeadCell>Actions</Table.HeadCell>
                                            </Table.Head>
                                            <Table.Body>
                                                {
                                                    product_options.map((p, index) => (
                                                        <Table.Row key={index}>
                                                            <Table.Cell>{index + 1}</Table.Cell>
                                                            <Table.Cell>{p?.option?.name}</Table.Cell>
                                                            <Table.Cell>{p.option_value}</Table.Cell>
                                                            <Table.Cell>{p?.sku}</Table.Cell>
                                                            <Table.Cell>{p?.unit_price}</Table.Cell>
                                                            <Table.Cell>{p.stock}</Table.Cell>
                                                            <Table.Cell>
                                                                <Actions />
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))
                                                }
                                            </Table.Body>
                                        </Table>
                                    )
                                    : <h2>No data found.</h2>
                            }
                        </div>
                        <div className={`w-full gap-2 space-x-4 shadow p-2`}>
                            <h2
                                className={`w-full border-b pb-2 font-bold`}>
                                Meta Information
                            </h2>
                            {
                                !isLoading && !isError && product_metas ? (
                                        <Table>
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
