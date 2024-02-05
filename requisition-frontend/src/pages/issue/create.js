import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useGetUsersQuery } from "@/store/service/user/management";
import { useStoreIssueMutation } from "@/store/service/issue";
import moment from "moment";
import Select from "react-select";
import DataTable from "react-data-table-component";
import Actions from "@/components/actions";
import axios from "@/lib/axios";
import { AsyncPaginate } from "react-select-async-paginate";
import { useAuth } from "@/hooks/auth";
const create = (props) => {
    const router = useRouter();
    const { user } = useAuth()
    const [storeProductIssue, storeResult] = useStoreIssueMutation();
    let formikForm = useRef();
    const selectRef = useRef();
    const [selectedCategory, setSelectedCategory] = useState("")
    const {data: users , isLoading: userIsLoading} = useGetUsersQuery({
        branch_id: user?.selected_branch,
        department_id: user?.selected_department
    });
    const [productOptions, setProductOptions] = useState([]);
    const [stock, setStock] = useState(0);
    const [items, setItems] = useState([]);
    const [columns, setColumns] = useState([]);
    const [unit, setUnit] = useState("");
    const [useINCategory, setUseINCategory] = useState({});

    useEffect(() => {
        if (items.length){
            setColumns([
                {
                    name: 'Product',
                    selector: row => row.product_title + " - " + row.product_option_name,
                    sortable: true,
                },
                {
                    name: 'Qty',
                    selector: row => row.quantity,
                    sortable: true,
                },
                {
                    name: 'Receiver',
                    selector: row => row.receiver_name,
                    sortable: true,
                },
                {
                    name: 'Purpose',
                    selector: row => row.purpose,
                    sortable: true,
                },
                {
                    name: 'Uses Area',
                    selector: row => row.uses_area,
                    sortable: true,
                },
                {
                    name: 'Note',
                    selector: row => row.note,
                    sortable: true,
                },
                {
                    name: 'issue_time',
                    selector: row => row.issue_time,
                    sortable: true,
                },
                {
                    name: 'Actions',
                    cell: (row) => <Actions
                        itemId={row.id}
                        // edit={`/purchase/${row.id}/edit`}
                        // view={`/purchase/${row.id}/view`}
                        destroy={() => removeItem(row)}
                        // progressing={destroyResponse.isLoading}
                        permissionModule={`add`}
                    />,
                    ignoreRowClick: true,
                }
            ]);
        }
    }, [items]);

    const initValues = {
        product_id: '',
        product_title: '',
        product_option_id: '',
        product_option_name: '',
        quantity: '',
        receiver_id: '',
        receiver_name: '',
        purpose: '',
        uses_area: '',
        use_in_category: '',
        note: '',
        issue_time: moment().format('Y-MM-DDThh:mm'),
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
            formikForm.current.setSubmitting(false);
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
            formikForm.current.setSubmitting(false);
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Purchase stored successfully.')
            formikForm.current.setSubmitting(false);
            router.push('/issue')
        }
    }, [storeResult]);
    const submit = async (values, pageProps) => {
        console.log(values)
        setItems([...items, values]);
    }

    const removeItem = (row) => {
        setItems(items.filter(i => i.product_option_id !== row.product_option_id));
    }
    const validationSchema = Yup.object().shape({
        product_option_id: Yup.number().required().label('Product Variant'),
        quantity: Yup.number().when('product_option_id', {
            is: stock,
            then : Yup.number().required().max(stock),
        }).max(stock).label('Quantity'),
        receiver_id: Yup.number().required().label('Receiver'),
    })

    const finalSubmit = () => {
        const newItems = items.map((i) => ({
            product_id: i.product_id,
            product_option_id: i.product_option_id,
            quantity: i.quantity,
            receiver_id: i.receiver_id,
            purpose: i.purpose,
            uses_area: i.uses_area,
            note: i.note,
            issue_time: i.issue_time,
            use_in_category: i.use_in_category,
        }))
        storeProductIssue(newItems)
    }

    async function loadOptions(search, loadedOptions, { page }) {
        const response = await axios.get(`/api/product-select`, {
            params: {
                search: search,
                page: page,
                category_id: selectedCategory
            }
        });
        const responseJSON = response.data?.data;

        return {
            options: responseJSON?.products.map((r,) => {
                return {
                    label: r.category?.code + " => " + r.title,
                    value: r.id,
                    product: r,
                    product_options: r.product_options,
                }
            }),
            hasMore: responseJSON.count > 20,
            additional: {
                page: search ? 1 : page + 1,
            },
        };
    }

    async function loadCategory(search, loadedOptions, { page }) {
        const response = await axios.get(`/api/category-select`, {
            params: {
                search: search,
                page: page
            }
        });
        const responseJSON = response.data;
        return {
            options: responseJSON.data?.categories?.map((r,) => {
                return {
                    label: r.title,
                    value: r.id
                }
            }),
            hasMore: responseJSON.data.count > 20,
            additional: {
                page: search ? 1 : page + 1,
            },
        };
    }
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
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'issue'}
                                href={`/issue`}>
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            <DataTable columns={columns} data={items} />
                            {items.length ? (
                                <Button
                                    onClick={finalSubmit}
                                    isProcessing={storeResult.isLoading}
                                    className={`my-4`}>
                                    Submit
                                </Button>
                            ) : null}

                            <hr className={`border-b-2 w-full my-4`} />
                            <Formik
                                initialValues={initValues}
                                onSubmit={submit}
                                validationSchema={validationSchema}
                                innerRef={formikForm}>
                                {({
                                    handleSubmit,
                                    handleChange,
                                    setFieldValue,
                                    handleBlur,
                                    values,
                                    errors,
                                    isSubmitting,
                                    setErrors,
                                }) => (
                                    <div className="flex flex-col gap-4 md:w-1/2 w-full">
                                        <div className="w-full">
                                            <div className="flex flex-row w-full gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="category_id"
                                                            value="Category"
                                                        />
                                                    </div>
                                                    <AsyncPaginate
                                                        defaultOptions
                                                        name="category_id"
                                                        id="category_id"
                                                        className={`select`}
                                                        classNames={{
                                                            control: state =>
                                                                'select',
                                                        }}
                                                        onChange={newValue => {
                                                            setSelectedCategory(
                                                                newValue?.value,
                                                            )
                                                            setUseINCategory(newValue)
                                                        }}
                                                        additional={{
                                                            page: 1,
                                                        }}
                                                        loadOptions={
                                                            loadCategory
                                                        }
                                                        isClearable={true}
                                                        data-placeholder="Select options..."
                                                    />
                                                    <ErrorMessage
                                                        name="category_id"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                    {msg}
                                                                </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="product_id"
                                                        value="Product"
                                                    />
                                                </div>

                                                <AsyncPaginate
                                                    defaultOptions
                                                    key={selectedCategory}
                                                    name="product_id"
                                                    id="product_id"
                                                    selectRef={selectRef}
                                                    className={`select`}
                                                    classNames={{
                                                        control: state =>
                                                            'select',
                                                    }}
                                                    onChange={newValue => {
                                                        setProductOptions(
                                                            newValue.product_options,
                                                        )
                                                        setFieldValue(
                                                            'product_id',
                                                            newValue.value,
                                                        )
                                                        setFieldValue(
                                                            'product_title',
                                                            newValue?.product
                                                                ?.title,
                                                        )
                                                        setFieldValue(
                                                            'quantity',
                                                            '',
                                                        )
                                                        setFieldValue(
                                                            'product_option_id',
                                                            '',
                                                        )
                                                        setUnit(newValue?.product?.unit)
                                                        setStock(0)
                                                    }}
                                                    additional={{
                                                        page: 1,
                                                    }}
                                                    loadOptions={loadOptions}
                                                    data-placeholder="Select options..."
                                                />

                                                <ErrorMessage
                                                    name="product_id"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                            </div>

                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="product_option_id"
                                                        value="Variant"
                                                    />
                                                </div>
                                                <Select
                                                    name="product_option_id"
                                                    id="product_option_id"
                                                    options={productOptions?.map(
                                                        p => ({
                                                            value: p.id,
                                                            label: p.option_value,
                                                            other: p,
                                                        }),
                                                    )}
                                                    onChange={newValue => {
                                                        setFieldValue(
                                                            'product_option_id',
                                                            newValue?.value,
                                                        )
                                                        setFieldValue(
                                                            'product_option_name',
                                                            newValue?.label,
                                                        )
                                                        setStock(
                                                            newValue?.other
                                                                ?.stock ?? 0,
                                                        )
                                                    }}
                                                    className={'select'}
                                                    classNames={{
                                                        control: state =>
                                                            `select`,
                                                    }}
                                                    data-placeholder="Select options..."
                                                />

                                                <ErrorMessage
                                                    name="product_option_id"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                                <span>{stock} {unit} available</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="quantity"
                                                        value="Quantity"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="quantity"
                                                    name="quantity"
                                                    placeholder="5"
                                                    type="text"
                                                    required
                                                    onChange={e => {
                                                        handleChange(e)
                                                    }}
                                                    onBlur={handleBlur}
                                                    value={values.quantity}
                                                />
                                                <ErrorMessage
                                                    name="quantity"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                            </div>
                                            {' '}
                                            {/*Quantity*/}
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="receiver_id"
                                                        value="Receiver"
                                                    />
                                                </div>
                                                <Select
                                                    value={{
                                                        label:
                                                        values.receiver_name,
                                                        value:
                                                        values.receiver_id,
                                                    }}
                                                    onChange={newValue => {
                                                        setFieldValue(
                                                            'receiver_id',
                                                            newValue?.value,
                                                        )
                                                        setFieldValue(
                                                            'receiver_name',
                                                            newValue?.label,
                                                        )
                                                    }}
                                                    id="receiver_id"
                                                    name="receiver_id"
                                                    className={`select`}
                                                    classNames={{
                                                        control: state =>
                                                            `select`,
                                                    }}
                                                    data-placeholder="Select options..."
                                                    options={
                                                        !userIsLoading &&
                                                        users.data
                                                            ? users.data.map(
                                                                u => ({
                                                                    value:
                                                                    u.id,
                                                                    label:
                                                                    u.name,
                                                                }),
                                                            )
                                                            : []
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="receiver_id"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                            </div>
                                            {' '}
                                            {/*Variant*/}
                                        </div>
                                        {' '}
                                        {/*Product, variant*/}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="uses_area"
                                                        value="Uses Area"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="uses_area"
                                                    name="uses_area"
                                                    type="text"
                                                    onChange={e => {
                                                        handleChange(e)
                                                    }}
                                                    onBlur={handleBlur}
                                                    value={values.uses_area}
                                                />
                                                <ErrorMessage
                                                    name="uses_area"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                            </div>
                                            {' '}
                                            {/*uses_area*/}
                                        </div>
                                        {' '}
                                        {/*Quantity, receiver*/}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {' '}
                                            {/*Uses Area*/}
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="purpose"
                                                        value="Purpose"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="purpose"
                                                    name="purpose"
                                                    type="text"
                                                    onChange={e => {
                                                        handleChange(e)
                                                    }}
                                                    onBlur={handleBlur}
                                                    value={values.purpose}
                                                />
                                                <ErrorMessage
                                                    name="purpose"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                            </div>
                                            {' '}
                                            {/*Purpose*/}
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="issue_time"
                                                        value="Date"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="issue_time"
                                                    name="issue_time"
                                                    type="datetime-local"
                                                    onChange={e => {
                                                        handleChange(e)
                                                    }}
                                                    onBlur={handleBlur}
                                                    value={values.issue_time}
                                                />
                                                <ErrorMessage
                                                    name="date"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                            </div>
                                            {' '}
                                            {/*Date Time*/}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex flex-row w-full gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="use_in_category"
                                                            value="Use in Category"
                                                        />
                                                    </div>
                                                    <AsyncPaginate
                                                        defaultOptions
                                                        name="use_in_category"
                                                        id="use_in_category"
                                                        className={`select`}
                                                        classNames={{
                                                            control: state =>
                                                                'select',
                                                        }}
                                                        onChange={newValue => {
                                                            setFieldValue('use_in_category',newValue?.value)
                                                            setUseINCategory(newValue)
                                                        }}
                                                        additional={{
                                                            page: 1,
                                                        }}
                                                        loadOptions={
                                                            loadCategory
                                                        }
                                                        value={useINCategory}
                                                        data-placeholder="Select options..."
                                                    />
                                                    <ErrorMessage
                                                        name="category_id"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                    {msg}
                                                                </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="note"
                                                        value="Note"
                                                    />
                                                </div>
                                                <Textarea
                                                    id="note"
                                                    name="note"
                                                    type="text"
                                                    onChange={e => {
                                                        handleChange(e)
                                                    }}
                                                    onBlur={handleBlur}
                                                    value={values.note}
                                                />
                                                <ErrorMessage
                                                    name="note"
                                                    render={msg => (
                                                        <span className="text-red-500">
                                                            {msg}
                                                        </span>
                                                    )}
                                                />
                                            </div>
                                            {' '}
                                            {/*note*/}
                                        </div>
                                        {' '}
                                        {/*Note*/}
                                        <div className="flex flex-row gap-4 justify-end">
                                            <Button
                                                isProcessing={isSubmitting}
                                                onClick={handleSubmit}
                                                type="submit"
                                                color={`success`}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Formik>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default create;
