import AppLayout from '@/components/Layouts/AppLayout'
import { useRouter } from 'next/router'
import { useEditInitialRequisitionQuery } from '@/store/service/requisitions/initial'
import PurchaseInput from '@/components/purchase-requisition/PurchaseInput'
import React, { useEffect, useState } from 'react'
import {
    removePurchaseRequisitionData,
    setAllPurchaseRequisitionData,
} from '@/store/service/requisitions/purchase_requisition_input_change'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useStorePurchaseRequisitionMutation } from '@/store/service/requisitions/purchase'
import Head from 'next/head'
import NavLink from '@/components/navLink'
import { Button, Card, Label, Radio } from 'flowbite-react'
import DataTable from 'react-data-table-component'

export default function create_purchase(props) {
    const router = useRouter()
    const initialRequisitionId = router.query.id
    const dispatch = useDispatch()
    const [totalPrice, setTotalPrice] = useState(0)
    const { products } = useSelector(state => state.purchase_requisition_inputs)
    const [
        storePurchaseRequisition,
        storeResult,
    ] = useStorePurchaseRequisitionMutation()
    const [paymentType, setPaymentType] = useState(0)

    const {
        data,
        isLoading,
        isError,
        isSuccess,
        isFetching,
    } = useEditInitialRequisitionQuery(router.query.id, {
        skip: !initialRequisitionId,
    })

    useEffect(() => {
        if (initialRequisitionId && isSuccess && !isLoading && !isError) {
            const requisition_products = data.data.requisition_products?.map(
                p => ({
                    ...p,
                    price: p.price ?? 0,
                }),
            )
            dispatch(setAllPurchaseRequisitionData(requisition_products))
            setTotalPrice(0)
        }
    }, [initialRequisitionId, isLoading])

    useEffect(() => {
        if (!products) return
        const t = products.reduceRight((total, current) => {
            const abc =
                parseFloat(current.price) *
                parseFloat(current.quantity_to_be_purchase)
            return (isNaN(abc) ? 0 : abc) + total
        }, 0)
        setTotalPrice(t)
    }, [products])

    useEffect(() => {
        if (
            !storeResult.isError &&
            !storeResult.isLoading &&
            storeResult.isSuccess
        ) {
            toast.success('Purchase requisition successfully generated.')
            const { data } = storeResult
            dispatch(removePurchaseRequisitionData())
            router.push(`/purchase-requisition/${data.data.id}/print_view`)
        }
    }, [storeResult])

    const submit = () => {
        if (!paymentType) {
            toast.error('Please select payment type.')
            return
        }
        if (products.length) {
            if (!totalPrice) {
                const check = confirm(
                    'Are you sure you want to submit an estimated amount of 0?',
                )
                if (check) {
                    toast.error(
                        'You are going to submit an estimated amount of 0?',
                    )
                    storePurchaseRequisition({
                        products,
                        payment_type: paymentType,
                    })
                }
            } else {
                storePurchaseRequisition({
                    products,
                    payment_type: paymentType,
                })
            }
        } else {
            toast.warn('Perhaps you forgot to add the item.')
        }
    }

    const tableColumns = [
        {
            name: 'Product',
            selector: row => row.product?.title,
            sortable: true,
        },
        {
            name: 'Variant',
            selector: row => row.product_option?.option_name,
            sortable: true,
        },
        {
            name: 'Unit',
            selector: row => row.product?.unit,
            sortable: true,
        },
        {
            name: 'Last Purchase',
            selector: row => row.last_purchase_date ?? 'New',
            sortable: true,
        },
        {
            name: 'Required Qty',
            selector: row => row.required_quantity,
            sortable: true,
        },
        {
            name: 'Available Qty',
            selector: row => row.available_quantity,
            sortable: true,
        },
        {
            name: 'Qty to be purchase',
            selector: row => row.quantity_to_be_purchase,
            sortable: true,
        },
        {
            name: 'Est. Unit Price',
            selector: row => (
                <PurchaseInput key={row.id} row={row} price={row.price ?? 0} />
            ),
            sortable: true,
        },
        {
            name: 'Est. Total',
            selector: row =>
                isNaN(row.price * row.quantity_to_be_purchase)
                    ? 0
                    : parseFloat(
                          row.price * row.quantity_to_be_purchase,
                      ).toLocaleString(),
            sortable: true,
        },
        {
            name: 'Purpose',
            selector: row => row.purpose,
            sortable: true,
        },
    ]

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Purchase Requisition.
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
                            href={`/initial-requisition`}>
                            <Button>Back</Button>
                        </NavLink>
                    </div>
                    <div
                        className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full space-y-4`}>
                        <div className={`shadow-md w-full`}>
                            <DataTable columns={tableColumns} data={products} />
                            <div
                                className={`mx-4 my-3 border-t-2 justify-items-end text-right`}>
                                <h2 className={`font-bold`}>
                                    Total Estimate Cost
                                </h2>
                                <h2 className={`font-bold`}>
                                    {totalPrice.toLocaleString()}
                                </h2>
                            </div>
                            <div className={`mx-4 my-3 border-t-2 w-full`}>
                                <fieldset className="flex flex-row gap-4">
                                    <legend className="mb-4">
                                        Choose payment type.
                                    </legend>
                                    <div className="flex items-center gap-2">
                                        <Radio
                                            id="cash"
                                            name="payment_type"
                                            value="1"
                                            onChange={e => {
                                                if (e.target.checked)
                                                    setPaymentType(1)
                                            }}
                                        />
                                        <Label htmlFor="cash">Cash</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Radio
                                            id="cheque"
                                            name="payment_type"
                                            value="2"
                                            onChange={e => {
                                                if (e.target.checked)
                                                    setPaymentType(2)
                                            }}
                                        />
                                        <Label htmlFor="cheque">Cheque</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Radio
                                            id="lpo"
                                            name="payment_type"
                                            value="3"
                                            onChange={e => {
                                                if (e.target.checked)
                                                    setPaymentType(3)
                                            }}
                                        />
                                        <Label htmlFor="lpo">LPO</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Radio
                                            id="fund"
                                            name="payment_type"
                                            value="4"
                                            onChange={e => {
                                                if (e.target.checked)
                                                    setPaymentType(4)
                                            }}
                                        />
                                        <Label htmlFor="fund">
                                            Fund available
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Radio
                                            id="maybe"
                                            name="payment_type"
                                            value="5"
                                            onChange={e => {
                                                if (e.target.checked)
                                                    setPaymentType(5)
                                            }}
                                        />
                                        <Label htmlFor="maybe">
                                            Maybe Arranged on
                                        </Label>
                                    </div>
                                </fieldset>
                            </div>
                            <div
                                className={`flex mx-4 my-3 border-t-2 justify-items-end text-right items-end flex-row justify-end`}>
                                <Button
                                    onClick={submit}
                                    isProcessing={storeResult.isLoading}
                                    gradientMonochrome="teal">
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
