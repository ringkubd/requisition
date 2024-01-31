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
    useEditInitialRequisitionQuery,
    useUpdateInitialRequisitionMutation
} from "@/store/service/requisitions/initial";
import Actions from "@/components/actions";
import DataTable from "react-data-table-component";
import moment from "moment/moment";
import UpdateVariantForm from "@/components/initial-requisition/updateVariantForm";
import axios from "@/lib/axios";
import { AsyncPaginate } from "react-select-async-paginate";
import Select from "react-select";

const Edit = (props) => {
    const router = useRouter();
    const [updateInitialRequisition, updateResult] = useUpdateInitialRequisitionMutation();
    const { data, isLoading, isError } = useEditInitialRequisitionQuery(router.query.id, {
        skip: !router.query.id
    })
    const [products, setProducts] = useState([]);
    const selectRef = useRef();
    const [productOptions, setProductOptions] = useState([]);
    const [productUnit, setProductUnit] = useState("");

    const [requisitionData, setRequisitionData] = useState([]);
    const [submitRemoveProcessing, setSubmitRemoveProcessing] = useState(false);

    useEffect(() => {
        if (!isLoading && !isError && data){
            const obj = JSON.parse(JSON.stringify(data?.data?.requisition_products));
            const abcObj = obj?.map(rp => {
                rp['estimated_cost'] = parseFloat(rp.product_option?.unit_price) * rp.quantity_to_be_purchase
                return rp;
            });
            setRequisitionData(abcObj);
        }
    }, [isLoading, data]);

    let formikForm = useRef();

    const initValues = {
        product_id: '',
        product_option_id: '',
        last_purchase_date: '',
        required_quantity: '',
        available_quantity: '',
        quantity_to_be_purchase: '',
        purpose: '',
        estimated_cost: 0,
    }
    useEffect(() => {
        if (updateResult.isError){
            // formikForm.current.setErrors(updateResult.error.data.errors)
            // console.log(updateResult)
        }
        if (updateResult.isError || updateResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!updateResult.isLoading && updateResult.isSuccess){
            toast.success('Product Options stored successfully.')
            router.push('/initial-requisition')
        }
    }, [updateResult]);
    const submit = () => {
        if (requisitionData.length){
            const { id, ...patch } = { id: data.data.id, ...requisitionData }
            updateInitialRequisition({id: data.data.id, ...requisitionData})
        }else {
            toast.warn("Perhaps you forgot to add the item.");
        }
    }
    const addItems = (values, pageProps) => {
        values.estimated_cost = parseFloat(products.filter(p => p.id == values.product_id)[0]?.product_options.filter(o => o.id == values.product_option_id)[0].unit_price) * parseFloat(values.quantity_to_be_purchase);
        setRequisitionData([...requisitionData, values])
        pageProps.setSubmitting(false);
        pageProps.resetForm();
        selectRef.current.clearValue();
        selectRef.current.removeValue()
    }

    const updateItems = (values) => {
        const updated = requisitionData.map((rd) => {
            if (rd.id == values.id && rd.product_id == values.product_id){
                return {
                    product_id: values.product_id,
                    product_option_id: values.id,
                    last_purchase_date: values?.option_purchase_history[0] ? moment(values?.option_purchase_history[0]?.created_at).format("DD MMM Y") : '',
                    required_quantity: '',
                    available_quantity: values?.stock,
                    quantity_to_be_purchase: '',
                    purpose: '',
                    estimated_cost: 0,
                    product: values.product
                }

            }
            return rd;
        })
    }
    const updateOtherItems = (label, value, row) => {
        const newRequisitionData = requisitionData.map((rd) => {
            if (row.product_id == rd.product_id && row.product_option_id == rd.product_option_id){
                rd[label] = value
                return rd;
            }
            return rd;
        })
        setRequisitionData(newRequisitionData);
        selectRef.current.clearValue();
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
        selectRef.current.clearValue();
        selectRef.current.removeValue()
    }
    const tableColumns = [
        {
            name: 'Product',
            selector: row => {
                return products.filter(p => p.id == row.product_id)[0]?.title ?? row?.product?.title
            },
            sortable: true,
        },
        {
            name: 'Variant',
            selector: row => <UpdateVariantForm
                key={row.product_option_id}
                row={row}
                changeProduct={updateItems}
            /> ,
            sortable: true,
        },
        {
            name: 'Last Purchase',
            selector: row => row.last_purchase_date,
            sortable: true,
        },
        {
            name: 'Required Quantity',
            selector: row => <TextInput value={row.required_quantity} onChange={(e) => {
                const newRequisitionData = requisitionData.map((rd) => {
                    if (row.product_id == rd.product_id && row.product_option_id == rd.product_option_id){
                        return {
                            ...rd,
                            required_quantity: e.target.value,
                            quantity_to_be_purchase: row.available_quantity > e.target.value ? 0 : e.target.value - row.available_quantity
                        }
                    }
                    return rd;
                })
                setRequisitionData(newRequisitionData);
            }} />,
            sortable: true,
        },
        {
            name: 'Available Quantity',
            selector: row => row.available_quantity,
            sortable: true,
        },
        {
            name: 'Qty to be purchase',
            selector: row => {
                return row.quantity_to_be_purchase
            },
            sortable: true,
        },
        {
            name: 'Purpose',
            selector: row => <TextInput value={row.purpose} onChange={(e) => {
                updateOtherItems('purpose', e.target.value, row)
            }} />,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => <Actions
                itemId={row.id}
                destroy={() => removeItem(row)}
                progressing={submitRemoveProcessing}
            />,
            ignoreRowClick: true,
        }
    ];

    async function loadOptions(search, loadedOptions, { page }) {
        const response = await axios.get(`/api/product-select`, {
            params: {
                search: search,
                page: page
            }
        });
        const responseJSON = response.data;

        if (page === 1){
            setProducts(responseJSON.data?.products);
        }else{
            setProducts([...products, ...responseJSON.data?.products])
        }
        return {
            options: responseJSON.data?.products?.map((r,) => {
                return {
                    label: r.category?.code + " => " + r.title,
                    value: r.id,
                    product_options: r.product_options,
                    unit: r.unit,
                    last_purchase: r.last_purchase,
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
                        Update Initial Requisition.
                    </h2>
                }
            >
                <Head>
                    <title>Update Initial Requisition.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'initial-requisition'}
                                href={`/initial-requisition`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            <div className={`shadow-md w-full shadow-amber-500`}>
                                <DataTable
                                    columns={tableColumns}
                                    data={requisitionData}
                                />
                            </div>
                            {
                                !isLoading && !isError && (
                                    <Formik
                                        initialValues={initValues}
                                        onSubmit={addItems}
                                        validationSchema={validationSchema}
                                        innerRef={formikForm}
                                    >
                                        {
                                            ({handleSubmit, handleChange,setFieldValue, handleBlur, values, errors, isSubmitting, setErrors}) => (
                                                <>
                                                    <div className="flex flex-col lg:flex-row gap-4 w-full shadow-md py-6 px-4">
                                                        <div className="flex flex-row w-full gap-4">
                                                            <div className="w-full">
                                                                <div className="mb-2 block">
                                                                    <Label
                                                                        htmlFor="product_id"
                                                                        value="Product"
                                                                    />
                                                                </div>
                                                                <AsyncPaginate
                                                                    defaultOptions
                                                                    name='product_id'
                                                                    id='product_id'
                                                                    selectRef={selectRef}
                                                                    className={`select`}
                                                                    classNames={{
                                                                        control: state => 'select'
                                                                    }}
                                                                    onChange={(newValue) => {
                                                                        setProductOptions(newValue?.product_options)
                                                                        setProductUnit(newValue?.unit)
                                                                        setFieldValue('product_id',newValue?.value)
                                                                        setFieldValue('last_purchase_date', newValue?.last_purchase?.created_at ? moment(newValue?.last_purchase?.created_at)?.format('Y-M-DD') : null);
                                                                    }}
                                                                    additional={{
                                                                        page: 1,
                                                                    }}
                                                                    loadOptions={loadOptions}
                                                                    data-placeholder="Select options..."
                                                                />
                                                                <ErrorMessage
                                                                    name='product_id'
                                                                    render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row w-full lg:w-1/2 gap-4">
                                                            <div className="w-full">
                                                                <div className="mb-2 block">
                                                                    <Label
                                                                        htmlFor="unit"
                                                                        value="Unit"
                                                                    />
                                                                </div>
                                                                <TextInput
                                                                    value={productUnit}
                                                                    id='unit'
                                                                    name='unit'
                                                                    onChange={handleChange}
                                                                />
                                                                <ErrorMessage
                                                                    name='Unit'
                                                                    render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row w-full lg:w-1/2 gap-4">
                                                            <div className="w-full">
                                                                <div className="mb-2 block">
                                                                    <Label
                                                                        htmlFor="product_option_id"
                                                                        value="Varient"
                                                                    />
                                                                </div>
                                                                <Select
                                                                    value={productOptions?.filter((po) => po.id == values.product_option_id)?.map(po => ({label: po.option_value, value: po.id}))}
                                                                    onChange={(newValue) => {
                                                                        setFieldValue('product_option_id',newValue.value)
                                                                        setFieldValue('available_quantity', newValue.stock ?? 0);
                                                                    }}
                                                                    id='product_option_id'
                                                                    name="product_option_id"
                                                                    options={ productOptions?.map((o) => ({label: o.option_value, value: o.id, stock: o.stock, }))}
                                                                    className={`select`}
                                                                    classNames={{
                                                                        control: state => `select`
                                                                    }}
                                                                />
                                                                <ErrorMessage
                                                                    name='product_option_id'
                                                                    render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row w-full lg:w-1/2 gap-4">
                                                            <div className="w-full">
                                                                <div className="mb-2 block">
                                                                    <Label
                                                                        htmlFor="required_quantity"
                                                                        value="Required Quantity"
                                                                    />
                                                                </div>
                                                                <TextInput
                                                                    value={values.required_quantity}
                                                                    id='required_quantity'
                                                                    name='required_quantity'
                                                                    type={`text`}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        setFieldValue('quantity_to_be_purchase', (e.target.value - values.available_quantity) < 0 ? 0 : (e.target.value - values.available_quantity))
                                                                    }}
                                                                />
                                                                <ErrorMessage
                                                                    name='required_quantity'
                                                                    render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row w-full lg:w-1/2 gap-4">
                                                            <div className="w-full">
                                                                <div className="mb-2 block">
                                                                    <Label
                                                                        htmlFor="available_quantity"
                                                                        value="Available Quantity"
                                                                    />
                                                                </div>
                                                                <TextInput
                                                                    value={values.available_quantity}
                                                                    id='available_quantity'
                                                                    name='available_quantity'
                                                                    type={`text`}
                                                                    onChange={handleChange}
                                                                    onBlur={handleChange}
                                                                />
                                                                <ErrorMessage
                                                                    name='available_quantity'
                                                                    render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row  w-full lg:w-1/2 gap-4">
                                                            <div className="w-full">
                                                                <div className="mb-2 block">
                                                                    <Label
                                                                        htmlFor="quantity_to_be_purchase"
                                                                        value="Qty to be purchase"
                                                                    />
                                                                </div>
                                                                <TextInput
                                                                    value={values.quantity_to_be_purchase }
                                                                    id='quantity_to_be_purchase'
                                                                    name='quantity_to_be_purchase'
                                                                    type={`text`}
                                                                    onChange={handleChange}
                                                                />
                                                                <ErrorMessage
                                                                    name='quantity_to_be_purchase'
                                                                    render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row w-full gap-4">
                                                            <div className="w-full">
                                                                <div className="mb-2 block">
                                                                    <Label
                                                                        htmlFor="purpose"
                                                                        value="Purpose"
                                                                    />
                                                                </div>
                                                                <TextInput
                                                                    value={values.purpose }
                                                                    id='purpose'
                                                                    name='purpose'
                                                                    onChange={handleChange}
                                                                />
                                                                <ErrorMessage
                                                                    name='purpose'
                                                                    render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row gap-4 justify-end mt-8">
                                                            <Button
                                                                isProcessing={isSubmitting}
                                                                onClick={handleSubmit}
                                                                type='submit'
                                                                color={`warning`}>Add</Button>
                                                        </div>
                                                    </div>
                                                    <div className={`flex flex-row w-full justify-end justify-items-end items-end`}>
                                                        <Button
                                                            isProcessing={isSubmitting}
                                                            onClick={submit}
                                                            type='submit'
                                                            color={`success`}>Submit</Button>
                                                    </div>
                                                </>
                                            )
                                        }

                                    </Formik>
                                )
                            }
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default Edit;
