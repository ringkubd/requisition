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
import Select2ComponentAjax from "@/components/select2/Select2ComponentAjax";
import moment from "moment/moment";
import Select2Component from "@/components/select2/Select2Component";
import AddSupplierModal from "@/components/suppliers/AddSupplierModal";
import AddBrandModal from "@/components/brands/addBrandModal";
import { useGetCountriesQuery } from "@/store/service/country";
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
    const [openAddSupplierModal, setOpenAddSupplierModal] = useState(false);
    const [openAddBrandModal, setOpenAddBrandModal] = useState(false);
    const {data: countries, isLoading: countryLoading, isSuccess: countryIsSuccess, isError: countryIsError} = useGetCountriesQuery();


    useEffect(() => {
        if (selectedProductOptionId){
            formikForm.current.setFieldValue('product_id',products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.product_id)
            formikForm.current.setFieldValue('qty',products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.quantity_to_be_purchase)
            formikForm.current.setFieldValue('unit_price',products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.unit_price)
        }
    }, [selectedProductOptionId])

    useEffect(() => {
        formikForm.current.setFieldValue('total_price',formikForm.current.values?.qty * formikForm.current.values?.unit_price);
    }, [formikForm.current?.values])

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
            formikForm.current.setSubmitting(false);
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Purchase stored successfully.')
            formikForm.current.setSubmitting(false);
            // router.push('/purchase')
            formikForm.current.resetForm();
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
                                                <Select2ComponentAjax
                                                  name='purchase_requisition_id'
                                                  id='purchase_requisition_id'
                                                  ref={purchaseRequisitionSelectRef}
                                                  onChange={(e, {data}) => {
                                                      handleChange(e)
                                                      setProducts(data)
                                                  }}
                                                  className={`w-full border-1 border-gray-300`}
                                                  ajax={{
                                                      url: process.env.NEXT_PUBLIC_BACKEND_API_URL+ `purchase-requisition-select`,
                                                      data: function (params) {
                                                          return {
                                                              search: params.term,
                                                              page: params.page || 1
                                                          }
                                                      },
                                                      processResults: function (data, params) {
                                                          params.page = params.page || 1;
                                                          return {
                                                              results: data.data.map((d)=> {
                                                                  return {text: d.irf_no + " (" + moment(d.created_at).format('DD-MMM-Y')+" by "+d?.user?.name+")", id: d.id, data: d?.purchase_requisition_products}
                                                              }),
                                                              pagination: {
                                                                  more: (params.page * 10) < data.count_filtered
                                                              }
                                                          };
                                                      },
                                                  }}
                                                  data-placeholder="Select options..."
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
                                                <Select2Component
                                                  name='product_option_id'
                                                  id='product_option_id'
                                                  ref={selectRef}
                                                  onChange={(e, data) => {
                                                      handleChange(e)
                                                      setSelectedProductOptionId(e.target.value);
                                                  }}
                                                  options={products?.map((p) => ({value: p.product_option_id, label: p.title + " - "+p.product_option.title}))}
                                                  className={`w-full border-1 border-gray-300`}
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
                                                    <button onClick={() => setOpenAddBrandModal(true)}>+Add</button>
                                                    <AddBrandModal openModal={openAddBrandModal} setOpenModal={setOpenAddBrandModal} />
                                                </div>
                                                <Select2ComponentAjax
                                                  name='brand_id'
                                                  id='brand_id'
                                                  ref={brandSelectRef}
                                                  onChange={(e) => {
                                                      handleChange(e)
                                                  }}
                                                  className={`w-full border-1 border-gray-300`}
                                                  ajax={ {
                                                      url: process.env.NEXT_PUBLIC_BACKEND_API_URL+ `brands`,
                                                      data: function (params) {
                                                          return{
                                                              search: params.term,
                                                              page: params.page || 1
                                                          }
                                                      },
                                                      processResults: function (data, params) {
                                                          params.page = params.page || 1;
                                                          return {
                                                              results: data.data.map((d)=> {
                                                                  return {text: d.name, id: d.id}
                                                              }),
                                                              pagination: {
                                                                  more: (params.page * 10) < data.count_filtered
                                                              }
                                                          };
                                                      }
                                                  }}
                                                  data-placeholder="Select options..."
                                                />
                                                <ErrorMessage
                                                  name='product_option_id'
                                                  render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                            </div>
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                      htmlFor="supplier"
                                                      value="Supplier"
                                                    />
                                                    <button onClick={() => setOpenAddSupplierModal(true)}>+Add</button>
                                                    <AddSupplierModal openModal={openAddSupplierModal} setOpenModal={setOpenAddSupplierModal} />
                                                </div>
                                                <Select2ComponentAjax
                                                  name='supplier_id'
                                                  id='supplier_id'
                                                  ref={supplierSelectRef}
                                                  onChange={(e) => {
                                                      handleChange(e)
                                                  }}
                                                  className={`w-full border-1 border-gray-300`}
                                                  ajax={ {
                                                      url: process.env.NEXT_PUBLIC_BACKEND_API_URL+ `suppliers-select`,
                                                      data: function (params) {
                                                          return{
                                                              search: params.term,
                                                              page: params.page || 1
                                                          }
                                                      },
                                                      processResults: function (data, params) {
                                                          params.page = params.page || 1;
                                                          return {
                                                              results: data.data.map((d)=> {
                                                                  return {text: d.name, id: d.id}
                                                              }),
                                                              pagination: {
                                                                  more: (params.page * 10) < data.count_filtered
                                                              }
                                                          };
                                                      }
                                                  }}
                                                  data-placeholder="Select options..."
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
