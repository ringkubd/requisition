import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Select, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useGetOrganizationQuery } from "@/store/service/organization";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGetBranchByOrganizationQuery } from "@/store/service/branch";
import { useEditDesignationQuery, useUpdateDesignationMutation } from "@/store/service/designation";

const Edit = (props) => {
  const router = useRouter();
  const [updateDesignation, updateResult] = useUpdateDesignationMutation();
  const { data, isLoading, isError } = useEditDesignationQuery(router.query.id)
  const [selectedOrganization, setSelectedOrganization] = useState(false);
  const organizations = useGetOrganizationQuery();
  const branch = useGetBranchByOrganizationQuery(selectedOrganization, {skip: !selectedOrganization});
  let formikForm = useRef();

  useEffect(() => {
    if (!isError && !isLoading && data){
      setSelectedOrganization(data?.data?.organization_id);
    }
  }, [data, isLoading, isError]);
  useEffect(() => {
    if (updateResult.isError){
      formikForm.current.setErrors(updateResult.error.data.errors)
    }
    if (updateResult.isError || updateResult.isSuccess){
      formikForm.current.setSubmitting(false)
    }
    if (!updateResult.isLoading && updateResult.isSuccess){
      toast.success('Designation stored successfully.')
      router.push('/designation')
    }
  }, [updateResult]);
  const submit = (values, pageProps) => {
    updateDesignation(values)
  }
  const validationSchema = Yup.object().shape({
    organization_id: Yup.string().required().label('Organization'),
    branch_id: Yup.string().required().label('Branch'),
    name: Yup.string().required().label('Department Name'),
  })

  return (
    <>
      <AppLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Update designation.
          </h2>
        }
      >
        <Head>
          <title>Update designation</title>
        </Head>
        <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="min-h-screen">
            <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
              <NavLink
                active={router.pathname === 'designation'}
                href={`/designation`}
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
                                  htmlFor="organization_id"
                                  value="Organization"
                                />
                              </div>
                              <Select
                                id="organization_id"
                                onChange={(e) => {
                                  handleChange(e)
                                  setSelectedOrganization(e.target.value)
                                }}
                                onBlur={handleBlur}
                                required
                                value={values.organization_id}
                              >
                                <option value="">Select Organization</option>
                                {
                                  !organizations.isLoading && !organizations.isError && organizations.data.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                  ))
                                }
                              </Select>
                              <ErrorMessage
                                name='organization_id'
                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                            </div>
                          </div>
                          <div className="flex flex-row gap-4">
                            <div className="w-full">
                              <div className="mb-2 block">
                                <Label
                                  htmlFor="branch_id"
                                  value="Branch"
                                />
                              </div>
                              <Select
                                id="branch_id"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                value={values.branch_id}
                              >
                                <option value="">Select Branch</option>
                                {
                                  !branch.isLoading && !branch.isError && branch?.data?.data.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                  ))
                                }
                              </Select>
                              <ErrorMessage
                                name='branch_id'
                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                            </div>
                          </div>
                          <div className="flex flex-row gap-4">
                            <div className="w-full">
                              <div className="mb-2 block">
                                <Label
                                  htmlFor="name"
                                  value="Department Name"
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
                                name='name'
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
