import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button, Card, Label, TextInput } from 'flowbite-react'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import { ErrorMessage, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import {
    useEditUserQuery,
    useUpdateUserMutation,
} from '@/store/service/user/management'
const Edit = props => {
    const router = useRouter()
    const [updateUser, updateResult] = useUpdateUserMutation()
    const { data, isLoading, isError } = useEditUserQuery(router.query.id, {
        skip: !router.query.id,
    })
    let formikForm = useRef()
    useEffect(() => {
        if (updateResult.isError) {
            formikForm.current.setErrors(updateResult.error.data.errors)
        }
        if (!updateResult.isLoading && updateResult.isSuccess) {
            toast.success('Employee stored successfully.')
            router.back()
        }
    }, [updateResult])

    const submit = (values, pageProps) => {
        updateUser(values)
        pageProps.resetForm()
    }
    const validationSchema = Yup.object().shape({
        email: Yup.string().email().required().label('Email'),
        name: Yup.string().required().label('Name'),
        password: Yup.string().label('Password'),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .when('password', {
                is: (password, schema) => password,
                then: schema =>
                    schema
                        .required()
                        .oneOf(
                            [Yup.ref('password'), null],
                            'Passwords must match',
                        ),
            })
            .label('Confirm Password'),
    })

    const initialValues = {
        id: data?.data?.id,
        name: data?.data?.name,
        email: data?.data?.email,
        mobile_no: data?.data?.mobile_no,
        password: '',
        confirm_password: '',
    }

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Update Profile.
                    </h2>
                }>
                <Head>
                    <title>Update Profile</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'employees'}
                                href={`/employees`}>
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            {!isLoading && !isError && data && (
                                <Formik
                                    initialValues={initialValues}
                                    onSubmit={submit}
                                    validationSchema={validationSchema}
                                    innerRef={formikForm}
                                    enableReinitialize>
                                    {({
                                        handleSubmit,
                                        handleChange,
                                        handleBlur,
                                        setFieldValue,
                                        values,
                                        errors,
                                        isSubmitting,
                                        setErrors,
                                    }) => (
                                        <Form
                                            className="flex flex-col gap-4 md:w-1/2 w-full"
                                            onChange={e => console}>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="name"
                                                            value="Name"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="name"
                                                        placeholder="IT"
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
                                                            value="Email"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="email"
                                                        placeholder="abc@abc.abc"
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
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="password"
                                                            value="Password"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="password"
                                                        type="password"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.password}
                                                    />
                                                    <ErrorMessage
                                                        name="password"
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
                                                            htmlFor="confirm_password"
                                                            value="Confirm Password"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="confirm_password"
                                                        type="password"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={
                                                            values.confirm_password
                                                        }
                                                    />
                                                    <ErrorMessage
                                                        name="confirm_password"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="mobile_no"
                                                            value="Mobile"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="mobile_no"
                                                        placeholder="+880170000000"
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.mobile_no}
                                                    />
                                                    <ErrorMessage
                                                        name="mobile_no"
                                                        render={msg => (
                                                            <span className="text-red-500">
                                                                {msg}
                                                            </span>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-4 justify-end">
                                                <Button
                                                    isProcessing={
                                                        updateResult.isLoading
                                                    }
                                                    onClick={handleSubmit}
                                                    type="submit"
                                                    color={`success`}>
                                                    Submit
                                                </Button>
                                            </div>
                                        </Form>
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
