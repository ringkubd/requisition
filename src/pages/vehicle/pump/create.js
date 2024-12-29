import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button, Card, Label, Textarea, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import { ErrorMessage, Formik } from 'formik'
import * as Yup from 'yup'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { useStorePumpMutation } from '@/store/service/vehicle/PumpAPI'

const create = props => {
    const router = useRouter()
    const [storePump, storeResult] = useStorePumpMutation()
    let formikForm = useRef()

    const initValues = {
        name: '',
        contact_no: '',
        address: '',
    }
    useEffect(() => {
        if (storeResult.isError) {
            formikForm.current.setErrors(storeResult.error.data.errors)
        }
        if (storeResult.isError || storeResult.isSuccess) {
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess) {
            toast.success('Pump stored successfully.')
            router.push('/vehicle/pump')
        }
    }, [storeResult])
    const submit = (values, pageProps) => {
        storePump(values)
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required().label('Name'),
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add new pump.
                    </h2>
                }>
                <Head>
                    <title>Add new pump</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <Button onClick={() => router.back()}>Back</Button>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            <Formik
                                initialValues={initValues}
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
                                                        htmlFor="name"
                                                        value="Name"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="name"
                                                    placeholder="Name of fuel pump."
                                                    type="text"
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="name"
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
                                                        htmlFor="contact_no"
                                                        value="Contact No."
                                                    />
                                                </div>
                                                <TextInput
                                                    id="contact_no"
                                                    name="contact_no"
                                                    placeholder="Fuel pump contact number."
                                                    type="text"
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="contact_no"
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
                                                        htmlFor="address"
                                                        value="Address"
                                                    />
                                                </div>
                                                <Textarea
                                                    id="address"
                                                    placeholder="Fuel pump address."
                                                    type="text"
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="address"
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
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default create
