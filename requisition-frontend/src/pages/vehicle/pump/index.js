import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { wrapper } from '@/store'
import { Button, Card } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import Actions from '@/components/actions'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    getPump,
    useDeletePumpMutation,
    useGetPumpQuery,
    getRunningQueriesThunk,
} from '@/store/service/vehicle/PumpAPI'

const Pump = () => {
    const router = useRouter()
    const { data, isLoading, isError } = useGetPumpQuery()
    const [destroy, destroyResponse] = useDeletePumpMutation()
    const [columns, setColumns] = useState([])

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('Pump deleted.')
        }
    }, [destroyResponse])
    useEffect(() => {
        if (!isLoading && !isError && data) {
            setColumns([
                {
                    name: 'Name',
                    selector: row => row.name,
                    sortable: true,
                },
                {
                    name: 'Contact',
                    selector: row => row.contact_no,
                    sortable: true,
                },
                {
                    name: 'Address',
                    selector: row => row.address,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: row => (
                        <Actions
                            itemId={row.id}
                            edit={`/vehicle/pump/${row.id}/edit`}
                            // view={`/category/${row.id}/view`}
                            destroy={destroy}
                            progressing={destroyResponse.isLoading}
                            permissionModule={`pumps`}
                        />
                    ),
                    ignoreRowClick: true,
                },
            ])
        }
        console.log(isLoading)
    }, [isLoading, isError, data])

    return (
        <>
            <Head>
                <title>Pump Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Pump Management.
                    </h2>
                }>
                <Head>
                    <title>Pump Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row shadow-lg py-4 px-4">
                            <NavLink
                                active={
                                    router.pathname === 'vehicle/pump/create'
                                }
                                href={`/vehicle/pump/create`}>
                                <Button>Create</Button>
                            </NavLink>
                            <Button
                                color={`dark`}
                                onClick={() => router.push('/vehicle/report')}>
                                Back
                            </Button>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.data}
                            pagination
                            responsive
                            progressPending={isLoading}
                            persistTableHead
                            fixedHeader
                            dense
                        />
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    store => async context => {
        // const params = context.params
        store.dispatch(getPump.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default Pump
