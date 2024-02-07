import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Actions from "@/components/actions";
import DataTable from "react-data-table-component";
import {
  useGetCashProductQuery,
  useGetSingleCashRequisitionQuery,
  useUpdateCashRequisitionMutation
} from "@/store/service/cash/Index";
import CreatableSelect from "react-select/creatable";
import { useGetUnitsQuery } from "@/store/service/units";

const Edit = (props) => {
  const router = useRouter();
  const [updateCashRequisition, updateResult] = useUpdateCashRequisitionMutation();
  const { data, isLoading, isError } = useGetSingleCashRequisitionQuery(router.query.id, {
    skip: !router.query.id
  })
  const {data: cashProducts, isLoading: cashProductIsLoading, isError: cashProductIsError} = useGetCashProductQuery()
  const {data: units, isLoading: unitsISLoading, isError: unitsISError} = useGetUnitsQuery();

  const selectRef = useRef();

  const [requisitionData, setRequisitionData] = useState([]);
  const [submitRemoveProcessing, setSubmitRemoveProcessing] = useState(false);
  const purposRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isError && data){
      const obj = JSON.parse(JSON.stringify(data?.data?.items));
      const abcObj = obj?.map(rp => {
        rp['cost'] = parseFloat(rp?.unit_price) * parseFloat(rp.required_unit)
        return rp;
      });
      setRequisitionData(abcObj);
    }
  }, [isLoading, data]);

  let formikForm = useRef();

  const initValues = {
    item: '',
    unit: '',
    required_unit: '',
    unit_price: '',
    purpose: '',
    cost: 0,
  }
  useEffect(() => {
    if (updateResult.isError){
      // formikForm.current.setErrors(updateResult.error.data.errors)
      console.log(updateResult)
    }
    if (updateResult.isError || updateResult.isSuccess){
      formikForm.current.setSubmitting(false)
    }
    if (!updateResult.isLoading && updateResult.isSuccess){
      toast.success('Product Options stored successfully.')
      router.push('/cash-requisition')
    }
  }, [updateResult]);
  const submit = () => {
    if (requisitionData.length){
      const { id, ...patch } = { id: data.data.id, ...requisitionData }
      updateCashRequisition({id: data.data.id, ...requisitionData})
    }else {
      toast.warn("Perhaps you forgot to add the item.");
    }
  }
  const addItems = (values, pageProps) => {
    values.cost = parseFloat(values.required_unit) * parseFloat(values.unit_price);
    setRequisitionData([...requisitionData, values])
    pageProps.setSubmitting(false);
    pageProps.resetForm();
    selectRef.current.resetSelect();
  }

  const updateItems = (values) => {
    const updated = requisitionData.map((rd) => {
      if (rd.id == values.id){
        return {
          unit: values.unit,
          unit_price: values?.unit_price,
          required_unit: values.required_unit,
          purpose: values.purpose,
          cost: 0,
          item: values.item
        }

      }
      return rd;
    })
    // setRequisitionData(updated);
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
  }

  const validationSchema = Yup.object().shape({
    purpose: Yup.string().required().label('Purpose'),
    item: Yup.string().required().label('Item'),
    unit: Yup.string().required().label('Unit'),
    required_unit: Yup.string().required().label('Required Quantity'),
    unit_price: Yup.string().required().label('Price'),
  })
  const removeItem = (item) => {
    setSubmitRemoveProcessing(true)
    setRequisitionData(requisitionData.filter(r => item.item !== r.item));
    setSubmitRemoveProcessing(false);
  }
//products.filter(p => p.id == row.product_id)[0]?.product_options?.filter(o => o.id == row.product_option_id).map(o => (o.option.name + `(${o.option_value})`))[0] ?? `${row?.product_option?.option_name}(${ row?.product_option?.option_value})`,
  const tableColumns = [
    {
      name: 'Item',
      selector: row => row.item,
      sortable: true,
    },
    {
      name: 'Unit Price',
      selector: row => row.unit_price,
      sortable: true,
    },
    {
      name: 'Required Quantity',
      selector: row => row.required_unit,
      sortable: true,
    },
    {
      name: 'Cost',
      selector: row => row.required_unit * row.unit_price ,
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


  return (
    <>
      <AppLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Update Cash Requisition.
          </h2>
        }
      >
        <Head>
          <title>Update Cash Requisition.</title>
        </Head>
        <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="min-h-screen">
            <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
              <NavLink
                active={router.pathname === 'cash-requisition'}
                href={`/cash-requisition`}
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
                                <CreatableSelect
                                  className={'select'}
                                  classNames={{
                                    control: state => 'select'
                                  }}
                                  id="item"
                                  isClearable
                                  isDisabled={cashProductIsError}
                                  isLoading={cashProductIsLoading}
                                  onChange={(newValue) => {
                                    setFieldValue('item', newValue?.value)
                                  }}
                                  onCreateOption={(inputValue) => {
                                    storeCashProduct({
                                      title: inputValue
                                    })
                                  }}
                                  options={cashProducts?.data.map((cp) => ({label: cp.title, value: cp.title}))}
                                  value={{value: values.item, label: values.item}}
                                />
                                <ErrorMessage
                                  name='item'
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
                                <CreatableSelect
                                  className={'select'}
                                  classNames={{
                                    control: state => 'select'
                                  }}
                                  id="unit"
                                  isClearable
                                  isDisabled={unitsISError}
                                  isLoading={unitsISLoading}
                                  onChange={(newValue) => {
                                    setFieldValue('unit', newValue.value)
                                  }}
                                  onCreateOption={(inputValue) => {
                                    storeUnit({
                                      unit_code: inputValue,
                                      unit_name: inputValue,
                                    })
                                  }}
                                  options={units?.data.map((cp) => ({label: cp.unit_name, value: cp.unit_name}))}
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
                                    htmlFor="required_unit"
                                    value="Required Quantity"
                                  />
                                </div>
                                <TextInput
                                  value={values.required_unit}
                                  id='required_unit'
                                  name='required_unit'
                                  type={`text`}
                                  required
                                  onChange={(e) => {
                                    handleChange(e);
                                  }}
                                />
                                <ErrorMessage
                                  name='required_unit'
                                  render={(msg) => <span className='text-red-500'>{msg}</span>} />
                              </div>
                            </div>
                            <div className="flex flex-row  w-full lg:w-1/2 gap-4">
                              <div className="w-full">
                                <div className="mb-2 block">
                                  <Label
                                    htmlFor="unit_price"
                                    value="Price"
                                  />
                                </div>
                                <TextInput
                                  value={values.unit_price }
                                  id='unit_price'
                                  name='unit_price'
                                  onChange={handleChange}
                                />
                                <ErrorMessage
                                  name='unit_price'
                                  render={(msg) => <span className='text-red-500'>{msg}</span>} />
                              </div>
                            </div>
                            <div className="flex flex-row w-full gap-4 relative">
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
                                        ref={purposRef}
                                        value={values.purpose}
                                        onChange={(e) => {
                                          handleChange(e)
                                        }}
                                        autoComplete={`off`}
                                      />
                                    </div>
                                  </div>
                                </div>
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
