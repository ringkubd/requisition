import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { wrapper } from '@/store'
import { Button, Card } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import Actions from '@/components/actions'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import Loading from '@/components/loading'
import {
    getRunningQueriesThunk,
    getUsers,
    useDestroyUserMutation,
    useGetUsersQuery,
} from '@/store/service/user/management'

const Employes = props => {
    const router = useRouter()
    const { data, isLoading, isError, refetch } = useGetUsersQuery()
    const [destroy, destroyResponse] = useDestroyUserMutation()

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('User deleted.')
        }
    }, [destroyResponse])

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Organization',
            selector: row => row.organization_name,
            sortable: true,
        },
        {
            name: 'Branch',
            selector: row => row.branch_name,
            sortable: true,
        },
        {
            name: 'Department',
            selector: row => row.department_name,
            sortable: true,
        },
        {
            name: 'Designation',
            selector: row => row.designation_name,
            sortable: true,
        },
        {
            name: 'Roles',
            selector: row => row.role_names,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <Actions
                    itemId={row.id}
                    edit={`/employees/${row.id}/edit`}
                    view={`/employees/${row.id}/view`}
                    destroy={destroy}
                    permissionModule={`users`}
                    progressing={destroyResponse.isLoading}
                />
            ),
            ignoreRowClick: true,
        },
    ]

    return (
        <>
            <Head>
                <title>Employee Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Employee Management.
                    </h2>
                }>
                <Head>
                    <title> Employee Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4 shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'employees/create'}
                                href={`employees/create`}>
                                <Button>Create</Button>
                            </NavLink>
                        </div>
                        {!isLoading && !isError && data && (
                            <DataTable
                                columns={columns}
                                data={data.data}
                                pagination
                                responsive
                                progressPending={isLoading}
                                progressComponent={<Loading />}
                                persistTableHead
                            />
                        )}
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    store => async context => {
        // const params = context.params
        store.dispatch(getUsers.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default Employes
