import AppLayout from '@/components/Layouts/AppLayout'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button, Card } from 'flowbite-react'
import React, { useRef, useState } from 'react'

import { useReactToPrint } from 'react-to-print'
import { useGetSingleCashRequisitionQuery } from '@/store/service/cash/Index'
import CashPrint from '@/components/cash-requisition/CashPrint'
import Status from '@/components/requisition/status'

const PrintView = props => {
    const router = useRouter()
    const [statusKey, setStatusKey] = useState(
        Math.round(Math.random() * 100000),
    )
    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetSingleCashRequisitionQuery(router.query.id, {
        skip: !router.query.id,
    })

    const printPageRef = useRef()

    const requisition_products = data?.data?.items
    const mainData = data?.data

    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: a => console.log(a),
    })

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Cash Requisition
                </h2>
            }>
            <Head>
                <title>Cash Requisition</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
                />
            </Head>
            <div className="py-0 md:py-8 px-0 md:mx-16 mx-0">
                <Card className="min-h-screen shadow-none rounded-none md:rounded-lg p-0 md:p-6">
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 gap-2 md:gap-4 border-b-2 shadow-lg p-2 md:p-4 rounded-none md:rounded mb-0">
                        <Button
                            onClick={() => router.back()}
                            gradientDuoTone="purpleToBlue">
                            Back
                        </Button>
                        <div className={`pt-0 md:pt-1`}>
                            <Button
                                onClick={handlePrint}
                                gradientDuoTone="purpleToBlue"
                                outline>
                                Print
                            </Button>
                        </div>
                        <div className={`flex flex-row items-center w-full md:w-auto`}>
                            {mainData ? (
                                <Status
                                    type={`cash`}
                                    requisition={mainData}
                                    from={`print_view`}
                                    key={statusKey}
                                    changeStatus={a => {
                                        setStatusKey(
                                            Math.round(Math.random() * 100000),
                                        )
                                        refetch()
                                        router.reload()
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto p-0 m-0">
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
export default PrintView
