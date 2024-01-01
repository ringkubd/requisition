import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useGetOrganizationQuery } from "@/store/service/organization";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGetBranchByOrganizationQuery } from "@/store/service/branch";
import { useEditDepartmentQuery, useUpdateDepartmentMutation } from "@/store/service/deparment";
import { useGetUsersQuery } from "@/store/service/user/management";
import Select from "react-select";

const Edit = (props) => {
  const router = useRouter();
  const [updateDepartment, updateResult] = useUpdateDepartmentMutation();
  const { data, isLoading, isError } = useEditDepartmentQuery(router.query.id, {
    skip: !router.query.id
  })
  const [selectedOrganization, setSelectedOrganization] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(false);
  const organizations = useGetOrganizationQuery();
  const { data: branches, isLoading: branchISLoading } = useGetBranchByOrganizationQuery(selectedOrganization, {
      skip: !selectedOrganization,
  })
  const {data: employees, isLoading: employeeIsLoading, isError: employeeIsError} = useGetUsersQuery({branch_id: selectedBranch}, {
    skip: !selectedBranch
  });
  let formikForm = useRef();

  useEffect(() => {
    if (!isError && !isLoading && data){
      setSelectedOrganization(data?.data?.organization_id);
      setSelectedBranch(data?.data?.branch_id)
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
      toast.success('Department stored successfully.')
      router.push('/department')
    }
  }, [updateResult]);
  const submit = (values, pageProps) => {
      // console.log(values);
    updateDepartment(values)
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
            Update department.
          </h2>
        }
      >
        <Head>
          <title>Update department</title>
        </Head>
        <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="min-h-screen">
            <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
              <NavLink
                active={router.pathname === 'department'}
                href={`/department`}
              >
                <Button>Back</Button>
              </NavLink>
            </div>
            <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
              {
                !isLoading && !isError && data && (
                  <Formik
                    initialValues={data?.data}
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
                                  htmlFor="organization_id"
                                  value="Organization"
                                />
                              </div>
                              <Select
                                id="organization_id"
                                onChange={(newValue) => {
                                  setFieldValue('organization_id', newValue.value);
                                  setSelectedOrganization(newValue.value)
                                }}
                                value={organizations?.data?.filter(o => o.id === values.organization_id).map((o) => ({label: o.name, value: o.id}))}
                                className={`select`}
                                classNames={{
                                  control: state => 'select'
                                }}
                                onBlur={handleBlur}
                                required
                                options={organizations?.data?.map((o) => ({label: o.name, value: o.id}))}
                              />
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
                                className={`select`}
                                classNames={{
                                  control: state => 'select'
                                }}
                                id="branch_id"
                                value={branches?.data?.filter(o => o.id === values.branch_id).map((o) => ({label: o.name, value: o.id}))}
                                onChange={(newValue) => {
                                  setFieldValue('branch_id', newValue.value)
                                  setSelectedBranch(newValue.value);
                                }}
                                onBlur={handleBlur}
                                required
                                options={branches?.data?.map((o) => ({label: o.name, value: o.id}))}
                              />
                              <ErrorMessage
                                name='branch_id'
                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                            </div>
                          </div>
                          <div className="flex flex-row gap-4">
                            <div className="w-full">
                              <div className="mb-2 block">
                                <Label
                                  htmlFor="head_of_department"
                                  value="Head of Department"
                                />
                              </div>
                              <Select
                                id="head_of_department"
                                className={`select`}
                                classNames={{
                                  control: state => 'select'
                                }}
                                onChange={(newValue) => {
                                  setFieldValue('head_of_department', newValue.value);
                                }}
                                onBlur={handleBlur}
                                required
                                options={employees?.data?.map((o) => ({label: o.name, value: o.id}))}
                                value={employees?.data?.filter(o => o.id === values.head_of_department).map((o) => ({label: o.name, value: o.id}))}

                              />
                              <ErrorMessage
                                name='organization_id'
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
