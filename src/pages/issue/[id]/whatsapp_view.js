import React, { useRef, useState, useEffect } from 'react'

// Debug: Log environment
if ( typeof window === 'undefined' )
{
    // This will show up in server logs
    // eslint-disable-next-line no-console
    console.debug( 'WhatsappView: Running on server' )
} else
{
    // eslint-disable-next-line no-console
    console.debug( 'WhatsappView: Running on client' )
}
import AppLayout from '@/components/Layouts/AppLayout'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button, Card } from 'flowbite-react'
import { useReactToPrint } from 'react-to-print'
import { useEditIssueQuery } from '@/store/service/issue'
import IssuePrint from '@/components/issue/IssuePrint'
import Status from '@/components/issue/Status'
import GuestLayout from '@/components/Layouts/GuestLayout'
import { useOneTimeLoginMutation } from '@/store/service/user/management'

export default function WhatsappView( props )
{
    const printPageRef = useRef()
    const router = useRouter()
    const [ loggedIn, setLoggedIn ] = useState( false );
    const [
        onetimeLogin,
        { data: LoginData, isSuccess: loginSuccess },
    ] = useOneTimeLoginMutation()


    useEffect( () =>
    {
        // Debug: Log router.query
        console.debug( 'WhatsappView: router.query', router.query )
        if ( router?.query?.auth_key )
        {
            console.debug( 'WhatsappView: Found auth_key', router.query.auth_key )
            onetimeLogin( {
                auth_key: router?.query?.auth_key,
            } )
        }
    }, [ router?.query?.auth_key ] )


    useEffect( () =>
    {
        // Debug: Log loginSuccess
        console.debug( 'WhatsappView: loginSuccess', loginSuccess )
        if ( loginSuccess )
        {
            setLoggedIn( loginSuccess )
        }
    }, [ loginSuccess ] )



    // Debug: Log when fetching issue data
    const { data, isLoading, isError } = useEditIssueQuery( router.query.id, {
        skip: !router.query.id || !loggedIn,
    } )
    useEffect( () =>
    {
        console.debug( 'WhatsappView: useEditIssueQuery', {
            id: router.query.id,
            loggedIn,
            isLoading,
            isError,
            data,
        } )
    }, [ router.query.id, loggedIn, isLoading, isError, data ] )

    // Debug: Log print ref
    const handlePrint = useReactToPrint( {
        content: () =>
        {
            console.debug( 'WhatsappView: printPageRef', printPageRef.current )
            return printPageRef.current
        },
        onBeforePrint: a => console.debug( 'WhatsappView: onBeforePrint', a ),
        onAfterPrint: () => console.debug( 'WhatsappView: onAfterPrint' ),
        onPrintError: err => console.error( 'WhatsappView: Print error', err ),
    } )


    if ( !loggedIn )
    {
        // Debug: Not logged in
        console.debug( 'WhatsappView: Not logged in' )
        return (
            <GuestLayout>
                <title>Logged in</title>
            </GuestLayout>
        )
    }



    // Debug: Rendering main layout
    console.debug( 'WhatsappView: Rendering main layout', { data, isLoading, isError, loggedIn } )
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Issue WhatsApp View
                </h2>
            }>
            <Head>
                <title>Issue WhatsApp View</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="min-h-screen shadow-none">
                    <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                        <Button onClick={() =>
                        {
                            console.debug( 'WhatsappView: Back button clicked' )
                            router.back()
                        }}>Back</Button>
                        <div className={`pt-1`}>
                            <Button
                                onClick={() =>
                                {
                                    console.debug( 'WhatsappView: Print button clicked' )
                                    handlePrint()
                                }}
                                gradientDuoTone="purpleToBlue"
                                outline>
                                Print
                            </Button>
                        </div>
                        <div className={`pt-1`}>
                            {data?.data ? <Status row={data?.data} /> : null}
                        </div>
                    </div>
                    <div className={`mx-auto shadow-none`}>
                        {/* Debug: IssuePrint rendering */}
                        {( () =>
                        {
                            try
                            {
                                return <IssuePrint products={data?.data ?? []} ref={printPageRef} />
                            } catch ( err )
                            {
                                console.error( 'WhatsappView: Error rendering IssuePrint', err )
                                return <div style={{ color: 'red' }}>Error rendering IssuePrint</div>
                            }
                        } )()}
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
