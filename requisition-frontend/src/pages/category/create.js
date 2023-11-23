import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useGetCategoryQuery, useStoreCategoryMutation } from "@/store/service/category";
import Select2Component from "@/components/select2/Select2Component";

const create = (props) => {
    const router = useRouter();
    const [storeCategory, storeResult] = useStoreCategoryMutation();
    const {data: categories, isLoading, isError} = useGetCategoryQuery();
    let formikForm = useRef();
    let selectRef = useRef();

    const initValues = {
        title: '',
        code: '',
        parent_id: '',
        description: '',
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Category stored successfully.')
            router.push('/category')
        }
    }, [storeResult]);
    const submit = (values, pageProps) => {
        storeCategory(values)
    }

    const validationSchema = Yup.object().shape({
        title: Yup.string().required().label('Title'),
        code: Yup.string().label('Category Code'),
        description: Yup.string().nullable()
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add new category.
                    </h2>
                }
            >
                <Head>
                    <title>Add new category</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'category'}
                                href={`/category`}
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
                                                            htmlFor="title"
                                                            value="Title"
                                                        />
                                                    </div>
                                                    <TextInput
                                                      id="title"
                                                      placeholder="Detergent"
                                                      type="text"
                                                      required
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='title'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                          htmlFor="code"
                                                          value="Code"
                                                        />
                                                    </div>
                                                    <TextInput
                                                      id="code"
                                                      name="code"
                                                      placeholder="Category ShortCode Like Ci/HW"
                                                      type="text"
                                                      required
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                      name='code'
                                                      render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="parent_id"
                                                            value="Parent Category"
                                                        />
                                                    </div>
                                                    <Select2Component
                                                        name="parent_id"
                                                        id="parent_id"
                                                        options={categories?.data?.map((p) => ({value: p.id, label: p.title}))}
                                                        ref={selectRef}
                                                        onChange={(e) => {
                                                            setFieldValue('parent_id', e.target.value)
                                                        }}
                                                        className={`w-full border-1 border-gray-300`}
                                                        data-placeholder="Select parent category..."
                                                    />
                                                    <ErrorMessage
                                                        name='parent_id'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="description"
                                                            value="Description"
                                                        />
                                                    </div>
                                                    <Textarea
                                                        id="description"
                                                        placeholder="All kind of detergent products."
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='description'
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
