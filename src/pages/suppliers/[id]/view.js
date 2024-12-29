import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import AppLayout from '@/components/Layouts/AppLayout'
import { useRouter } from 'next/router'
import { Button, Card, Table } from 'flowbite-react'
import Image from 'next/image'
import { useEditSuppliersQuery } from '@/store/service/suppliers'
import DataTable from 'react-data-table-component'

const View = () => {
    const router = useRouter()
    const id = router?.query?.id
    const { data: item, isLoading, isSuccess, isError } = useEditSuppliersQuery(
        id,
        {
            skip: !id,
        },
    )
    const { data } = item ?? {}
    const [columns, setColumns] = useState([])

    useEffect(() => {
        if (isSuccess && data?.purchase) {
            setColumns([
                {
                    name: 'SL',
                    selector: (row, index) => index + 1,
                    sortable: true,
                    width: '38px',
                    style: {
                        padding: 0,
                    },
                },
                {
                    name: 'Product',
                    selector: row =>
                        row?.product?.title +
                        (row?.productOption?.title.includes('N/A')
                            ? ''
                            : ' - ' + row?.productOption?.title),
                    sortable: true,
                },
                {
                    name: 'P.R. No.',
                    selector: row => row.purchaseRequisition?.prf_no,
                    sortable: true,
                    width: '96px',
                },
                {
                    name: 'Qty',
                    selector: row => row.qty + ' (' + row.product?.unit + ')',
                    sortable: true,
                    width: '90px',
                },
                {
                    name: 'Unit Price',
                    selector: row => row.unit_price,
                    sortable: true,
                    width: '100px',
                },
                {
                    name: 'Purchase Date',
                    selector: row => row.purchase_date,
                    sortable: true,
                },
                {
                    name: 'Available Qty.',
                    selector: row => row.available_qty,
                    sortable: true,
                },
                {
                    name: 'Total',
                    selector: row => row.total_price,
                    sortable: true,
                },
                {
                    name: 'Notes',
                    selector: row => row.notes,
                    sortable: true,
                },
            ])
        }
    }, [isLoading, isSuccess, data?.purchase])

    return (
        <>
            <Head>
                <title>Supplier Logs.</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Supplier Logs.
                    </h2>
                }>
                <Head>
                    <title>Supplier Logs.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                            <Button onClick={() => router.back()}>Back</Button>
                        </div>
                        {item && isSuccess ? (
                            <>
                                <Table>
                                    <Table.Head>
                                        <Table.HeadCell>Logo</Table.HeadCell>
                                        <Table.HeadCell>Name</Table.HeadCell>
                                        <Table.HeadCell>Contact</Table.HeadCell>
                                        <Table.HeadCell>Address</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell>
                                                {data.logo ? (
                                                    <Image
                                                        width={50}
                                                        height={50}
                                                        alt={data.name}
                                                        src={data.logo}
                                                    />
                                                ) : (
                                                    ''
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>{data.name}</Table.Cell>
                                            <Table.Cell>
                                                {data.contact}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {data.address}
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                                <h2>Purchase History</h2>
                                <hr className={`border-2 border-black`} />
                                <DataTable
                                    columns={columns}
                                    data={data?.purchase}
                                />
                            </>
                        ) : (
                            'Data loading....'
                        )}
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default View
