import React, { useEffect, useRef, useState } from 'react'
import AppLayout from '@/components/Layouts/AppLayout'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button, Card } from 'flowbite-react'
import { useReactToPrint } from 'react-to-print'
import Status from '@/components/requisition/status'
import { useOneTimeLoginMutation } from '@/store/service/user/management'
import GuestLayout from '@/components/Layouts/GuestLayout'
import { useEditInitialRequisitionQuery } from '@/store/service/requisitions/initial'
import InitialPrint from '@/components/initial-requisition/initialPrint'

export default function WhatsappView(props) {
    const printPageRef = useRef()
    const router = useRouter()
    const [loggedIn, setLoggedIn] = useState(false)
    const [
        onetimeLogin,
        { data: LoginData, isSuccess: loginSuccess },
    ] = useOneTimeLoginMutation()
    const { data, isLoading, isError } = useEditInitialRequisitionQuery(
        router.query.id,
        {
            skip: !router.query.id || !loggedIn,
        },
    )
    const [statusKey, setStatusKey] = useState(
        Math.round(Math.random() * 100000),
    )

    useEffect(() => {
        if (router?.query?.auth_key) {
            onetimeLogin({
                auth_key: router?.query?.auth_key,
            })
        }
    }, [router?.query?.auth_key])

    useEffect(() => {
        if (loginSuccess) {
            setLoggedIn(loginSuccess)
        }
    }, [loginSuccess])

    const requisition_products = data?.data?.requisition_products
    const mainData = data?.data

    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: a => console.log(a),
    })

    if (!loggedIn) {
        return (
            <GuestLayout>
                <title>Logged in</title>
            </GuestLayout>
        )
    }

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
            <div className="dark:bg-gray-100 md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="min-h-screen shadow-none dark:bg-gray-100">
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
                        <div className={`flex flex-row items-center`}>
                            {mainData ? (
                                <Status
                                    key={statusKey}
                                    type={`purchase`}
                                    changeStatus={a => {
                                        refetch()
                                        setStatusKey(
                                            Math.round(Math.random() * 100000),
                                        )
                                        router.reload()
                                    }}
                                    requisition={mainData}
                                    from={`print_view`}
                                />
                            ) : null}
                        </div>
                    </div>
                    <div className={`mx-auto shadow-none`}>
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
        </AppLayout>
    )
}
