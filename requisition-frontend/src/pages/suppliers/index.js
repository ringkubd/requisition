import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { wrapper } from '@/store'
import { Button, Card, TextInput } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import Actions from '@/components/actions'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import {
    useDestroySuppliersMutation,
    useGetSuppliersQuery,
    getRunningQueriesThunk,
    getSuppliers,
} from '@/store/service/suppliers'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { setSupplierSearch } from '@/store/slice/supplierSlice'

const Suppliers = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const supplierSearch = useSelector(state => state.supplier_search)
    const { data, isLoading, isError } = useGetSuppliersQuery(supplierSearch)
    const [destroy, destroyResponse] = useDestroySuppliersMutation()

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('Supplier deleted.')
        }
    }, [destroyResponse])

    const columns = [
        {
            name: 'Supplier Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'logo',
            selector: row =>
                row.logo ? (
                    <Image
                        width={50}
                        height={50}
                        alt={row.name}
                        src={row.logo}
                    />
                ) : (
                    ''
                ),
            sortable: true,
        },
        {
            name: 'contact',
            selector: row => row.contact,
            sortable: true,
        },
        {
            name: 'address',
            selector: row => row.address,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <Actions
                    itemId={row.id}
                    destroy={destroy}
                    edit={`/suppliers/${row.id}/edit`}
                    view={`/suppliers/${row.id}/view`}
                    progressing={destroyResponse.isLoading}
                    permissionModule={`suppliers`}
                />
            ),
            ignoreRowClick: true,
        },
    ]

    return (
        <>
            <Head>
                <title>Suppliers Management</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Suppliers Management.
                    </h2>
                }>
                <Head>
                    <title>Suppliers Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                            <NavLink
                                active={router.pathname === 'suppliers/create'}
                                href={`suppliers/create`}>
                                <Button>Create</Button>
                            </NavLink>
                            <div>
                                <TextInput
                                    type="text"
                                    onChange={e => {
                                        dispatch(
                                            setSupplierSearch({
                                                ...supplierSearch,
                                                name: e.target.value,
                                            }),
                                        )
                                    }}
                                    value={supplierSearch?.name ?? ''}
                                />
                            </div>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.data}
                            pagination
                            paginationServer
                            onChangePage={page => {
                                dispatch(
                                    setSupplierSearch({
                                        ...supplierSearch,
                                        page,
                                    }),
                                )
                            }}
                            paginationTotalRows={data?.number_of_rows}
                            paginationPerPage={15}
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
        store.dispatch(getSuppliers.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default Suppliers
