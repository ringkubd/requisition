import AppLayout from '@/components/Layouts/AppLayout'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button, Card, Table, TextInput } from 'flowbite-react'
import NavLink from '@/components/navLink'
import DataTable from 'react-data-table-component'
import React, { useEffect, useRef, useState } from 'react'
import {
    useEditPurchaseRequisitionQuery,
    useUpdatePurchaseRequisitionPriceMutation,
} from '@/store/service/requisitions/purchase'
import PurchaseInput from '@/components/purchase-requisition/PurchaseInput'
import { useSelector } from 'react-redux'
import moment from 'moment'

const Edit = props => {
    const router = useRouter()
    const [columns, setColumns] = useState([])
    const getPurchaseRequisitionData = useSelector(
        state => state.purchase_requisition_inputs,
    )
    const priceInputRef = useRef()
    const [
        updatePrice,
        updatePriceResult,
    ] = useUpdatePurchaseRequisitionPriceMutation()

    const { data, isLoading, isError } = useEditPurchaseRequisitionQuery(
        router?.query?.id,
        {
            skip: !router?.query?.id,
        },
    )

    const [requisition_products, seRequisitionProducts] = useState([])

    useEffect(() => {
        seRequisitionProducts(data?.data?.purchase_requisition_products)
    }, [isLoading, data])

    useEffect(() => {
        if (!isLoading && !isError && requisition_products) {
            setColumns([
                {
                    name: 'Name of the Item',
                    selector: row => row.title,
                    sortable: true,
                },
                {
                    name: 'Last Purchase Date',
                    selector: row => row.last_purchase_date_formated,
                    sortable: true,
                    maxWidth: '155px',
                },
                {
                    name: 'Unit',
                    selector: row => row.product?.unit,
                    sortable: true,
                    maxWidth: '140px',
                },
                {
                    name: 'Required Quantity',
                    selector: row => (
                        <TextInput
                            value={row.required_quantity}
                            onChange={e => {
                                const newRequisitionData = requisition_products.map(
                                    rd => {
                                        if (
                                            row.product_id === rd.product_id &&
                                            row.product_option_id ===
                                                rd.product_option_id
                                        ) {
                                            return {
                                                ...rd,
                                                required_quantity:
                                                    e.target.value,
                                                quantity_to_be_purchase:
                                                    row.available_quantity >
                                                    e.target.value
                                                        ? 0
                                                        : e.target.value -
                                                          row.available_quantity,
                                            }
                                        }
                                        return rd
                                    },
                                )
                                seRequisitionProducts(newRequisitionData)
                            }}
                            onBlur={e => {
                                updatePrice({
                                    quantity_to_be_purchase:
                                        row.available_quantity > e.target.value
                                            ? 0
                                            : e.target.value -
                                              row.available_quantity,
                                    required_quantity: e.target.value,
                                    purchase_requisition_id:
                                        row.purchase_requisition_id,
                                    product_id: row.id,
                                })
                            }}
                        />
                    ),
                    sortable: true,
                    maxWidth: '140px',
                },
                {
                    name: 'Available Qty',
                    selector: row => row.available_quantity,
                    sortable: true,
                    maxWidth: '140px',
                },
                {
                    name: 'Qty to be Purchase',
                    selector: row => row.quantity_to_be_purchase,
                    sortable: true,
                    maxWidth: '140px',
                },
                {
                    name: 'Unit Price',
                    selector: row => (
                        <PurchaseInput
                            ref={priceInputRef}
                            row={row}
                            unit_price={row.unit_price}
                        />
                    ),
                    sortable: true,
                    maxWidth: '140px',
                },
                {
                    name: 'Purpose ',
                    selector: row => row.purpose,
                    sortable: true,
                },
            ])
        }
    }, [isLoading, isError, requisition_products])

    useEffect(() => {
        const { unit_price, purchase_requisition_id, id: product_id } =
            priceInputRef.current?.updateRow ?? {}
        if (unit_price && purchase_requisition_id && product_id) {
            updatePrice({
                price: unit_price,
                purchase_requisition_id,
                product_id,
            })
        }
    }, [getPurchaseRequisitionData])

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Purchase Requisition
                </h2>
            }>
            <Head>
                <title>Purchase Requisition</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="min-h-screen">
                    <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                        <NavLink
                            active={router.pathname === 'initial-requisition'}
                            href={`/purchase-requisition`}>
                            <Button>Back</Button>
                        </NavLink>
                        <NavLink
                            active={router.pathname === 'initial-requisition'}
                            href={`/purchase-requisition/${router.query.id}/print_view`}>
                            <Button gradientDuoTone="purpleToBlue" outline>
                                Print
                            </Button>
                        </NavLink>
                    </div>
                    <div className="flex flex-col space-y-6">
                        <div className={`w-full shadow-md  p-2`}>
                            <h2 className={`w-full border-b pb-2 font-bold`}>
                                Basic Information
                            </h2>
                            <div className={`overflow-x-auto`}>
                                {!isLoading && !isError && data ? (
                                    <Table>
                                        <Table.Head>
                                            <Table.HeadCell>
                                                I.R.F. No
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Department
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Estimated Cost
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Purchase Status
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Purchase Requisition
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Generated by
                                            </Table.HeadCell>
                                            <Table.HeadCell>
                                                Created at
                                            </Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body>
                                            <Table.Row>
                                                <Table.Cell>
                                                    {data?.data?.irf_no}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {
                                                        data?.data?.department
                                                            ?.name
                                                    }
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {
                                                        data?.data
                                                            ?.estimated_total_amount
                                                    }
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data?.data
                                                        ?.is_purchase_done
                                                        ? 'Done'
                                                        : 'No'}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data?.data
                                                        ?.is_purchase_requisition_generated
                                                        ? 'Generated'
                                                        : 'No'}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data?.data?.user?.name}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {moment(
                                                        data?.data?.created_at,
                                                    ).format('DD MMM Y')}
                                                </Table.Cell>
                                            </Table.Row>
                                        </Table.Body>
                                    </Table>
                                ) : (
                                    <h2>Data loading or error.</h2>
                                )}
                            </div>
                        </div>
                        <div className={`w-full shadow-md  p-2 space-y-4`}>
                            <h2 className={`w-full border-b pb-2 font-bold`}>
                                Requisite Items
                            </h2>
                            <DataTable
                                columns={columns}
                                data={requisition_products}
                                pagination
                                responsive
                                progressPending={isLoading}
                                persistTableHead
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
export default Edit
