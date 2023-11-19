import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";

const Role = () => {
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Role Management.
                </h2>
            }
        >
            <Head>
                <title>Role Management</title>
            </Head>
        </AppLayout>
    )
}
export default Role;
