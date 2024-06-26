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
    getOptions,
    getRunningQueriesThunk,
    useDestroyOptionsMutation,
    useGetOptionsQuery,
} from '@/store/service/options'

const Options = () => {
    const router = useRouter()
    const { data, isLoading, isError } = useGetOptionsQuery()
    const [destroy, destroyResponse] = useDestroyOptionsMutation()
    const [columns, setColumns] = useState([])

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('Options deleted.')
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
                    name: 'Description',
                    selector: row => row.description,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: row => (
                        <Actions
                            itemId={row.id}
                            edit={`/options/${row.id}/edit`}
                            view={`/options/${row.id}/view`}
                            destroy={destroy}
                            progressing={destroyResponse.isLoading}
                            permissionModule={`options`}
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
                <title>Product Options Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Options Management.
                    </h2>
                }>
                <Head>
                    <title>Product Options Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4 shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'options/create'}
                                href={`options/create`}>
                                <Button>Create</Button>
                            </NavLink>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.data}
                            pagination
                            responsive
                            progressPending={isLoading}
                            persistTableHead
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
        store.dispatch(getOptions.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default Options
