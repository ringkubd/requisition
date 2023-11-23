import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Select, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useEditOptionsQuery, useUpdateOptionsMutation } from "@/store/service/options";

const Edit = (props) => {
  const router = useRouter();
  const [updateOption, updateResult] = useUpdateOptionsMutation();
  const { data, isLoading, isError } = useEditOptionsQuery(router.query.id)

  let formikForm = useRef();

  const initValues = {
    name: '',
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
      toast.success('Product Options stored successfully.')
      router.push('/options')
    }
  }, [updateResult]);
  const submit = (values, pageProps) => {
    updateOption(values)
  }
  const validationSchema = Yup.object().shape({
    name: Yup.string().required().label('Name'),
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
                active={router.pathname === 'options'}
                href={`/options`}
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
                      ({handleSubmit, handleChange, handleBlur, values, errors, isSubmitting, setErrors}) => (
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
                                placeholder="Name"
                                type="text"
                                required
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.name}
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
                              color={`success`}>Update</Button>
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
