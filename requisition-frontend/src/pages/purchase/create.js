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
import Select2Component from "@/components/select2/Select2Component";
import { useGetCountriesQuery } from "@/store/service/country";
import axios from "@/lib/axios";
import { AsyncPaginate } from "react-select-async-paginate";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import { useGetBrandsQuery, useStoreBrandsMutation } from "@/store/service/brands";
import { useGetSuppliersQuery, useStoreSuppliersMutation } from "@/store/service/suppliers";
const create = (props) => {
    const router = useRouter();
    const [storePurchase, storeResult] = useStorePurchaseMutation();
    let formikForm = useRef();
    const selectRef = useRef();
    const supplierSelectRef = useRef();
    const brandSelectRef = useRef();
    const purchaseRequisitionSelectRef = useRef();
    const [products, setProducts] = useState([]);
    const [selectedProductOptionId, setSelectedProductOptionId] = useState([]);
    // const [openAddSupplierModal, setOpenAddSupplierModal] = useState(false);
    // const [openAddBrandModal, setOpenAddBrandModal] = useState(false);
    const {data: countries, isLoading: countryLoading, isSuccess: countryIsSuccess, isError: countryIsError} = useGetCountriesQuery();
    const {data: brands, isError: brandsISError, isSuccess: brandsISSUccess, isLoading: brandsISLoading} = useGetBrandsQuery();
    const [storeBrand, storeBrandResult] = useStoreBrandsMutation();

    const {data: suppliers, isError: suppliersISError, isSuccess: suppliersISSUccess, isLoading: suppliersISLoading} = useGetSuppliersQuery();
    const [storeSupplier, storeSupplierResult] = useStoreSuppliersMutation();

    useEffect(() => {
        if (selectedProductOptionId){
            const unitPrice = products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.unit_price;
            const quantity = products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.quantity_to_be_purchase;

            formikForm.current.setFieldValue('product_id',products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.product_id)
            formikForm.current.setFieldValue('qty',quantity?.toString())
            formikForm.current.setFieldValue('unit_price',unitPrice?.toString())
            formikForm.current.setFieldValue('total_price',(quantity * unitPrice)?.toString())
        }
    }, [selectedProductOptionId])

    const initValues = {
        product_id: '',
        supplier_id: '',
        purchase_requisition_id: '',
        qty: '',
        unit_price: '',
        total_price: '',
        brand_id: '',
        notes: '',
        purchase_date: moment().format('Y-MM-DD')
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
            if (purchaseRequisitionSelectRef){
                purchaseRequisitionSelectRef.current.focus();
                purchaseRequisitionSelectRef.current.clearValue();
            }

        }
    }, [storeResult]);
    const submit = async (values, pageProps) => {
        pageProps.setSubmitting(true);
        storePurchase(values)
        selectRef.current.resetSelect()
        supplierSelectRef.current.resetSelect()
        brandSelectRef.current.resetSelect()
        purchaseRequisitionSelectRef.current.resetSelect()
        pageProps.resetForm();
    }

    const validationSchema = Yup.object().shape({
        product_id: Yup.number().label('Product'),
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
                      <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
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

                                                    }}
                                                    additional={{
                                                        page: 1,
                                                    }}
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
                                                      setSelectedProductOptionId(newValue?.value);
                                                  }}
                                                  options={products?.map((p) => ({value: p.product_option_id, label: p.title + " - "+p.product_option.title}))}
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
                                                    {/*<button onClick={() => setOpenAddBrandModal(true)}>+Add</button>*/}
                                                    {/*<AddBrandModal openModal={openAddBrandModal} setOpenModal={setOpenAddBrandModal} />*/}
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
                                                    {/*<button onClick={() => setOpenAddSupplierModal(true)}>+Add</button>*/}
                                                    {/*<AddSupplierModal openModal={openAddSupplierModal} setOpenModal={setOpenAddSupplierModal} />*/}
                                                </div>
                                                {/*<Select2ComponentAjax*/}
                                                {/*  name='supplier_id'*/}
                                                {/*  id='supplier_id'*/}
                                                {/*  ref={supplierSelectRef}*/}
                                                {/*  onChange={(e) => {*/}
                                                {/*      handleChange(e)*/}
                                                {/*  }}*/}
                                                {/*  className={`w-full border-1 border-gray-300`}*/}
                                                {/*  ajax={ {*/}
                                                {/*      url: process.env.NEXT_PUBLIC_BACKEND_API_URL+ `suppliers-select`,*/}
                                                {/*      data: function (params) {*/}
                                                {/*          return{*/}
                                                {/*              search: params.term,*/}
                                                {/*              page: params.page || 1*/}
                                                {/*          }*/}
                                                {/*      },*/}
                                                {/*      processResults: function (data, params) {*/}
                                                {/*          params.page = params.page || 1;*/}
                                                {/*          return {*/}
                                                {/*              results: data.data.map((d)=> {*/}
                                                {/*                  return {text: d.name, id: d.id}*/}
                                                {/*              }),*/}
                                                {/*              pagination: {*/}
                                                {/*                  more: (params.page * 10) < data.count_filtered*/}
                                                {/*              }*/}
                                                {/*          };*/}
                                                {/*      }*/}
                                                {/*  }}*/}
                                                {/*  data-placeholder="Select options..."*/}
                                                {/*/>*/}
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
                                                      value="Quantity"
                                                    />
                                                </div>
                                                <TextInput
                                                  id="qty"
                                                  placeholder="5"
                                                  type="number"
                                                  step={0.1}
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
                                                  type="number"
                                                  step={0.1}
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
                                                  type="number"
                                                  step={0.1}
                                                  required
                                                  value={values.total_price}
                                                  onChange={handleChange}
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
                                                <Select2Component
                                                  options={countries?.data?.map((c) => ({label: c.country_name, value: c.country_name}))}
                                                  onChange={handleChange}
                                                  name='origin'
                                                  id='origin'
                                                  className={`w-full border-1 border-gray-300`}
                                                  value={values.origin}
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
                                                      value="Chalan Number"
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
                                              color={`success`}>Submit</Button>
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
