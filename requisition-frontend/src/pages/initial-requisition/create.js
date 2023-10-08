import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Select, TextInput } from "flowbite-react";
import NavLink from "@/components/NavLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  useLastPurchaseInformationQuery,
  useStoreInitialRequisitionMutation
} from "@/store/service/requisitions/initial";
import Select2ComponentAjax from "@/components/select2/Select2ComponentAjax";
import DataTable from "react-data-table-component";
import Actions from "@/components/Actions";
import moment from "moment";


const InitialRequisitionCreate = (props) => {
  const router = useRouter();
  const [storeInitialRequisition, storeResult] = useStoreInitialRequisitionMutation();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductOptionId, setSelectedProductOptionId] = useState("");
  const selectRef = useRef();

  const [requisitionData, setRequisitionData] = useState([]);
  const [submitRemoveProcessing, setSubmitRemoveProcessing] = useState(false);

  const lastPurchase = useLastPurchaseInformationQuery({
    product_id: selectedProductId,
    product_option_id: selectedProductOptionId
  }, {
    skip: !selectedProductId || !selectedProductOptionId
  })
  let formikForm = useRef();

  useEffect(() => {
    console.log(!selectedProductId || !selectedProductOptionId)
    console.log(selectedProductId, selectedProductOptionId)
  }, [selectedProductId, selectedProductOptionId]);

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
      storeInitialRequisition(requisitionData)
    }else {
      toast.warn("Perhaps you forgot to add the item.");
    }
  }
  const addItems = (values, pageProps) => {
    values.estimated_cost = parseFloat(products.filter(p => p.id == values.product_id)[0]?.product_options.filter(o => o.id == values.product_option_id)[0].unit_price) * parseFloat(values.quantity_to_be_purchase);
    // values.unit = products.filter(p => p.id == values.product_id)[0]?.unit;
    setRequisitionData([...requisitionData, values])
    pageProps.setSubmitting(false);
    pageProps.resetForm();
    selectRef.current.resetSelect();
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
    selectRef.current.resetSelect();
  }

  const tableColumns = [
    {
      name: 'Product',
      selector: row => products.filter(p => p.id == row.product_id)[0]?.title,
      sortable: true,
    },
    {
      name: 'Variant',
      selector: row =>  products.filter(p => p.id == row.product_id)[0]?.product_options?.filter(o => o.id == row.product_option_id).map(o => (o.option.name + `(${o.option_value})`))[0],
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
        progressing={submitRemoveProcessing}
      />,
      ignoreRowClick: true,
    }
  ];

  return (
    <>
      <AppLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Add new requisition.
          </h2>
        }
      >
        <Head>
          <title>Add new requisition</title>
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
            <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full space-y-4`}>
              <div className={`shadow-md w-full shadow-amber-500`}>
                <DataTable
                  columns={tableColumns}
                  data={requisitionData}
                />
              </div>
              <Formik
                initialValues={initValues}
                onSubmit={addItems}
                validationSchema={validationSchema}
                innerRef={formikForm}
              >
                {
                  ({handleSubmit, handleChange, handleBlur,setFieldValue, values, errors, isSubmitting, setErrors}) => (
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
                            <Select2ComponentAjax
                              name='product_id'
                              id='product_id'
                              ref={selectRef}
                              onChange={(e) => {
                                handleChange(e)
                                setSelectedProductId(e.target.value);
                              }}
                              className={`w-full border-1 border-gray-300`}
                              ajax={ {
                                url: process.env.NEXT_PUBLIC_BACKEND_API_URL+ `product-select`,
                                data: function (params) {
                                  var query = {
                                    search: params.term,
                                    page: params.page || 1
                                  }
                                  // Query parameters will be ?search=[term]&type=public
                                  return query;
                                },
                                processResults: function (data, params) {
                                  params.page = params.page || 1;
                                  setProducts(data.data);
                                  return {
                                    results: data.data.map((d)=> {
                                      return {text: d.title, id: d.id, unit: d.unit}
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
                              value={products.filter(p => p.id == values.product_id)[0]?.unit}
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
                              value={values.product_option_id}
                              onChange={(e) => {
                                handleChange(e)
                                setSelectedProductOptionId(e.target.value);
                                setFieldValue('available_quantity', products.filter(p => p.id == values.product_id)[0]?.product_options?.filter((o) => o.id == e.target.value)[0]?.stock ?? 0);
                                setFieldValue('last_purchase_date', moment(products.filter(p => p.id == values.product_id)[0]?.last_purchase?.created_at)?.format('Y-M-DD') ?? null);
                                console.log(products.filter(p => p.id == values.product_id)[0])
                              }}
                              onBlur={handleChange}
                              id='product_option_id'
                              name="product_option_id"
                            >
                              <option value=""></option>
                              {
                                products.length ? products.filter(p => p.id == values.product_id)[0]?.product_options?.map((o) => <option key={o.id} value={o.id}>{o?.option?.name} ({o?.option_value})</option>) : ''
                              }
                            </Select>
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
            </div>
          </Card>
        </div>
      </AppLayout>
    </>
  )
}
export default InitialRequisitionCreate;
