import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Select, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/NavLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useEditCategoryQuery, useGetCategoryQuery, useUpdateCategoryMutation } from "@/store/service/category";
import Select2Component from "@/components/select2/Select2Component";

const Edit = (props) => {
    const router = useRouter();
    const [updateCategory, updateResult] = useUpdateCategoryMutation();
    const { data, isLoading, isError } = useEditCategoryQuery(router.query.id)
    const {data: categories, isLoading:categoryLoading, isError:categoryError} = useGetCategoryQuery();

    let formikForm = useRef();
    let selectRef = useRef();

    const initValues = {
        title: '',
        parent_id: '',
        description: '',
    }
    useEffect(() => {
        if (updateResult.isError){
            formikForm.current.setErrors(updateResult.error.data.errors)
        }
        if (updateResult.isError || updateResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!updateResult.isLoading && updateResult.isSuccess){
            toast.success('Category stored successfully.')
            router.push('/category')
        }
    }, [updateResult]);
    const submit = (values, pageProps) => {
        updateCategory(values)
    }
    const validationSchema = Yup.object().shape({
        title: Yup.string().required().label('Title'),
        description: Yup.string().required().label('Description')
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Update category.
                    </h2>
                }
            >
                <Head>
                    <title>Update category</title>
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
                            {
                                !isLoading && !isError && (
                                    <Formik
                                        initialValues={data.data}
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
                                                                placeholder="Category"
                                                                type="text"
                                                                required
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.title}
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
                                                              value={values.code}
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
                                                                options={categories?.data?.filter((c) => parseInt(c.id) !== parseInt(router.query.id))?.map((p) => ({value: p.id, label: p.title}))}
                                                                ref={selectRef}
                                                                value={values.parent_id}
                                                                onChange={(e, s) => {
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
                                                                required
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.description}
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
                                )
                            }
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default Edit;
