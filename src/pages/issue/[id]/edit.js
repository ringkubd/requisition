import IssueInput from '@/components/issue/Input'
import Quantity from '@/components/issue/Quantity'
import AppLayout from '@/components/Layouts/AppLayout'
import NavLink from '@/components/navLink'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { useEditIssueQuery, useSyncProductIssuesMutation } from '@/store/service/issue'
import { useGetUsersQuery } from '@/store/service/user/management'
import { Button, Card, Label, Textarea, TextInput } from 'flowbite-react'
import { ErrorMessage, Formik } from 'formik'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Select from 'react-select'
import { AsyncPaginate } from 'react-select-async-paginate'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
const Edit = props => {
    const router = useRouter()
    const { user } = useAuth()
    const { data: users, isLoading: userIsLoading } = useGetUsersQuery({
        branch_id: user?.selected_branch,
        department_id: user?.selected_department,
    })
    const [syncProductIssues, { isLoading: isSyncLoading, isError: isSyncError, isSuccess: isSyncSuccess }] = useSyncProductIssuesMutation()
    const {
        data: issue,
        isLoading: issueISLoading,
        isError: issueISError,
        isSuccess: issueISSuccess,
    } = useEditIssueQuery(router.query.id, {
        skip: !router.query.id,
    })
    const [items, setItems] = useState([])
    const [originalItems, setOriginalItems] = useState([])
    const [columns, setColumns] = useState([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [productOptions, setProductOptions] = useState([])
    const [unit, setUnit] = useState('')
    const [stock, setStock] = useState(0)
    // Add item form initial values and validation
    const initValues = {
        product_id: '',
        product_title: '',
        product_option_id: '',
        product_option_name: '',
        quantity: '',
        purpose: '',
        uses_area: '',
        note: '',
    }
    const validationSchema = Yup.object().shape({
        product_option_id: Yup.number().required('Product Variant is required'),
        quantity: Yup.number().required('Quantity is required').max(stock, `Max: ${stock}`),
    })

    async function loadProductOptions(search, loadedOptions, { page }) {
        const response = await axios.get(`/api/product-select`, {
            params: {
                search: search,
                page: page,
            },
        })
        const responseJSON = response.data?.data
        return {
            options: responseJSON?.products.map(r => ({
                label: r.title,
                value: r.id,
                product: r,
                product_options: r.product_options,
            })),
            hasMore: responseJSON.count > 20,
            additional: {
                page: search ? 1 : page + 1,
            },
        }
    }

    useEffect(() => {
        // Ensure items is always an array
        let newItems = [];
        if (issue?.data?.products) {
            newItems = issue.data.products;
        } else if (Array.isArray(issue?.data)) {
            newItems = issue.data;
        }
        setItems(newItems);
        setOriginalItems(newItems);
    }, [issue, issueISSuccess])

    useEffect(() => {
        if (issueISSuccess) {
            setColumns([
                {
                    name: 'Product',
                    selector: row =>
                        row.product_title
                            ? row.product_title +
                              ' - ' +
                              row.product_option_name
                            : row?.product?.title +
                              ' - ' +
                              row?.variant?.option_value,
                    sortable: true,
                },
                {
                    name: 'Qty',
                    selector: row => <Quantity row={row} />,
                    sortable: true,
                },
                {
                    name: 'Purpose',
                    selector: row => <IssueInput value={row.purpose} onChange={value => handleTableInputChange(row, 'purpose', value)} />,
                    sortable: true,
                },
                {
                    name: 'Uses Area',
                    selector: row => <IssueInput value={row.uses_area} onChange={value => handleTableInputChange(row, 'uses_area', value)} />,
                    sortable: true,
                },
                {
                    name: 'Note',
                    selector: row => <IssueInput value={row.note} onChange={value => handleTableInputChange(row, 'note', value)} />,
                    sortable: true,
                },
                {
                    name: 'Remove',
                    cell: row => (
                        <Button color="failure" size="xs" onClick={() => {
                            setItems(items => Array.isArray(items) ? items.filter(i => i !== row) : [])
                        }}>
                            Remove
                        </Button>
                    ),
                    ignoreRowClick: true,
                    allowOverflow: true,
                    button: true,
                }
            ])
        }
    }, [issueISSuccess, issue])

    useEffect(() => {
        if (isSyncSuccess && !isSyncError && !isSyncLoading) {
            toast.success('Issue updated successfully');
        }
    }, [isSyncSuccess, isSyncError, isSyncLoading]);

     const handleTableInputChange = (row, field, value) => {
        console.log(row);
        setItems(prev => prev.map((item) => row.id === item.id ? { ...item, [field]: value } : item));
    };

    // Update handler for syncing product issues
    const handleUpdate = async () => {
        if (!router.query.id) return;
        try {
            await syncProductIssues({ productIssue: router.query.id, body: items });
            // Optionally, show a success message or refetch data
            toast.success('Product issues updated successfully');
        } catch (e) {
            // Optionally, handle error
            toast.error('Failed to update product issues');
        }
    };


    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Issue a product.
                    </h2>
                }>
                <Head>
                    <title> Issue a product.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen bg-gray-50">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded bg-white">
                            <NavLink
                                active={router.pathname === 'issue'}
                                href={`/issue`}>
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div className="flex flex-col basis-3/4 w-full">
                            <div className="flex flex-col my-4 p-6 sm:max-w-2xl rounded-lg bg-white shadow">
                                <h3 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-2">Issue Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="font-bold w-40">Receiver:</span>
                                        <span className="text-gray-700">{issue?.data?.receiver?.name || '-'}</span>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="font-bold w-40">Receiver Department:</span>
                                        <span className="text-gray-700">{issue?.data?.receiver_department?.name || '-'}</span>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="font-bold w-40">Issuer:</span>
                                        <span className="text-gray-700">{issue?.data?.issuer?.name || '-'}</span>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="font-bold w-40">Issuer Department:</span>
                                        <span className="text-gray-700 transition">{issue?.data?.issuer_department?.name || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between items-center mb-4 mt-8 px-2">
                                <h3 className="font-semibold text-lg text-gray-700">Items</h3>
                                <Button color="success" size="sm" className="transition-all" onClick={() => setShowAddForm(v => !v)}>
                                    {showAddForm ? 'Cancel' : 'Add Item'}
                                </Button>
                            </div>
                            <div
                                className={`mb-6 p-6 border rounded-lg bg-white shadow flex flex-col gap-2 transition-all duration-300 ${showAddForm ? 'opacity-100 scale-100 max-h-[1000px]' : 'opacity-0 scale-95 max-h-0 pointer-events-none'}`}
                                style={{ overflow: 'hidden' }}
                            >
                                {showAddForm && (
                                    <>
                                        <h4 className="font-semibold text-gray-700 mb-2">Add New Item</h4>
                                        <Formik
                                            initialValues={initValues}
                                            validationSchema={validationSchema}
                                            onSubmit={(values, { resetForm }) => {
                                                setItems(items => Array.isArray(items) ? [...items, values] : [values])
                                                setShowAddForm(false)
                                                resetForm()
                                            }}
                                        >
                                            {({ handleSubmit, handleChange, setFieldValue, handleBlur, values, errors, isSubmitting }) => (
                                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="w-full">
                                                            <Label htmlFor="product_id" value="Product" />
                                                            <AsyncPaginate
                                                                defaultOptions
                                                                name="product_id"
                                                                id="product_id"
                                                                className={`select`}
                                                                onChange={newValue => {
                                                                    setProductOptions(newValue.product_options)
                                                                    setFieldValue('product_id', newValue.value)
                                                                    setFieldValue('product_title', newValue.product.title)
                                                                    setFieldValue('quantity', '')
                                                                    setFieldValue('product_option_id', '')
                                                                    setUnit(newValue.product.unit)
                                                                    setStock(0)
                                                                }}
                                                                additional={{ page: 1 }}
                                                                loadOptions={loadProductOptions}
                                                                data-placeholder="Select product..."
                                                            />
                                                            <ErrorMessage name="product_id" render={msg => <span className="text-red-500">{msg}</span>} />
                                                        </div>
                                                        <div className="w-full">
                                                            <Label htmlFor="product_option_id" value="Variant" />
                                                            <Select
                                                                name="product_option_id"
                                                                id="product_option_id"
                                                                options={productOptions?.map(p => ({ value: p.id, label: p.option_value, other: p }))}
                                                                onChange={newValue => {
                                                                    setFieldValue('product_option_id', newValue?.value)
                                                                    setFieldValue('product_option_name', newValue?.label)
                                                                    setStock(newValue?.other?.stock ?? 0)
                                                                }}
                                                                className={'select'}
                                                                data-placeholder="Select variant..."
                                                            />
                                                            <ErrorMessage name="product_option_id" render={msg => <span className="text-red-500">{msg}</span>} />
                                                            <span className="text-xs text-gray-500">{stock} {unit} available</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="w-full">
                                                            <Label htmlFor="quantity" value="Quantity" />
                                                            <TextInput
                                                                id="quantity"
                                                                name="quantity"
                                                                placeholder="5"
                                                                type="text"
                                                                required
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.quantity}
                                                            />
                                                            <ErrorMessage name="quantity" render={msg => <span className="text-red-500">{msg}</span>} />
                                                        </div>
                                                        <div className="w-full">
                                                            <Label htmlFor="purpose" value="Purpose" />
                                                            <TextInput
                                                                id="purpose"
                                                                name="purpose"
                                                                type="text"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.purpose}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="w-full">
                                                            <Label htmlFor="uses_area" value="Uses Area" />
                                                            <TextInput
                                                                id="uses_area"
                                                                name="uses_area"
                                                                type="text"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.uses_area}
                                                            />
                                                        </div>
                                                        <div className="w-full">
                                                            <Label htmlFor="note" value="Note" />
                                                            <Textarea
                                                                id="note"
                                                                name="note"
                                                                type="text"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.note}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row gap-4 justify-end">
                                                        <Button isProcessing={isSubmitting} type="submit" color="success">Add</Button>
                                                    </div>
                                                </form>
                                            )}
                                        </Formik>
                                    </>
                                )}
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <DataTable
                                    columns={columns}
                                    progressPending={issueISLoading}
                                    data={Array.isArray(items) ? items : []}
                                />
                                {JSON.stringify(items) !== JSON.stringify(originalItems) && (
                                    <div className="flex flex-row justify-end mt-4">
                                        <Button
                                            color="success"
                                            isProcessing={isSyncLoading}
                                            onClick={handleUpdate}
                                            disabled={isSyncLoading}
                                        >
                                            {isSyncLoading ? 'Updating...' : 'Update'}
                                        </Button>
                                    </div>
                                )}
                                {isSyncError && (
                                    <div className="text-red-500 mt-2">Failed to update. Please try again.</div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default Edit
