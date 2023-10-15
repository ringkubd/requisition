import Navigation from '@/components/Layouts/Navigation'
import { useAuth } from '@/hooks/auth'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrganizationBranch from "@/components/Layouts/OrganizationBranch";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";

const AppLayout = ({ header, children }) => {
    const router = useRouter();
    const { user } = useAuth({ middleware: 'auth' })
    const changingEffect = (effect) => {
        if (effect){
            router.reload();
        }

    }

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            console.log(
                `App is changing to ${url} ${
                    shallow ? 'with' : 'without'
                } shallow routing`
            )
            setLoading(true)
        }

        router.events.on('routeChangeStart', handleRouteChange)

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', handleRouteChange)
        }
    }, [router])

    useEffect(() => {
        console.log(loading);
    }, [loading])

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
            <main fallback={<Loading />}>
                <Suspense fallback={<Loading />} children={children}>
                    {loading ? <Loading /> : children}
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
