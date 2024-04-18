import React, { useRef } from "react";
import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Card } from "flowbite-react";
import { useReactToPrint } from "react-to-print";
import { useEditIssueQuery } from "@/store/service/issue";
import IssuePrint from "@/components/issue/IssuePrint";
import Status from "@/components/issue/Status";
import FuelMonthlyReportPrint from "@/components/fuel/FuelMonthlyReportPrint";

export default function FuelReportPrintView(props) {
    const printPageRef = useRef();
    const router = useRouter();
    const {data, isLoading, isError} = useEditIssueQuery(router.query.id, {
        skip: !router.query.id
    });
    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: (a) => console.log(a)
    });

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Issue Form
                </h2>
            }>
            <Head>
                <title>Issue Form</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="min-h-screen shadow-none">
                    <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                        <Button onClick={() => router.back()}>Back</Button>
                        <div className={`pt-1`}>
                            <Button
                                onClick={handlePrint}
                                gradientDuoTone="purpleToBlue"
                                outline>
                                Print
                            </Button>
                        </div>
                        <div className={`pt-1`}>
                            {
                                data?.data ? <Status row={data?.data} /> : null
                            }

                        </div>
                    </div>
                    <div className={`mx-auto shadow-none`}>
                        <FuelMonthlyReportPrint
                            products={data?.data ?? []}
                            ref={printPageRef}
                        />
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
