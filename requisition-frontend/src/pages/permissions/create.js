import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useStorePermissionsMutation } from "@/store/service/permissions";

const create = (props) => {
    const router = useRouter();
    const [storeRole, storeResult] = useStorePermissionsMutation();
    let formikForm = useRef();

    const initValues = {
        name: '',
        guard_name: 'web',
        module: '',
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Permission stored successfully.')
            router.push('/permissions')
        }
    }, [storeResult]);
    const submit = (values, pageProps) => {
        storeRole(values)
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required().label('Role Name'),
        guard_name: Yup.string().label('Guard Name'),
        module: Yup.string().label('Module Name'),
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add new permission.
                    </h2>
                }
            >
                <Head>
                    <title>Add new permission</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'permissions'}
                                href={`/permissions`}
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
                                                      type="text"
                                                      required
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='name'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="module"
                                                            value="Module Name"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="module"
                                                        name="module"
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.module}
                                                    />
                                                    <ErrorMessage
                                                        name='module'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                          htmlFor="guard_name"
                                                          value="Guard Name"
                                                        />
                                                    </div>
                                                    <TextInput
                                                      id="guard_name"
                                                      name="guard_name"
                                                      type="text"
                                                      required
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.guard_name}
                                                    />
                                                    <ErrorMessage
                                                      name='guard_name'
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
