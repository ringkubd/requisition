import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useStorePurchaseMutation } from "@/store/service/purchase";
import moment from "moment/moment";
import { useGetCountriesQuery } from "@/store/service/country";
import axios from "@/lib/axios";
import { AsyncPaginate } from "react-select-async-paginate";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import { useGetBrandsQuery, useStoreBrandsMutation } from "@/store/service/brands";
import { useGetSuppliersQuery, useStoreSuppliersMutation } from "@/store/service/suppliers";
import DataTable from "react-data-table-component";
import Actions from "@/components/actions";
const create = (props) => {
    const router = useRouter();
    const [storePurchase, storeResult] = useStorePurchaseMutation();
    let formikForm = useRef();
    const selectRef = useRef();
    const purchaseRequisitionSelectRef = useRef();
    const [products, setProducts] = useState([]);
    const [selectedProductOptionId, setSelectedProductOptionId] = useState([]);
    const [columns, setColumns] = useState([]);
    const [requisitionDisabled, setRequisitionDisabled] = useState(false);
    const [unit, setUnit] = useState(null);

    const [items, setItems] = useState([]);

    const {data: countries, isLoading: countryLoading, isSuccess: countryIsSuccess, isError: countryIsError} = useGetCountriesQuery();
    const {data: brands, isError: brandsISError, isSuccess: brandsISSUccess, isLoading: brandsISLoading} = useGetBrandsQuery();
    const [storeBrand, storeBrandResult] = useStoreBrandsMutation();

    const {data: suppliers, isError: suppliersISError, isSuccess: suppliersISSUccess, isLoading: suppliersISLoading} = useGetSuppliersQuery();
    const [storeSupplier, storeSupplierResult] = useStoreSuppliersMutation();

    useEffect(() => {
        if (selectedProductOptionId){
            const unitPrice = products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.unit_price;
            const quantity = products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.quantity_to_be_purchase;
            const actual_purchase = products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.actual_purchase;

            formikForm.current.setFieldValue('product_id',products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.product_id)
            formikForm.current.setFieldValue('qty',quantity ? (quantity - actual_purchase)?.toString() : 0 )
            formikForm.current.setFieldValue('unit_price',unitPrice?.toString())
            formikForm.current.setFieldValue('total_price',(quantity ? (quantity - actual_purchase) * unitPrice : 0)?.toString())
        }
    }, [selectedProductOptionId])

    const initValues = {
        product_id: '',
        product_title: '',
        supplier_id: '',
        supplier_name: '',
        purchase_requisition_id: '',
        purchase_requisition_prf_no: '',
        product_option_id: '',
        product_option_name: '',
        qty: 0,
        unit_price: '',
        total_price: '',
        brand_id: '',
        brand_name: '',
        notes: '',
        purchase_date: moment().format('Y-MM-DD'),
        product_options: {}
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
            formikForm.current.setSubmitting(false);
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Purchase stored successfully.')
            formikForm.current.setSubmitting(false);
            formikForm.current.resetForm();
            selectRef.current.clearValue();
            setItems([]);
            if (purchaseRequisitionSelectRef){
                purchaseRequisitionSelectRef.current.focus();
                purchaseRequisitionSelectRef.current.clearValue();
            }
            setRequisitionDisabled(false);
            router.push('/purchase')

        }
    }, [storeResult]);
    const submit = async (values, pageProps) => {
        pageProps.setSubmitting(true);
        setItems([...items, values]);
        setRequisitionDisabled(true)
    }

    const removeItem = (row) => {
        setItems(items.filter(i => i.product_option_id !== row.product_option_id));
        setRequisitionDisabled(items.filter(i => i.product_option_id !== row.product_option_id).length)
    }

    const finalSubmit = () => {
        if (!items.length){
            alert("You can't submit empty purchase.");
        }
        const newItems = items.map((i) => ({
            product_id: i.product_id,
            supplier_id: i.supplier_id,
            purchase_requisition_id: i.purchase_requisition_id,
            purchase_requisition_prf_no: i.purchase_requisition_prf_no,
            product_option_id: i.product_option_id,
            available_qty: i.qty,
            qty: i.qty,
            unit_price: i.unit_price,
            total_price: i.total_price,
            brand_id: i.brand_id,
            notes: i.notes,
            purchase_date: i.purchase_date,
        }))
        storePurchase(newItems)
    }

    useEffect(() => {
        if (items.length){
            setColumns([
                {
                    name: 'Product',
                    selector: row => row.product_title,
                    sortable: true,
                },
                {
                    name: 'Supplier',
                    selector: row => row.supplier_name,
                    sortable: true,
                },
                {
                    name: 'Brand',
                    selector: row => row.brand_name,
                    sortable: true,
                },
                {
                    name: 'Qty',
                    selector: row => row.qty,
                    sortable: true,
                },
                {
                    name: 'Unit Price',
                    selector: row => row.unit_price,
                    sortable: true,
                },
                {
                    name: 'Purchase Date',
                    selector: row => row.purchase_date,
                    sortable: true,
                },
                {
                    name: 'Expiry Date',
                    selector: row => row.expiry_date,
                    sortable: true,
                },
                {
                    name: 'Available Qty.',
                    selector: row => row?.product_options?.stock,
                    sortable: true,
                },
                {
                    name: 'Total',
                    selector: row => row.total_price,
                    sortable: true,
                },
                {
                    name: 'Chalan / Bill',
                    selector: row => row.chalan_no,
                    sortable: true,
                },
                {
                    name: 'Origin',
                    selector: row => row.origin,
                    sortable: true,
                },
                {
                    name: 'Notes',
                    selector: row => row.notes,
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
                        permissionModule={`purchases`}
                    />,
                    ignoreRowClick: true,
                }
            ])
        }
    }, [items]);


    const validationSchema = Yup.object().shape({
        product_id: Yup.number().required().label('Product'),
        product_option_id: Yup.number().required().label('Variant'),
        supplier_id: Yup.number().label('Supplier'),
        purchase_requisition_id: Yup.number().required().label('Requisition'),
        qty: Yup.number().required().label('Quantity'),
        unit_price: Yup.number().required().label('Per Unit Price'),
        total_price: Yup.number().required().label('Total Price'),
    })

    async function loadOptions(search, loadedOptions, { page }) {
        const response = await axios.get(`/api/purchase-requisition-select`, {
            params: {
                search: search,
                page: page
            }
        });
        const responseJSON = response.data;
        return {
            options: responseJSON.data.map((r) => {
                return {
                    label: r.prf_no + " (" + moment(r.created_at).format('DD-MMM-Y')+" by "+r?.user?.name+")",
                    value: r.id,
                    data: r,
                    products: r.purchase_requisition_products
                }
            }),
            hasMore: responseJSON.data.length >= 10,
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
                        Add new purchase.
                    </h2>
                }
            >
                <Head>
                    <title>Add new purchase</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'purchase'}
                                href={`/purchase`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full space-y-8`}>
                            <DataTable
                                columns={columns}
                                data={items}
                            />
                            {
                                items.length ? (
                                    <Button onClick={finalSubmit}>Submit</Button>
                                ) : null
                            }

                            <hr className={`border-b-2 w-full`}/>
                            <Formik
                                initialValues={initValues}
                                onSubmit={submit}
                                validationSchema={validationSchema}
                                innerRef={formikForm}
                            >
                                {
                                    ({handleSubmit, handleChange, setFieldValue, handleBlur, values, errors, isSubmitting, setErrors}) => (
                                        <div className="flex flex-col gap-4 md:w-1/2 w-full">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="purchase_requisition_id"
                                                            value="Requisition"
                                                        />
                                                    </div>
                                                    <AsyncPaginate
                                                        defaultOptions
                                                        loadOptions={loadOptions}
                                                        name='purchase_requisition_id'
                                                        id='purchase_requisition_id'
                                                        selectRef={purchaseRequisitionSelectRef}
                                                        className={`select`}
                                                        classNames={{
                                                            control: state => 'select'
                                                        }}
                                                        onChange={(newValue, actionMeta) => {
                                                            setFieldValue('purchase_requisition_id',newValue?.value)
                                                            setSelectedProductOptionId(newValue?.data?.product_options?.id);
                                                            setProducts(newValue?.products);
                                                            setFieldValue('product_option_id',"")
                                                            selectRef.current.clearValue();
                                                            selectRef.current.focus();
                                                            setFieldValue('purchase_requisition_prf_no', newValue?.label);
                                                        }}
                                                        additional={{
                                                            page: 1,
                                                        }}
                                                        isDisabled={requisitionDisabled}
                                                    />
                                                    <ErrorMessage
                                                        name='purchase_requisition_id'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="product"
                                                            value="Product"
                                                        />
                                                    </div>
                                                    <Select
                                                        name='product_option_id'
                                                        id='product_option_id'
                                                        ref={selectRef}
                                                        className={`select`}
                                                        classNames={{
                                                            control: state => 'select'
                                                        }}
                                                        onChange={(newValue, data) => {
                                                            setFieldValue('product_option_id',newValue?.value)
                                                            setFieldValue('product_option_name',newValue?.product_options?.option_value)
                                                            setFieldValue('product_options',newValue?.product_options)
                                                            setFieldValue('product_title',newValue?.label)
                                                            setFieldValue('product_id',newValue?.product_options?.product_id)
                                                            setSelectedProductOptionId(newValue?.value);
                                                            setUnit(newValue?.unit);
                                                        }}
                                                        options={products?.map((p) => ({value: p.product_option_id, product_options: p, label: p.title + (!p.product_option?.option_value?.includes('N/A') ? " - "+p.product_option?.option_value : ""), unit: p?.product?.unit}))}
                                                    />

                                                    <ErrorMessage
                                                        name='product_option_id'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="brand_id"
                                                            value="Brand"
                                                        />
                                                    </div>
                                                    <CreatableSelect
                                                        className={'select'}
                                                        name={`brand_id`}
                                                        id={`brand_id`}
                                                        classNames={{
                                                            control: state => 'select'
                                                        }}
                                                        isLoading={brandsISLoading}
                                                        isDisabled={brandsISLoading || brandsISError}
                                                        isClearable
                                                        options={brands?.data?.map(b => ({value: b.id, label: b.name}))}
                                                        defaultOptions
                                                        onCreateOption={(value) => storeBrand({name: value})}
                                                        onChange={(newValue) => {
                                                            setFieldValue('brand_id', newValue?.value)
                                                            setFieldValue('brand_name', newValue?.label)
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name='brand_id'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="supplier"
                                                            value="Supplier"
                                                        />
                                                    </div>
                                                    <CreatableSelect
                                                        className={'select'}
                                                        name={`supplier_id`}
                                                        id={`supplier_id`}
                                                        classNames={{
                                                            control: state => 'select'
                                                        }}
                                                        isLoading={suppliersISLoading}
                                                        isDisabled={suppliersISLoading || suppliersISError}
                                                        isClearable
                                                        options={suppliers?.data?.map(b => ({value: b.id, label: b.name}))}
                                                        defaultOptions
                                                        onCreateOption={(value) => storeSupplier({name: value})}
                                                        onChange={(newValue) => {
                                                            setFieldValue('supplier_id', newValue?.value)
                                                            setFieldValue('supplier_name', newValue?.label)
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name='supplier_id'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="qty"
                                                            value={`Quantity ${unit ? '('+unit+')' : ''}`}
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="qty"
                                                        placeholder="5"
                                                        type="text"
                                                        required
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue('total_price', values.unit_price * e.target.value)
                                                        }}
                                                        onBlur={handleBlur}
                                                        value={values.qty}
                                                    />
                                                    <ErrorMessage
                                                        name='qty'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="unit_price"
                                                            value="Unit Price"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="unit_price"
                                                        name="unit_price"
                                                        placeholder="10.0"
                                                        type="text"
                                                        required
                                                        value={values.unit_price}
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                            setFieldValue('total_price', values.qty * e.target.value)
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='unit_price'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="total_price"
                                                            value="Total Price"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="total_price"
                                                        name="total_price"
                                                        placeholder="10.0"
                                                        type="text"
                                                        required
                                                        value={values.total_price}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue('unit_price', e.target.value / values.qty);
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='unit_price'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="purchase_date"
                                                            value="Purchase Date"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="purchase_date"
                                                        type="date"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.purchase_date}
                                                    />
                                                    <ErrorMessage
                                                        name='purchase_date'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="expiry_date"
                                                            value="Expiry Date"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="expiry_date"
                                                        type="date"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.expiry_date}
                                                    />
                                                    <ErrorMessage
                                                        name='expiry_date'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="origin"
                                                            value="Origin"
                                                        />
                                                    </div>
                                                    <Select
                                                        options={countries?.data?.map((c) => ({label: c.country_name, value: c.country_name}))}
                                                        onChange={(newValue) => setFieldValue('origin', newValue?.value)}
                                                        name='origin'
                                                        id='origin'
                                                        value={countries?.data?.filter(c => c.id === values.origin)?.map((c) => ({label: c.country_name, value: c.country_name}))[0]}
                                                        className={`select`}
                                                        classNames={{
                                                            control: state => 'select'
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name="description"
                                                        render={msg => (
                                                            <span className="text-red-500">{msg}</span>
                                                        )}
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="chalan_no"
                                                            value="Chalan/Bill Number"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="chalan_no"
                                                        name="chalan_no"
                                                        placeholder="Chalan number."
                                                        type="text"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name="chalan_no"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                    {msg}
                                                                </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="notes"
                                                            value="Notes"
                                                        />
                                                    </div>
                                                    <Textarea
                                                        id="notes"
                                                        name="notes"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.notes}
                                                    />
                                                    <ErrorMessage
                                                        name='notes'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4 justify-end">
                                                <Button
                                                    isProcessing={isSubmitting}
                                                    onClick={handleSubmit}
                                                    type='submit'
                                                    color={`success`}>Add</Button>
                                            </div>
                                        </div>
                                    )
                                }

                            </Formik>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default create;
