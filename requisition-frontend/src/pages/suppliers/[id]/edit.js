import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button, Card, Label, TextInput } from 'flowbite-react'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import { ErrorMessage, Formik } from 'formik'
import * as Yup from 'yup'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import {
    useEditSuppliersQuery,
    useUpdateSuppliersMutation,
} from '@/store/service/suppliers'

const Edit = props => {
    const router = useRouter()
    const [updateDepartment, updateResult] = useUpdateSuppliersMutation()
    const { data: supplier, isLoading, isError } = useEditSuppliersQuery(
        router.query.id,
        {
            skip: !router.query.id,
        },
    )
    let formikForm = useRef()
    useEffect(() => {
        if (updateResult.isError) {
            formikForm.current.setErrors(updateResult.error.data.errors)
        }
        if (updateResult.isError || updateResult.isSuccess) {
            formikForm.current.setSubmitting(false)
        }
        if (!updateResult.isLoading && updateResult.isSuccess) {
            toast.success('Department stored successfully.')
            router.push('/suppliers')
        }
    }, [updateResult])
    const submit = (values, pageProps) => {
        updateDepartment(values)
    }
    const validationSchema = Yup.object().shape({
        contact: Yup.string().label('Contact'),
        address: Yup.string().label('Address'),
        name: Yup.string().required().label('Supplier Name'),
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Update suppliers.
                    </h2>
                }>
                <Head>
                    <title>Update suppliers</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'suppliers'}
                                href={`/suppliers`}>
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            {!isLoading && !isError && (
                                <Formik
                                    initialValues={supplier?.data}
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
                                                            value="Suppliers Name"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="name"
                                                        placeholder="Pran"
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.name}
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
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="contact"
                                                            value="Contact Address"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="contact"
                                                        placeholder="+8801700000000"
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.contact}
                                                    />
                                                    <ErrorMessage
                                                        name="contact"
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
                                                    <TextInput
                                                        id="address"
                                                        placeholder="Dhaka"
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.address}
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
                            )}
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default Edit
