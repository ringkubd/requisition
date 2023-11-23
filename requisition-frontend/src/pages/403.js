import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEffect } from "react";

const NotFoundPage = () => {
    const router = useRouter();
    useEffect(() => {
        console.log(router)
    }, [router])
    return (
        <AppLayout
            header={<h2>Eroor page</h2>}
        >
            <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center sm:pt-0">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8 flex flex-col">
                    <div className="flex items-center pt-8 sm:justify-start sm:pt-0">
                        <div className="px-4 text-lg text-gray-500 border-r border-gray-400 tracking-wider">
                            403
                        </div>

                        <div className="ml-4 text-lg text-gray-500 uppercase tracking-wider">
                            You don't have permission.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )}

export default NotFoundPage
