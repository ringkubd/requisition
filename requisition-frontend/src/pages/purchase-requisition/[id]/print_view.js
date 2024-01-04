import React, { useEffect, useRef, useState } from "react";
import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEditPurchaseRequisitionQuery } from "@/store/service/requisitions/purchase";
import Head from "next/head";
import { Button, Card } from "flowbite-react";
import RequisitionPrint from "@/components/purchase-requisition/RequisitionPrint";
import { useReactToPrint } from "react-to-print";
import Status from "@/components/requisition/status";

export default function PrintView(props) {
    const printPageRef = useRef();
    const router = useRouter();
    const {data, isLoading, isError, refetch} = useEditPurchaseRequisitionQuery(router.query.id, {
        skip: !router.query.id
    });
    const [statusKey, setStatusKey] = useState(Math.round(Math.random() * 100000))

    const requisition_products = data?.data?.purchase_requisition_products;
    const mainData = data?.data;

    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: (a) => console.log(a)
    });

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
                <Card className="min-h-screen shadow-none">
                    <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                        <Button onClick={() => router.back()}>Back</Button>
                        <div className={`pt-1`}>
                            <Button
                                onClick={handlePrint}
                                gradientDuoTone="purpleToBlue"
                                outline
                            >Print</Button>
                        </div>
                        <div className={`flex flex-row items-center`}>
                            {
                                mainData ? <Status key={statusKey} type={`purchase`} changeStatus={(a) => {
                                    refetch();
                                    setStatusKey(Math.round(Math.random() * 100000))
                                    router.reload()
                                }} requisition={mainData} from={`print_view`} /> : null
                            }
                        </div>


                    </div>
                    <div className={`mx-auto shadow-none`}>
                        <RequisitionPrint
                            requisition_products={requisition_products}
                            mainData={mainData}
                            ref={printPageRef} />
                    </div>
                </Card>
            </div>

        </AppLayout>
    )
}
