import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { wrapper } from '@/store'
import { Button, Card, Label, TextInput } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import Actions from '@/components/actions'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    getProduct,
    getRunningQueriesThunk,
    useDestroyProductMutation,
    useGetProductQuery,
} from '@/store/service/product/product'
import moment from 'moment'
import Select from 'react-select'
import { useGetCategoryQuery } from '@/store/service/category'
import { hasPermission } from '@/lib/helpers'
import { useAuth } from '@/hooks/auth'
import { useDispatch, useSelector } from 'react-redux'
import { setProductSearch } from '@/store/slice/productSearchSlice'

const Product = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const productSearch = useSelector(state => state.product_search)
    const [searchParams, setSearchParams] = useState(productSearch)
    const { data, isLoading, isError } = useGetProductQuery(productSearch)
    const [destroy, destroyResponse] = useDestroyProductMutation()
    const [columns, setColumns] = useState([])
    const {
        data: category,
        isLoading: categoryISLoading,
    } = useGetCategoryQuery()
    const { user } = useAuth()

    useEffect(() => {
        if (!destroyResponse.isLoading && destroyResponse.isSuccess) {
            toast.success('Options deleted.')
        }
    }, [destroyResponse])
    useEffect(() => {
        if (!isLoading && !isError && data) {
            setColumns([
                {
                    name: 'Title',
                    selector: row => row.title,
                    sortable: true,
                },
                {
                    name: 'Unit',
                    selector: row => row.unit,
                    sortable: true,
                },
                {
                    name: 'Stock',
                    selector: row => row.total_stock,
                    sortable: true,
                },
                {
                    name: 'Category',
                    selector: row => row.category?.title,
                    sortable: true,
                },
                // {
                //     name: 'Last Purchase',
                //     selector: row => row.last_purchase?.created_at ? moment(row.last_purchase?.created_at).format('DD MMM Y') : null,
                //     sortable: true,
                // },
                {
                    name: 'Actions',
                    cell: row => (
                        <Actions
                            itemId={row.id}
                            edit={`/product/${row.id}/edit`}
                            view={`/product/${row.id}/view`}
                            destroy={destroy}
                            progressing={destroyResponse.isLoading}
                            permissionModule={`products`}
                        />
                    ),
                    ignoreRowClick: true,
                },
            ])
        }
    }, [isLoading, isError, data])

    const changeSearchParams = (key, value) => {
        dispatch(setProductSearch({ ...searchParams, [key]: value, page: 1 }))
    }

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Management.
                    </h2>
                }>
                <Head>
                    <title>Product Management.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-row space-x-4 shadow-lg py-4 px-4">
                            {hasPermission('create_products', user) ? (
                                <NavLink
                                    active={
                                        router.pathname === 'product/create'
                                    }
                                    href={`product/create`}>
                                    <Button>Create</Button>
                                </NavLink>
                            ) : null}

                            <div
                                className={`flex flex-row justify-center space-x-4 items-center`}>
                                <Label
                                    htmlFor={`category`}
                                    value={`Category`}
                                />
                                <Select
                                    id={`category`}
                                    className={`select !min-w-[70px]`}
                                    classNames={{
                                        control: state => 'select',
                                    }}
                                    options={category?.data
                                        ?.filter(c => !c.parent_id)
                                        .map(c => {
                                            const sub = c.subCategory?.map(
                                                s => ({
                                                    label: '=> ' + s.title,
                                                    value: s.id,
                                                }),
                                            )
                                            return {
                                                label: c.title,
                                                options: [
                                                    {
                                                        label: c.title,
                                                        value: c.id,
                                                    },
                                                    ...sub,
                                                ],
                                            }
                                        })}
                                    isLoading={categoryISLoading}
                                    isSearchable
                                    placeholder={`Search by category`}
                                    isClearable
                                    onChange={newValue => {
                                        changeSearchParams(
                                            'category_id',
                                            newValue?.value,
                                        )
                                    }}
                                />
                            </div>
                            <div
                                className={`flex flex-row justify-center space-x-4 items-center`}>
                                <Label htmlFor={`search`} value={`Search`} />
                                <TextInput
                                    value={productSearch?.search ?? ''}
                                    onChange={e =>
                                        changeSearchParams(
                                            'search',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.data}
                            pagination
                            paginationServer
                            responsive
                            progressPending={isLoading}
                            persistTableHead
                            onChangePage={(page, totalRows) =>
                                dispatch(
                                    setProductSearch({
                                        ...productSearch,
                                        page: page,
                                    }),
                                )
                            }
                            onChangeRowsPerPage={(
                                currentRowsPerPage,
                                currentPage,
                            ) =>
                                dispatch(
                                    setProductSearch({
                                        ...productSearch,
                                        page: currentPage,
                                        per_page: currentRowsPerPage,
                                    }),
                                )
                            }
                            paginationTotalRows={data?.number_of_rows}
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
        store.dispatch(getProduct.initiate())
        await Promise.all(store.dispatch(getRunningQueriesThunk()))
        return {
            props: {},
        }
    },
)

export default Product
