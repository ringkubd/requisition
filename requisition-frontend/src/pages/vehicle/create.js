import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, TextInput } from "flowbite-react";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useStoreVehicleMutation } from "@/store/service/vehicle/VehicleAPI";
import Select from "react-select";
import { useGetCashProductQuery } from "@/store/service/cash/Index";
import CustomRadio from "@/components/radio";

const create = (props) => {
    const router = useRouter();
    const [storeVehicle, storeResult] = useStoreVehicleMutation();
    const {data: cashProducts, isLoading, isError, isSuccess} = useGetCashProductQuery();
    let formikForm = useRef();
    const selectRef = useRef();

    const initValues = {
        brand: '',
        model: '',
        reg_no: '',
        cash_product_id: '',
        ownership: '1',
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Pump stored successfully.')
            router.push('/vehicle')
        }
    }, [storeResult]);
    const submit = (values, pageProps) => {
        storeVehicle(values)
    }

    const validationSchema = Yup.object().shape({
        brand: Yup.string().required().label('Brand'),
        model: Yup.string().required().label('Model'),
        reg_no: Yup.string().required().label('Registration No.'),
        cash_product_id: Yup.number().required().label('Cash Requisition Item'),
        ownership: Yup.boolean().required().label('Ownership'),
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add new vehicle.
                    </h2>
                }
            >
                <Head>
                    <title>Add new vehicle</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <Button onClick={() => router.back()}>Back</Button>
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
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="brand"
                                                            value="Brand"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="brand"
                                                        placeholder="Brand name of vehicle."
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='brand'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="model"
                                                            value="Model"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="model"
                                                        name="model"
                                                        placeholder="Model of vehicle."
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='model'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="reg_no"
                                                            value="Registration No."
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="reg_no"
                                                        placeholder="Vehicle Registration Number"
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='reg_no'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="cash_product_id"
                                                            value="Related Item"
                                                        />
                                                    </div>
                                                    <Select
                                                        name="cash_product_id"
                                                        id="cash_product_id"
                                                        options={cashProducts?.data?.map((p) => ({
                                                            value: p.id,
                                                            label: p.title
                                                        }))}
                                                        ref={selectRef}
                                                        onChange={(newValue) => {
                                                            setFieldValue('cash_product_id', newValue?.value)
                                                        }}
                                                        className={`select`}
                                                        classNames={{
                                                            control: state => `select`
                                                        }}
                                                        data-placeholder="Select related item..."
                                                    />
                                                    <ErrorMessage
                                                        name='cash_product_id'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <CustomRadio
                                                        id={`ownership`}
                                                        name={`ownership`}
                                                        value={values.ownership}
                                                        onChange={handleChange}
                                                        label={`Ownership`}
                                                        data={[
                                                            {
                                                                label: 'Owned',
                                                                value: 0,
                                                                id: 'owned'
                                                            },
                                                            {
                                                                label: 'Rental',
                                                                value: 1,
                                                                id: 'rental'
                                                            }
                                                        ]}
                                                    />
                                                    {/*<TextInput*/}
                                                    {/*    id="model"*/}
                                                    {/*    name="model"*/}
                                                    {/*    placeholder="Model of vehicle."*/}
                                                    {/*    type="text"*/}
                                                    {/*    required*/}
                                                    {/*    onChange={handleChange}*/}
                                                    {/*    onBlur={handleBlur}*/}
                                                    {/*/>*/}
                                                    <ErrorMessage
                                                        name='ownership'
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
