import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card } from "flowbite-react";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useEditPurchaseRequisitionQuery } from "@/store/service/requisitions/purchase";
import moment from "moment";
import './ReportPrint.module.css';


const PurchaseRequisitionReport = () => {
    const router = useRouter()
    const printPageRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: a => console.log(a),
    })
    const {
        data: requisition,
        isLoading,
        isError,
        refetch,
    } = useEditPurchaseRequisitionQuery(router.query.id, {
        skip: !router.query.id,
    })
    const requisition_products = requisition?.data?.purchase_requisition_products;
    return (
        <>
            <Head>
                <title>Purchase Requisition Report</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Purchase Requisition Report.
                    </h2>
                }>
                <Head>
                    <title>Purchase Requisition Report.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <Button onClick={() => router.back()}>Back</Button>
                            <Button
                                gradientDuoTone="purpleToBlue"
                                outline
                                onClick={() => handlePrint()}
                            >
                                Print
                            </Button>
                        </div>
                        <div className={`flex flex-col`}>
                            <div
                                className="flex flex-col relative overflow-x-auto"
                                ref={printPageRef}>
                                <div className={`flex flex-col`}>
                                    <div className={`text-center font-bold`}>
                                        <h2>
                                            IsDB-Bangladesh Islamic Solidarity
                                            Educational Wakf (IsDB-BISEW)
                                        </h2>
                                    </div>
                                    <div
                                        className={`flex flex-col justify-center items-center justify-items-center text-center font-bold`}>
                                        Purchase Requisition
                                    </div>
                                    <div
                                        className={`flex flex-col justify-center items-center justify-items-center text-center`}>
                                        {requisition?.data?.prf_no} -{' '}
                                        {requisition?.data?.department?.name}
                                    </div>
                                    <div
                                        className={`flex flex-col justify-center items-center justify-items-center text-center`}>
                                        {moment(
                                            requisition?.data?.created_at,
                                        ).format('HH:mm - DD MMM Y')}
                                    </div>
                                </div>
                                <div className={`m-4`}>
                                    <table
                                        className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                                        <thead
                                            className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                                        <tr>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-6`}>
                                                Sl#
                                            </th>
                                            <th scope="col"
                                                className={`border bg-white leading-3 p-1`}>
                                                Name of the Item
                                            </th>
                                            <th scope="col"
                                                className={`border bg-white leading-3 p-1`}>
                                                Unit
                                            </th>
                                            <th scope="col"
                                                className={`border bg-white leading-3 p-1`}>
                                                Req. Qty
                                            </th>
                                            <th scope="col"
                                                className={`border bg-white leading-3 p-1`}>
                                                Qty to purchase
                                            </th>
                                            <th scope="col"
                                                className={`border bg-white leading-3 p-1`}>
                                                Price
                                            </th>
                                            <th scope="col"
                                                className={`border bg-white leading-3 p-1`}>
                                                Actual Purchase
                                            </th>
                                            <th scope="col"
                                                className={`border bg-white leading-3 p-1`}>
                                                Purchase Amount
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className={`shadow-none text-gray-800`}>
                                        {requisition_products?.map(
                                            (row, i) => (
                                                <tr className={`border text-center bg-white`} key={i + 1}>
                                                    <td className={`border`}>
                                                        {i + 1}
                                                    </td>
                                                    <td className={`border`}>
                                                        {row.title}
                                                    </td>
                                                    <td className={`border`}>
                                                        {row.product?.unit}
                                                    </td>
                                                    <td className={`border`}>
                                                        {
                                                            row.required_quantity
                                                        }
                                                    </td>
                                                    <td className={`border`}>
                                                        {
                                                            row.quantity_to_be_purchase
                                                        }
                                                    </td>
                                                    <td className={`border`}>
                                                        {(row.unit_price * row.quantity_to_be_purchase).toLocaleString()}
                                                    </td>
                                                    <td className={`border`}>
                                                        {
                                                            row.actual_purchase
                                                        }
                                                    </td>
                                                    <td className={`border`}>
                                                        {row.purchase.reduce(
                                                            (o, n) =>
                                                                o +
                                                                n.total_price,
                                                            0,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default PurchaseRequisitionReport
