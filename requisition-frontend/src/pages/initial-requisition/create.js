import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
    useGetPurposeSuggestionQuery,
    useStoreInitialRequisitionMutation
} from "@/store/service/requisitions/initial";
import DataTable from "react-data-table-component";
import Actions from "@/components/actions";
import moment from "moment";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { AsyncPaginate } from 'react-select-async-paginate';
import axios from "@/lib/axios";
import Select from "react-select";


const InitialRequisitionCreate = (props) => {
    const router = useRouter();
    const [storeInitialRequisition, storeResult] = useStoreInitialRequisitionMutation();
    const [products, setProducts] = useState([]);
    const selectRef = useRef();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductOption, setSelectedProductOption] = useState(null);
    const [productOptions, setProductOptions] = useState([]);
    const [productUnit, setProductUnit] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("")

    const suggestionQuery = useGetPurposeSuggestionQuery({
        product_id: selectedProduct,
        product_option_id: selectedProductOption
    }, {
        skip: !selectedProduct || !selectedProductOption
    })

    const [requisitionData, setRequisitionData] = useState([]);
    const [submitRemoveProcessing, setSubmitRemoveProcessing] = useState(false);

    const [suggestState, setSuggestState] = useState(false);
    const nodeRef= useRef();
    const suggestRef = useRef(false);
    const purposRef = useRef(false);
    let formikForm = useRef();

    useEffect(() => {
        if (suggestRef.current){
            suggestRef.current.addEventListener("click", (e) => {
                formikForm.current.setFieldValue('purpose',e.target.innerText)
            })
        }

    }, [suggestRef.current]);

    const initValues = {
        product_id: '',
        product_title: '',
        product_option_id: '',
        product_option_name: '',
        last_purchase_date: '',
        required_quantity: '',
        available_quantity: '',
        quantity_to_be_purchase: '',
        purpose: '',
        estimated_cost: 0,
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Designation stored successfully.')
            router.push('/initial-requisition')
        }
    }, [storeResult]);
    const submit = () => {
        if (requisitionData.length){
            storeInitialRequisition(requisitionData.map((i) => ({
                product_id: i.product_id,
                product_option_id: i.product_option_id,
                last_purchase_date:  i.last_purchase_date,
                required_quantity:  i.required_quantity,
                available_quantity:  i.available_quantity,
                quantity_to_be_purchase:  i.quantity_to_be_purchase,
                purpose:  i.purpose,
                estimated_cost:  i.estimated_cost,
            })))
        }else {
            toast.warn("Perhaps you forgot to add the item.");
        }
    }
    const addItems = (values, pageProps) => {
        values.estimated_cost = parseFloat(products.filter(p => p.id == values.product_id)[0]?.product_options.filter(o => o.id == values.product_option_id)[0].unit_price) * parseFloat(values.quantity_to_be_purchase);
        setRequisitionData([...requisitionData, values])
        pageProps.setSubmitting(false);
        pageProps.resetForm();
        selectRef.current.clearValue()
        selectRef.current.removeValue()
    }

    const validationSchema = Yup.object().shape({
        product_id: Yup.number().required().label('Product'),
        product_option_id: Yup.number().required().label('Variant'),
        required_quantity: Yup.number().required().label('Required Quantity'),
        available_quantity: Yup.number().required().label('Available Quantity'),
        quantity_to_be_purchase: Yup.number().required().label('Quantity to be purchase'),
        purpose: Yup.string().required().label('Purpose'),
    })
    const removeItem = (item) => {
        setSubmitRemoveProcessing(true)
        setRequisitionData(requisitionData.filter(r => item.product_id !== r.product_id && item.product_option_id !== r.product_option_id));
        setSubmitRemoveProcessing(false);
        selectRef.current?.clearValue();
        selectRef.current?.removeValue()
    }

    const tableColumns = [
        {
            name: 'Product',
            selector: row => row.product_title,
            sortable: true,
        },
        {
            name: 'Variant',
            selector: row =>  row.product_option_name,
            sortable: true,
        },
        {
            name: 'Last Purchase',
            selector: row => row.last_purchase_date,
            sortable: true,
        },
        {
            name: 'Required Quantity',
            selector: row => row.required_quantity,
            sortable: true,
        },
        {
            name: 'Available Quantity',
            selector: row => row.available_quantity,
            sortable: true,
        },
        {
            name: 'Qty to be purchase',
            selector: row => row.quantity_to_be_purchase,
            sortable: true,
        },
        {
            name: 'Purpose',
            selector: row => row.purpose,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => <Actions
                itemId={row.id}
                destroy={() => removeItem(row)}
                permissionModule={`add`}
                progressing={submitRemoveProcessing}
            />,
            ignoreRowClick: true,
        }
    ];

    async function loadOptions(search, loadedOptions, { page }) {
        const response = await axios.get(`/api/product-select`, {
            params: {
                search: search,
                page: page,
                category_id: selectedCategory
            }
        });
        const responseJSON = response.data;

        return {
            options: responseJSON.data?.products?.map((r,) => {
                return {
                    label: r.title,
                    value: r.id,
                    product_options: r.product_options,
                    unit: r.unit,
                }
            }),
            hasMore: responseJSON.data.count > 20,
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
                        Add new requisition.
                    </h2>
                }>
                <Head>
                    <title>Add new requisition</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={
                                    router.pathname === 'initial-requisition'
                                }
                                href={`/initial-requisition`}>
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full space-y-4`}>
                            <div
                                className={`shadow-md w-full shadow-amber-500`}>
                                <DataTable
                                    columns={tableColumns}
                                    data={requisitionData}
                                />
                            </div>
                            <Formik
                                initialValues={initValues}
                                onSubmit={addItems}
                                validationSchema={validationSchema}
                                innerRef={formikForm}>
                                {({
                                    handleSubmit,
                                    handleChange,
                                    handleBlur,
                                    setFieldValue,
                                    values,
                                    errors,
                                    isSubmitting,
                                    setErrors,
                                }) => (
                                    <div className={`flex flex-col w-full m-auto`}>
                                        {
                                            requisitionData.length ? (
                                                <div
                                                    className={`flex flex-row w-full justify-end justify-items-end items-end`}>
                                                    <Button
                                                        isProcessing={isSubmitting}
                                                        onClick={submit}
                                                        type="submit"
                                                        color={`success`}>
                                                        Submit
                                                    </Button>
                                                </div>
                                            ) : null
                                        }

                                        <div className="flex flex-col xl:flex-row gap-4 w-full justify-center shadow-md py-6 px-4">
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
                                                        }}
                                                        additional={{
                                                            page: 1,
                                                        }}
                                                        loadOptions={
                                                            loadCategory
                                                        }
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
                                        <div className="flex flex-col  gap-4 w-full shadow-md py-6 px-4 justify-center">
                                            <div className="flex flex-col md:flex-row w-full gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="product_id"
                                                            value="Product"
                                                        />
                                                    </div>
                                                    <AsyncPaginate
                                                        key={selectedCategory}
                                                        name="product_id"
                                                        id="product_id"
                                                        selectRef={selectRef}
                                                        className={`select`}
                                                        loadOptionsOnMenuOpen
                                                        classNames={{
                                                            control: state =>
                                                                'select',
                                                        }}
                                                        onChange={newValue => {
                                                            setProductOptions(
                                                                newValue?.product_options,
                                                            )
                                                            setProductUnit(
                                                                newValue?.unit,
                                                            )
                                                            setFieldValue(
                                                                'product_id',
                                                                newValue?.value,
                                                            )
                                                            setFieldValue(
                                                                'product_title',
                                                                newValue?.label,
                                                            )
                                                        }}
                                                        additional={{
                                                            page: 1,
                                                        }}
                                                        loadOptions={
                                                            loadOptions
                                                        }
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
                                                            value="Varient"
                                                        />
                                                    </div>
                                                    <Select
                                                        value={productOptions
                                                            ?.filter(po => parseInt(po.id) === parseInt(values.product_option_id))
                                                            ?.map(po => ({
                                                                label:
                                                                    po.option_value,
                                                                value: po.id,
                                                            }))}
                                                        onChange={newValue => {
                                                            setFieldValue(
                                                                'product_option_id',
                                                                newValue.value,
                                                            )
                                                            setFieldValue(
                                                                'product_option_name',
                                                                newValue.label,
                                                            )
                                                            setFieldValue(
                                                                'available_quantity',
                                                                newValue.stock ??
                                                                    0,
                                                            )
                                                            setFieldValue(
                                                                'last_purchase_date',
                                                                newValue.last_purchase_date ? moment(newValue.last_purchase_date,)?.format('Y-MM-DD') : null,
                                                            )
                                                        }}
                                                        id="product_option_id"
                                                        name="product_option_id"
                                                        options={productOptions?.map(
                                                            o => ({
                                                                label:
                                                                    o.option_value,
                                                                value: o.id,
                                                                stock: o.stock,
                                                                last_purchase_date: o.option_purchase_history[0]?.purchase_date
                                                            }),
                                                        )}
                                                        className={`select`}
                                                        classNames={{
                                                            control: state =>
                                                                `select`,
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name="product_option_id"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-row w-full gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="unit"
                                                            value="Unit"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        value={productUnit}
                                                        id="unit"
                                                        name="unit"
                                                        onChange={handleChange}
                                                    />
                                                    <ErrorMessage
                                                        name="Unit"
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
                                                            htmlFor="required_quantity"
                                                            value="Required Quantity"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        value={
                                                            values.required_quantity
                                                        }
                                                        id="required_quantity"
                                                        name="required_quantity"
                                                        type={`text`}
                                                        onChange={e => {
                                                            handleChange(e)
                                                            setFieldValue(
                                                                'quantity_to_be_purchase',
                                                                e.target.value -
                                                                    values.available_quantity <
                                                                    0
                                                                    ? 0
                                                                    : e.target
                                                                          .value -
                                                                          values.available_quantity,
                                                            )
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name="required_quantity"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-row w-full gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="available_quantity"
                                                            value="Available Quantity"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        value={
                                                            values.available_quantity
                                                        }
                                                        id="available_quantity"
                                                        name="available_quantity"
                                                        type={`text`}
                                                        onChange={handleChange}
                                                        onBlur={handleChange}
                                                    />
                                                    <ErrorMessage
                                                        name="available_quantity"
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
                                                            htmlFor="quantity_to_be_purchase"
                                                            value="Qty to be purchase"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        value={
                                                            values.quantity_to_be_purchase
                                                        }
                                                        id="quantity_to_be_purchase"
                                                        name="quantity_to_be_purchase"
                                                        type={`text`}
                                                        onChange={handleChange}
                                                    />
                                                    <ErrorMessage
                                                        name="quantity_to_be_purchase"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-row  w-full gap-4"></div>
                                            <div className="flex flex-row  w-full gap-4 relative">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="purpose"
                                                            value="Purpose"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex">
                                                            <div className="relative w-full">
                                                                <input
                                                                    className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
                                                                    id="purpose"
                                                                    name="purpose"
                                                                    ref={
                                                                        purposRef
                                                                    }
                                                                    value={
                                                                        values.purpose
                                                                    }
                                                                    onChange={e => {
                                                                        handleChange(
                                                                            e,
                                                                        )
                                                                    }}
                                                                    onFocus={() => {
                                                                        setSelectedProduct(
                                                                            values.product_id,
                                                                        )
                                                                        setSelectedProductOption(
                                                                            values.product_option_id,
                                                                        )
                                                                        setSuggestState(
                                                                            true,
                                                                        )
                                                                    }}
                                                                    onBlur={() =>
                                                                        setSuggestState(
                                                                            false,
                                                                        )
                                                                    }
                                                                    autoComplete={`off`}
                                                                />
                                                            </div>
                                                        </div>
                                                        <SwitchTransition>
                                                            <CSSTransition
                                                                key={
                                                                    suggestState
                                                                }
                                                                nodeRef={
                                                                    nodeRef
                                                                }
                                                                addEndListener={done =>
                                                                    nodeRef.current.addEventListener(
                                                                        'transitionend',
                                                                        done,
                                                                        false,
                                                                    )
                                                                }
                                                                classNames="fade">
                                                                <div
                                                                    ref={
                                                                        nodeRef
                                                                    }>
                                                                    {suggestState ? (
                                                                        !suggestionQuery.isLoading &&
                                                                        !suggestionQuery.isError &&
                                                                        suggestionQuery.data ? (
                                                                            <ul
                                                                                className={`py-1 mt-1 space-y-2 bg-green-100 px-1 z-50 absolute w-full`}
                                                                                ref={
                                                                                    suggestRef
                                                                                }>
                                                                                {suggestionQuery.data.data.map(
                                                                                    (
                                                                                        s,
                                                                                        i,
                                                                                    ) => (
                                                                                        <li
                                                                                            key={
                                                                                                i
                                                                                            }
                                                                                            className={`bg-gray-300 px-2 rounded hover:drop-shadow-md hover:cursor-pointer hover:bg-gray-400`}>
                                                                                            {
                                                                                                s.purpose
                                                                                            }
                                                                                        </li>
                                                                                    ),
                                                                                )}
                                                                            </ul>
                                                                        ) : suggestionQuery.isLoading ? (
                                                                            'Loading...'
                                                                        ) : (
                                                                            ''
                                                                        )
                                                                    ) : (
                                                                        <div></div>
                                                                    )}
                                                                </div>
                                                            </CSSTransition>
                                                        </SwitchTransition>
                                                    </div>
                                                    <ErrorMessage
                                                        name="purpose"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-row w-full gap-4">
                                                <Button
                                                    isProcessing={isSubmitting}
                                                    onClick={handleSubmit}
                                                    type="submit"
                                                    color={`warning`}>
                                                    Add
                                                </Button>
                                            </div>
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
export default InitialRequisitionCreate;
