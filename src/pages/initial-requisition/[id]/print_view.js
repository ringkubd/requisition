import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Card } from "flowbite-react";
import { useEditInitialRequisitionQuery } from "@/store/service/requisitions/initial";
import React, { useRef } from "react";
import InitialPrint from "@/components/initial-requisition/initialPrint";
import { useReactToPrint } from "react-to-print";

const PrintView = (props) => {
    const router = useRouter();
    const { data, isLoading, isError } = useEditInitialRequisitionQuery(
        router.query.id,
        {
            skip: !router.query.id,
        }
    );

    const printPageRef = useRef();

    const requisition_products = data?.data?.requisition_products;
    const mainData = data?.data;

    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: (a) => console.log(a),
    });

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Initial Requisition
                </h2>
            }
        >
            <Head>
                <title>Initial Requisition</title>
            </Head>
            <div className="py-2 md:py-8 w-full overflow-x-hidden">
                <div className="w-full max-w-full mx-auto px-2 sm:px-4 lg:px-8 overflow-x-hidden">
                    <Card className="min-h-screen overflow-x-hidden">
                        <div className="flex flex-row flex-wrap space-x-2 sm:space-x-4 gap-2 sm:gap-4 border-b-2 shadow-lg p-2 sm:p-4 rounded">
                            <Button onClick={() => router.back()}>Back</Button>
                            <div className={`pt-1`}>
                                <Button
                                    onClick={handlePrint}
                                    gradientDuoTone="purpleToBlue"
                                    outline
                                >
                                    Print
                                </Button>
                            </div>
                        </div>

                        <div className={`w-full overflow-x-auto`}>
                            {!isLoading && !isError && data ? (
                                <InitialPrint
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
            </div>
        </AppLayout>
    );
};
export default PrintView;
