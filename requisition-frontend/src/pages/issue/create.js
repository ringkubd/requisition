import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Select, TextInput } from "flowbite-react";
import NavLink from "@/components/NavLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import Select2ComponentAjax from "@/components/select2/Select2ComponentAjax";
import Select2Component from "@/components/select2/Select2Component";
import { useGetUsersQuery } from "@/store/service/user/management";
import { useStoreIssueMutation } from "@/store/service/issue";
import moment from "moment";
const create = (props) => {
    const router = useRouter();
    const [storeProductIssue, storeResult] = useStoreIssueMutation();
    let formikForm = useRef();
    const selectRef = useRef();
    const purchaseRequisitionSelectRef = useRef();
    const [products, setProducts] = useState([]);
    const [purchaseRequisition, setPurchaseRequisition] = useState([]);
    const [selectedRequisition, setSelectedRequisition] = useState(false);
    const {data: users , isLoading: userIsLoading} = useGetUsersQuery();
    const [selectedProductOptionId, setSelectedProductOptionId] = useState([]);

    useEffect(() => {
        const purchase_requisition_products = purchaseRequisition.filter(p => selectedRequisition == p.id)[0]?.purchase_requisition_products
        if (purchase_requisition_products){
            setProducts(purchase_requisition_products)
        }
    }, [selectedRequisition])
    useEffect(() => {
        if (selectedProductOptionId){
            formikForm.current.setFieldValue('product_id',products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.product_id)
            formikForm.current.setFieldValue('quantity',products.filter((p) => parseInt(p.product_option_id) === parseInt(selectedProductOptionId))[0]?.quantity_to_be_purchase)
        }
    }, [selectedProductOptionId])

    const initValues = {
        product_id: '',
        purchase_requisition_id: '',
        product_option_id: '',
        quantity: '',
        receiver_id: ''
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
        pageProps.setSubmitting(true);
        storeProductIssue(values)
        pageProps.resetForm();
    }

    const validationSchema = Yup.object().shape({
        purchase_requisition_id: Yup.number().required().label('Requisition'),
        product_option_id: Yup.number().required().label('Product Variant'),
        quantity: Yup.number().required().label('Quantity'),
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
                                                            htmlFor="purchase_requisition_id"
                                                            value="Requisition"
                                                        />
                                                    </div>
                                                    <Select2ComponentAjax
                                                        name='purchase_requisition_id'
                                                        id='purchase_requisition_id'
                                                        ref={purchaseRequisitionSelectRef}
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                            setSelectedRequisition(e.target.value)
                                                        }}
                                                        className={`w-full border-1 border-gray-300`}
                                                        ajax={ {
                                                            url: process.env.NEXT_PUBLIC_BACKEND_API_URL+ `purchase-requisition-select`,
                                                            data: function (params) {
                                                                return {
                                                                    search: params.term,
                                                                    page: params.page || 1
                                                                }
                                                            },
                                                            processResults: function (data, params) {
                                                                params.page = params.page || 1;
                                                                setPurchaseRequisition(data.data);
                                                                return {
                                                                    results: data.data.map((d)=> {
                                                                        return {text: d.irf_no + " (" + moment(d.created_at).format('DD-MMM-Y@H:mm')+")", id: d.id, options: d.options}
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
                                                        name='name'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>  {/*Requisition*/}
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
                                                        name="product_option_id"
                                                        id="product_option_id"
                                                        options={products?.map((p) => ({value: p.product_option_id, label: p.title+ " - "+p.product_option.title}))}
                                                        ref={selectRef}
                                                        onChange={(e, s) => {
                                                            handleChange(e);
                                                            setSelectedProductOptionId(e.target.value)
                                                        }}
                                                        className={`w-full border-1 border-gray-300`}
                                                        data-placeholder="Select options..."
                                                    />

                                                    <ErrorMessage
                                                        name='product_option_id'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div> {/*Product*/}
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
                                                        name='qty'
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
