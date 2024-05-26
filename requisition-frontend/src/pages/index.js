import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import ApplicationLogo from '@/components/applicationLogo'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
    const { user } = useAuth({ middleware: 'guest' })
    const router = useRouter()

    useEffect(() => {
        if (user) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }, [user])

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

                <div className="max-w-6xl mx-auto flex flex-col justify-center align-middle justify-items-center sm:px-6 lg:px-8">
                    <div className="flex justify-center pt-8 sm:justify-start sm:pt-0 border">
                        <ApplicationLogo />
                    </div>
                    <div className="flex justify-center items-center justify-items-center mt-4 sm:items-center sm:justify-between border text-center">
                        <div className="text-center text-sm text-gray-500 sm:text-right sm:ml-0">
                            IsDB-BISEW
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
