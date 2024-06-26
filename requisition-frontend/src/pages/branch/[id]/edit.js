import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button, Card, Label, Select, TextInput } from 'flowbite-react'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import { ErrorMessage, Formik } from 'formik'
import * as Yup from 'yup'
import { useGetOrganizationQuery } from '@/store/service/organization'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import {
    useEditBranchQuery,
    useUpdateBranchMutation,
} from '@/store/service/branch'

const Edit = props => {
    const router = useRouter()
    const [updateBranch, updateResult] = useUpdateBranchMutation()
    const { data, isLoading, isError, error } = useEditBranchQuery(
        router.query.id,
        {
            skip: !router.query.id,
        },
    )
    const organizations = useGetOrganizationQuery()
    let formikForm = useRef()

    useEffect(() => {
        if (updateResult.isError) {
            formikForm.current.setErrors(updateResult.error.data.errors)
        }
        if (updateResult.isError || updateResult.isSuccess) {
            formikForm.current.setSubmitting(false)
        }
        if (!updateResult.isLoading && updateResult.isSuccess) {
            toast.success('Branch stored successfully.')
            router.push('/branch')
        }
    }, [updateResult])
    const submit = (values, pageProps) => {
        updateBranch(values)
    }
    const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
    const validationSchema = Yup.object().shape({
        organization_id: Yup.string().required().label('Organization'),
        name: Yup.string().required().label('Branch Name'),
        email: Yup.string().required().email().label('Branch Email'),
        contact_no: Yup.string()
            .matches(phoneRegExp, 'Contact Number is not valid')
            .required('Contact Number is required.'),
        address: Yup.string().nullable(),
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Update branch.
                    </h2>
                }>
                <Head>
                    <title>Update branch</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'branch'}
                                href={`/branch`}>
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            {!isLoading && !isError && data && (
                                <Formik
                                    initialValues={data.data}
                                    onSubmit={submit}
                                    validationSchema={validationSchema}
                                    innerRef={formikForm}>
                                    {({
                                        handleSubmit,
                                        handleChange,
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
                                                            htmlFor="organization_id"
                                                            value="Organization"
                                                        />
                                                    </div>
                                                    <Select
                                                        id="organization_id"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={
                                                            values.organization_id
                                                        }>
                                                        <option value="">
                                                            Select Organization
                                                        </option>
                                                        {!organizations.isLoading &&
                                                            !organizations.isError &&
                                                            organizations.data.map(
                                                                o => (
                                                                    <option
                                                                        key={
                                                                            o.id
                                                                        }
                                                                        value={
                                                                            o.id
                                                                        }>
                                                                        {o.name}
                                                                    </option>
                                                                ),
                                                            )}
                                                    </Select>
                                                    <ErrorMessage
                                                        name="organization_id"
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
                                                            htmlFor="name"
                                                            value="Branch Name"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="name"
                                                        placeholder="IsDB-BISEW"
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
                                                            htmlFor="email"
                                                            value="Branch email"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="email"
                                                        placeholder="abc@isdb-bisew.org"
                                                        type="email"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.email}
                                                    />
                                                    <ErrorMessage
                                                        name="email"
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
                                                        placeholder="01xxxxxxxxx"
                                                        required
                                                        type="text"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={
                                                            values.contact_no
                                                        }
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
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="address"
                                                            value="Address"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="address"
                                                        placeholder="Agaragaon, Dhaka"
                                                        required
                                                        type="text"
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
