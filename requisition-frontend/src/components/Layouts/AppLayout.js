import Navigation from '@/components/Layouts/Navigation'
import { useAuth } from '@/hooks/auth'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import OrganizationBranch from "@/components/Layouts/OrganizationBranch";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import { EchoConfig } from "@/lib/echo";
import { useDispatch } from "react-redux";
import { setSingleInitialRequisition } from "@/store/slice/dashboardSlice";

const AppLayout = ({ header, children }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useAuth({ middleware: 'auth' })
    const changingEffect = (effect) => {
        if (effect){
            router.reload();
        }
    }
    const [load, setLoad] = useState(false);
    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            setLoad(true)
        }

        router.events.on('routeChangeStart', handleRouteChange)
        router.events.on('routeChangeComplete', () => {
            setLoad(false);
        })

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', handleRouteChange)
            router.events.off('routeChangeComplete', () => {
                setLoad(false);
            })
        }
    }, [router])

    useEffect(() => {
        EchoConfig();
        window.Echo.private('initial_requisition')
            .listen('InitialRequisitionEvent', e => {
                toast.success(`A new requisition is initialised by ${e.requisition?.user?.name}`)
                dispatch(setSingleInitialRequisition(e.requisition))
            })
    }, [])


    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation user={user} />
            {/* Page Heading */}
            <header className="bg-white shadow-md flex flex-row">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {header}
                </div>
                <OrganizationBranch changingEffect={changingEffect} user={user} />
            </header>

            {/* Page Content */}
            <main>
                <Suspense fallback={<Loading />} children={children}>
                    {load ? (
                        <Loading />
                    ) : children}
                </Suspense>
            </main>
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}

export default AppLayout
