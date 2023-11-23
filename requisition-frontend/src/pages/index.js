import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import ApplicationLogo from "@/components/applicationLogo";

export default function Home() {
    const { user } = useAuth({ middleware: 'guest' })

    return (
        <>
            <Head>
                <title>IsDB-BISEW Inventory and Requisition System</title>
            </Head>

            <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center sm:pt-0">
                <div className="hidden fixed top-0 right-0 px-6 py-4 sm:block">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="ml-4 text-sm text-gray-700 underline">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-gray-700 underline">
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="ml-4 text-sm text-gray-700 underline">
                                Register
                            </Link>
                        </>
                    )}
                </div>

                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-center pt-8 sm:justify-start sm:pt-0">
                       <ApplicationLogo />
                    </div>

                    <div className="mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow sm:rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2">

                        </div>
                    </div>

                    <div className="flex justify-center mt-4 sm:items-center sm:justify-between">
                        <div className="text-center text-sm text-gray-500 sm:text-left">

                        </div>

                        <div className="ml-4 text-center text-sm text-gray-500 sm:text-right sm:ml-0">
                            IsDB-BISEW
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
