import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button, Card, Label, Textarea, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import { ErrorMessage, Formik } from 'formik'
import * as Yup from 'yup'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import {
    useSingleVehicleQuery,
    useUpdateVehicleMutation,
} from '@/store/service/vehicle/VehicleAPI'
import { useGetCashProductQuery } from '@/store/service/cash/Index'
import Select from 'react-select'
import CustomRadio from '@/components/radio'

const Edit = props => {
    const router = useRouter()
    const selectRef = useRef()
    const [updateVehicle, updateResult] = useUpdateVehicleMutation()
    const { data, isLoading, isError } = useSingleVehicleQuery(
        router.query.id,
        {
            skip: !router.query.id,
        },
    )
    const {
        data: cashProducts,
        isLoading: chasProductsISLoading,
        isError: cashProductsISError,
    } = useGetCashProductQuery()

    let formikForm = useRef()

    const initValues = {
        brand: '',
        model: '',
        reg_no: '',
        cash_product_id: '',
        ownership: '1',
    }
    useEffect(() => {
        if (updateResult.isError) {
            formikForm.current.setErrors(updateResult.error.data.errors)
        }
        if (updateResult.isError || updateResult.isSuccess) {
            formikForm.current.setSubmitting(false)
        }
        if (!updateResult.isLoading && updateResult.isSuccess) {
            toast.success('Category stored successfully.')
            router.push('/vehicle')
        }
    }, [updateResult])
    const submit = (values, pageProps) => {
        updateVehicle(values)
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
                        Update vehicle.
                    </h2>
                }>
                <Head>
                    <title>Update vehicle</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <Button onClick={() => router.back()}>Back</Button>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            {!isLoading && !isError && data && (
                                <Formik
                                    initialValues={data?.data}
                                    onSubmit={submit}
                                    validationSchema={validationSchema}
                                    innerRef={formikForm}>
                                    {({
                                        handleSubmit,
                                        handleChange,
                                        setFieldValue,
                                        handleBlur,
                                        values,
                                        errors,
                                        isSubmitting,
                                        setErrors,
                                    }) => (
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
                                                        value={values.brand}
                                                    />
                                                    <ErrorMessage
                                                        name="brand"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
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
                                                        value={values.model}
                                                    />
                                                    <ErrorMessage
                                                        name="model"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
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
                                                        value={values.reg_no}
                                                    />
                                                    <ErrorMessage
                                                        name="reg_no"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
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
                                                        options={cashProducts?.data?.map(
                                                            p => ({
                                                                value: p.id,
                                                                label: p.title,
                                                            }),
                                                        )}
                                                        ref={selectRef}
                                                        onChange={newValue => {
                                                            setFieldValue(
                                                                'cash_product_id',
                                                                newValue?.value,
                                                            )
                                                        }}
                                                        className={`select`}
                                                        classNames={{
                                                            control: state =>
                                                                `select`,
                                                        }}
                                                        data-placeholder="Select related item..."
                                                        value={
                                                            cashProducts?.data
                                                                ?.filter(
                                                                    (
                                                                        cp,
                                                                        index,
                                                                    ) =>
                                                                        cp.id ==
                                                                        values.cash_product_id,
                                                                )
                                                                ?.map(p => ({
                                                                    value: p.id,
                                                                    label:
                                                                        p.title,
                                                                }))[0]
                                                        }
                                                    />
                                                    <ErrorMessage
                                                        name="cash_product_id"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
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
                                                                id: 'owned',
                                                            },
                                                            {
                                                                label: 'Rental',
                                                                value: 1,
                                                                id: 'rental',
                                                            },
                                                        ]}
                                                    />
                                                    <ErrorMessage
                                                        name="ownership"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4 justify-end">
                                                <Button
                                                    isProcessing={isSubmitting}
                                                    onClick={handleSubmit}
                                                    type="submit"
                                                    color={`success`}>
                                                    Submit
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Formik>
                            )}
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default Edit
