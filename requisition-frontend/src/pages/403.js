import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { Button } from "flowbite-react";
import { useSelector } from "react-redux";

const NotFoundPage = (props) => {
    const router = useRouter();
    const {errors} = useSelector(state => state.errors);
    return (
        <AppLayout
            header={<h2>Error page</h2>}
        >
            <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center sm:pt-0">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8 flex flex-col">
                    <div className="flex items-center pt-8 sm:justify-start sm:pt-0">
                        <div className="px-4 text-lg text-gray-500 border-r border-gray-400 tracking-wider">
                            {errors?.status ?? 403}
                        </div>
                        <div
                            className="ml-4 text-lg text-gray-500 uppercase tracking-wider flex flex-col justify-center">
                            {errors?.message ?? "You don't have permission."}
                            <Button onClick={() => router.back()}>Back</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default NotFoundPage
