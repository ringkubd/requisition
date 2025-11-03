import Head from "next/head";
import React from "react";
import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEditPurchaseQuery } from "@/store/service/purchase";
import { Button, Card, Table } from "flowbite-react";
import Image from "next/image";

const View = () => {
    const router = useRouter();
    const id = router?.query?.id;
    const { data: item, isLoading, isSuccess, isError } = useEditPurchaseQuery(
        id,
        {
            skip: !id,
        }
    );

    const { data } = item ?? {};
    return (
        <>
            <Head>
                <title>Purchase Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Purchase Management.
                    </h2>
                }
            >
                <Head>
                    <title>Purchase Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 px-2 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 shadow-lg py-2 md:py-4 px-2 md:px-4">
                            <Button onClick={() => router.back()}>Back</Button>
                        </div>
                        {item && isSuccess ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <Table.Head>
                                        <Table.HeadCell>Label</Table.HeadCell>
                                        <Table.HeadCell>Value</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Title
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.product?.title}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Supplier
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data.supplier?.logo ? (
                                                    <Image
                                                        width={30}
                                                        height={30}
                                                        alt={
                                                            data.supplier?.name
                                                        }
                                                        src={
                                                            data.supplier?.logo
                                                        }
                                                    />
                                                ) : (
                                                    data.supplier?.name
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Brand
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.brand?.logo ? (
                                                    <Image
                                                        width={30}
                                                        height={30}
                                                        alt={data.brand?.name}
                                                        src={data.brand?.logo}
                                                    />
                                                ) : (
                                                    data.brand?.name
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Qty.
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.qty +
                                                    " (" +
                                                    data?.product?.unit +
                                                    ")"}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Unit Price
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.unit_price}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Purchase Date
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.purchase_date}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Expiry Date
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.expiry_date}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Available Qty.
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.available_qty}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Total
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.total_price}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Chalan
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.chalan_no}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Origin
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.origin}
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.HeadCell>
                                                Notes
                                            </Table.HeadCell>
                                            <Table.Cell>
                                                {data?.notes}
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </div>
                        ) : (
                            "Data loading...."
                        )}
                    </Card>
                </div>
            </AppLayout>
        </>
    );
};
export default View;
