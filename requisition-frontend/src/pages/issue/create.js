import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import Select2Component from "@/components/select2/Select2Component";
import { useGetUsersQuery } from "@/store/service/user/management";
import { useStoreIssueMutation } from "@/store/service/issue";
import { useEditProductQuery, useGetProductQuery } from "@/store/service/product/product";
import moment from "moment";
const create = (props) => {
  const router = useRouter();
  const [storeProductIssue, storeResult] = useStoreIssueMutation();
  let formikForm = useRef();
  const selectRef = useRef();
  const [selectedProduct, setSelectedProduct] = useState(false);
  const {data: users , isLoading: userIsLoading} = useGetUsersQuery();
  const {data: products, isLoading: productLoading, isSuccess: productSuccess, isError: productError} = useGetProductQuery(null,  {
    refetchOnMountOrArgChange: true
  });
  const {data: product, isLoading: productIsLoading, isSuccess: productIsSuccess, isError: productIsError, refetch: refetchQuery} = useEditProductQuery(selectedProduct,{
    skip: !selectedProduct
  });
  const [productOptions, setProductOptions] = useState([]);
  const [stock, setStock] = useState(0);


  useEffect(() => {
    if (product && productSuccess){
      const {data} = product;
      setProductOptions(data.product_options);
    }
    // setProductOptions(product)
  }, [productIsLoading, product, productSuccess]);

  const initValues = {
    product_id: '',
    product_option_id: '',
    quantity: '',
    receiver_id: '',
    purpose: '',
    uses_area: '',
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
      refetchQuery();
      router.push('/issue')
    }
  }, [storeResult]);
  const submit = async (values, pageProps) => {
    pageProps.setSubmitting(true);
    storeProductIssue(values)
    pageProps.resetForm();
  }

  const validationSchema = Yup.object().shape({
    product_option_id: Yup.number().required().label('Product Variant'),
    quantity: Yup.number().when('product_option_id', {
      is: stock,
      then : Yup.number().required().max(stock),
    }).max(stock).label('Quantity'),
    receiver_id: Yup.number().required().label('Receiver'),
  })

  return (
    <>
      <AppLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Issue a product.
          </h2>
        }
      >
        <Head>
          <title> Issue a product.</title>
        </Head>
        <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="min-h-screen">
            <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
              <NavLink
                active={router.pathname === 'issue'}
                href={`/issue`}
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
                              htmlFor="product_id"
                              value="Product"
                            />
                          </div>
                          <Select2Component
                            name="product_id"
                            id="product_id"
                            options={products?.data?.map((p) => ({value: p.id, label: p.title, other: p}))}
                            ref={selectRef}
                            onChange={(e) => {
                              handleChange(e);
                              setSelectedProduct(e.target.value);
                            }}
                            className={`w-full border-1 border-gray-300`}
                            data-placeholder="Select options..."
                          />

                          <ErrorMessage
                            name='product_option_id'
                            render={(msg) => <span className='text-red-500'>{msg}</span>} />
                        </div>

                        <div className="w-full">
                          <div className="mb-2 block">
                            <Label
                              htmlFor="product_option_id"
                              value="Variant"
                            />
                          </div>
                          <Select2Component
                            name="product_option_id"
                            id="product_option_id"
                            options={productOptions?.map((p) => ({value: p.id, label: p.title, other: p}))}
                            onChange={(e, data, optionSelected = {}) => {
                              handleChange(e);
                              const {other} = optionSelected;
                              setStock(other?.stock ?? 0);
                            }}
                            className={`w-full border-1 border-gray-300`}
                            data-placeholder="Select options..."
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
                              htmlFor="quantity"
                              value="Quantity"
                            />
                          </div>
                          <TextInput
                            id="quantity"
                            name="quantity"
                            placeholder="5"
                            type="number"
                            step={0.1}
                            required
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            value={values.quantity}
                          />
                          <ErrorMessage
                            name='quantity'
                            render={(msg) => <span className='text-red-500'>{msg}</span>} />
                        </div>  {/*Quantity*/}
                        <div className="w-full">
                          <div className="mb-2 block">
                            <Label
                              htmlFor="receiver_id"
                              value="Receiver"
                            />
                          </div>
                          <Select2Component
                            value={values.receiver_id}
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            onBlur={handleChange}
                            id='receiver_id'
                            name="receiver_id"
                            className={`w-full border-1 border-gray-300`}
                            data-placeholder="Select options..."
                            options={!userIsLoading && users.data ? users.data.map(u => ({value: u.id, label: u.name})) : []}
                          />
                          <ErrorMessage
                            name='receiver_id'
                            render={(msg) => <span className='text-red-500'>{msg}</span>} />
                        </div>  {/*Variant*/}
                      </div>  {/*Product, variant*/}
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
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            value={values.uses_area}
                          />
                          <ErrorMessage
                            name='uses_area'
                            render={(msg) => <span className='text-red-500'>{msg}</span>} />
                        </div>  {/*uses_area*/}
                      </div>  {/*Quantity, receiver*/}
                      <div className="flex flex-col sm:flex-row gap-4">  {/*Uses Area*/}
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
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            value={values.purpose}
                          />
                          <ErrorMessage
                            name='purpose'
                            render={(msg) => <span className='text-red-500'>{msg}</span>} />
                        </div>  {/*Purpose*/}
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
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            value={values.issue_time}
                          />
                          <ErrorMessage
                            name='date'
                            render={(msg) => <span className='text-red-500'>{msg}</span>} />
                        </div>  {/*Date Time*/}
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
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            value={values.note}
                          />
                          <ErrorMessage
                            name='note'
                            render={(msg) => <span className='text-red-500'>{msg}</span>} />
                        </div>  {/*note*/}
                      </div>  {/*Note*/}
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
