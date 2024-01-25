import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Card } from "flowbite-react";
import React, { useRef, useState } from "react";

import { useReactToPrint } from "react-to-print";
import { useGetSingleCashRequisitionQuery } from "@/store/service/cash/Index";
import CashPrint from "@/components/cash-requisition/CashPrint";
import Status from "@/components/requisition/status";

const PrintView = (props) => {
    const router = useRouter();
    const [statusKey, setStatusKey] = useState(Math.round(Math.random() * 100000))
    const {data, isLoading, isError, refetch} = useGetSingleCashRequisitionQuery(router.query.id, {
        skip: !router.query.id
    });

    const printPageRef = useRef();

    const requisition_products = data?.data?.items;
    const mainData = data?.data;


    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: (a) => console.log(a)
    });

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Cash Requisition
                </h2>
            }>
            <Head>
                <title>Cash Requisition</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="min-h-screen">
                    <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                        <Button
                            onClick={() => router.back()}
                            gradientDuoTone="purpleToBlue">
                            Back
                        </Button>
                        <div className={`pt-1`}>
                            <Button
                                onClick={handlePrint}
                                gradientDuoTone="purpleToBlue"
                                outline>
                                Print
                            </Button>
                        </div>
                        <div className={`flex flex-row items-center`}>
                            {mainData ? (
                                <Status
                                    type={`cash`}
                                    requisition={mainData}
                                    from={`print_view`}
                                    key={statusKey}
                                    changeStatus={(a) => {
                                        setStatusKey(Math.round(Math.random() * 100000))
                                        refetch();
                                        router.reload()
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className={`mx-auto shadow-none`}>
                        {!isLoading && !isError && data ? (
                            <CashPrint
                                mainData={mainData}
                                requisition_products={requisition_products}
                                ref={printPageRef}
                            />
                        ) : (
                            <h2>Data loading or error.</h2>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
export default PrintView;
