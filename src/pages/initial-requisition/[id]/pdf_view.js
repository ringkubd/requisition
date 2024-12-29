import AppLayout from '@/components/Layouts/AppLayout'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button, Card } from 'flowbite-react'
import { useEditInitialRequisitionQuery } from '@/store/service/requisitions/initial'
import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { PDFViewer } from '@react-pdf/renderer'
import InitialPDF from '@/components/initial-requisition/initialPDF'

const PDFView = props => {
    const router = useRouter()
    const { data, isLoading, isError } = useEditInitialRequisitionQuery(
        router.query.id,
        {
            skip: !router.query.id,
        },
    )

    const printPageRef = useRef()

    const requisition_products = data?.data?.requisition_products
    const mainData = data?.data

    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: a => console.log(a),
    })

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Initial Requisition
                </h2>
            }>
            <Head>
                <title>Initial Requisition</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="min-h-screen">
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
                    </div>

                    <div className={`mx-auto shadow-none w-full h-full`}>
                        {!isLoading && !isError && data ? (
                            <PDFViewer className={`w-full h-screen`}>
                                <InitialPDF
                                    mainData={mainData}
                                    requisition_products={requisition_products}
                                />
                            </PDFViewer>
                        ) : (
                            <h2>Data loading or error.</h2>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
export default PDFView
