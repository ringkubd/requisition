import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEditProductQuery } from "@/store/service/product/product";
import Head from "next/head";
import { Button, Card, Table } from "flowbite-react";
import NavLink from "@/components/navLink";
import Actions from "@/components/actions";
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
                        <NavLink
                            active={router.pathname === 'product'}
                            href={`/product`}>
                            <Button>Back</Button>
                        </NavLink>
                    </div>
                    <div className="flex flex-col gap-2 space-x-4 sm:flex-row">
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
                                                    <Table.HeadCell className={`border border-gray-300`}>Sl#</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Variant</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Origin</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Supplier</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Requisition</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Chalan</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Qty</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Unit Price</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Available Qty.</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Total</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Purchase Date</Table.HeadCell>
                                                    <Table.HeadCell className={`border border-gray-300`}>Expiry Date</Table.HeadCell>
                                                </Table.Head>
                                                <Table.Body className={`border border-gray-300`}>
                                                    {
                                                        product_options.map((p, index) => (
                                                            <>
                                                                <Table.Row className={`border border-gray-300`} key={index}>
                                                                    <Table.Cell className={`border border-gray-300`} rowSpan={p?.option_purchase_history?.length + 1}>{index + 1}</Table.Cell>
                                                                    <Table.Cell className={`border border-gray-300`} rowSpan={p?.option_purchase_history?.length + 1}>{p?.title}</Table.Cell>
                                                                </Table.Row>
                                                                {
                                                                    p?.option_purchase_history?.map((pur,i) => (
                                                                        <Table.Row className={`border border-gray-300`} key={i}>
                                                                            <Table.Cell className={`border border-gray-300`}>{pur?.origin}</Table.Cell>
                                                                            <Table.Cell className={`flex align-middle justify-center items-center`}>
                                                                                {pur?.supplier && pur?.supplier?.logo ? <Image src={pur?.supplier?.logo} alt={pur?.supplier?.name} width={50} height={50} /> : pur?.supplier?.name }
                                                                            </Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{pur?.purchaseRequisition?.irf_no}</Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{pur?.chalan_no}</Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{parseFloat(pur?.qty).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{parseFloat(pur?.unit_price).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{parseFloat(pur?.available_qty).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{parseFloat(pur?.total_price).toLocaleString()}</Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{moment(pur?.created_at).format("HH:m - DD MMM YYYY")}</Table.Cell>
                                                                            <Table.Cell className={`border border-gray-300`}>{pur.expiry_date ? moment(pur.expiry_date).format("DD MMM YYYY") : ''}</Table.Cell>
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
                </Card>
            </div>
        </AppLayout>
    )
}
export default View;
