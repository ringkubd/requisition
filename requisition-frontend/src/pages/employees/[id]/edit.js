import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from 'yup';
import { useGetOrganizationQuery } from "@/store/service/organization";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGetBranchByOrganizationQuery } from "@/store/service/branch";
import { useEditUserQuery, useUpdateUserMutation } from "@/store/service/user/management";
import { useGetDepartmentByOrganizationBranchQuery } from "@/store/service/deparment";
import { useGetDesignationByOrganizationBranchQuery } from "@/store/service/designation";
import { useGetRolesQuery } from "@/store/service/roles";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();
const Edit = (props) => {
    const router = useRouter();
    const [updateUser, updateResult] = useUpdateUserMutation();
    const { data, isLoading, isError } = useEditUserQuery(router.query.id, {
        skip: !router.query.id
    })
    const [selectedOrganization, setSelectedOrganization] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(false);
    const organizations = useGetOrganizationQuery();
    const branch = useGetBranchByOrganizationQuery(selectedOrganization, {skip: !selectedOrganization});
    const department = useGetDepartmentByOrganizationBranchQuery({
        organization_id: selectedOrganization,
        branch_id: selectedBranch
    }, {skip: !selectedOrganization || !selectedBranch});
    const {data: roles, isLoading: rolesLoading, isError: rolesError} = useGetRolesQuery();

    const designation = useGetDesignationByOrganizationBranchQuery({
        organization_id: selectedOrganization,
        branch_id: selectedBranch
    }, {skip: !selectedOrganization || !selectedBranch});

    let formikForm = useRef();

    useEffect(() => {
        if (!isError && !isLoading && data){
            setSelectedOrganization(data?.data?.organization_id);
            setSelectedBranch(data?.data?.branch_id);
        }
    }, [data, isLoading, isError]);

    useEffect(() => {
        if (!branch.isLoading && !branch.isError && branch.data){
            // branch.refetch()
        }
    }, [selectedOrganization]);

    useEffect(() => {
        if (updateResult.isError){
            formikForm.current.setErrors(updateResult.error.data.errors)
        }
        if (!updateResult.isLoading && updateResult.isSuccess){
            toast.success('Employee stored successfully.')
            router.push('/employees')
        }
    }, [updateResult]);

    const submit = (values, pageProps) => {
        updateUser(values)
        pageProps.resetForm();
        // console.log(values)
    }
    const validationSchema = Yup.object().shape({
        organization_id: Yup.array().required().label('Organization'),
        branch_id: Yup.array().required().label('Branch'),
        email: Yup.string().email().required().label('Email'),
        name: Yup.string().required().label('Name'),
        password: Yup.string().label('Password'),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .when('password', {
                is: (password, schema) => password,
                then: (schema) => schema.required().oneOf([Yup.ref('password'), null], 'Passwords must match')
            })
            .label('Confirm Password')
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Update User.
                    </h2>
                }
            >
                <Head>
                    <title>Update User</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'employees'}
                                href={`/employees`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            {
                                !isLoading && !isError && data && (
                                    <Formik
                                        initialValues={{...data.data, 'confirm_password': ''}}
                                        onSubmit={submit}
                                        validationSchema={validationSchema}
                                        innerRef={formikForm}
                                        enableReinitialize
                                    >
                                        {
                                            ({handleSubmit, handleChange, handleBlur, setFieldValue, values, errors, isSubmitting, setErrors}) => (
                                                <Form
                                                    className="flex flex-col gap-4 md:w-1/2 w-full"
                                                    onChange={(e) => console}
                                                >
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
                                                                name='name'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
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
                                                                name='email'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
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
                                                                name='password'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
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
                                                                value={values.confirm_password}
                                                            />
                                                            <ErrorMessage
                                                                name='confirm_password'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="w-full">
                                                            <div className="mb-2 block">
                                                                <Label
                                                                    htmlFor="organization_id"
                                                                    value="Organization"
                                                                />
                                                            </div>
                                                            <Select
                                                                className={`select`}
                                                                classNames={{
                                                                    control: (state) => 'select'
                                                                }}
                                                                id="organization_id"
                                                                name="organization_id"
                                                                closeMenuOnSelect={false}
                                                                components={animatedComponents}
                                                                value={organizations?.data?.filter((r) => {
                                                                    return values.organization_id.filter(v => v === r.id).length;
                                                                }).map((o) => ({value: o.id, label: o.name?.toUpperCase()}))}
                                                                isMulti
                                                                options={organizations?.data?.map((o) => ({value: o.id, label: o.name?.toUpperCase()}))}
                                                                onChange={(newValue, actionMeta) => {
                                                                    setFieldValue('organization_id',newValue.map((v) => v.value));
                                                                    setSelectedOrganization(newValue.map((v) => v.value));
                                                                }}
                                                                menuPlacement={`bottom`}
                                                                onBlur={handleBlur}
                                                                menuShouldScrollIntoView={true}
                                                            />
                                                            <ErrorMessage
                                                                name='organization_id'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                        </div>
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
                                                                    control: (state) => 'select'
                                                                }}
                                                                id="branch_id"
                                                                name="branch_id"
                                                                closeMenuOnSelect={false}
                                                                components={animatedComponents}
                                                                value={branch?.data?.data?.filter((r) => {
                                                                    return values.branch_id.filter(v => v === r.id).length;
                                                                }).map((o) => ({value: o.id, label: o.name?.toUpperCase()}))}
                                                                isMulti
                                                                options={branch?.data?.data.map((o) => ({value: o.id, label: o.name}))}
                                                                onChange={(newValue, actionMeta) => {
                                                                    setFieldValue('branch_id',newValue.map((v) => v.value))
                                                                }}
                                                                menuPlacement={`bottom`}
                                                                onBlur={handleBlur}
                                                                menuShouldScrollIntoView={true}
                                                            />
                                                            <ErrorMessage
                                                                name='branch_id'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="w-full">
                                                            <div className="mb-2 block">
                                                                <Label
                                                                    htmlFor="department_id"
                                                                    value="Department"
                                                                />
                                                            </div>
                                                            <Select
                                                                className={`select`}
                                                                classNames={{
                                                                    control: (state) => 'select'
                                                                }}
                                                                id="department_id"
                                                                name="department_id"
                                                                closeMenuOnSelect={false}
                                                                components={animatedComponents}
                                                                value={department?.data?.data?.filter((r) => {
                                                                    return values.department_id.filter(v => v === r.id).length;
                                                                }).map((o) => ({value: o.id, label: o.name?.toUpperCase()}))}
                                                                isMulti
                                                                options={department?.data?.data.map((o) => ({value: o.id, label: o.name}))}
                                                                onChange={(newValue, actionMeta) => {
                                                                    setFieldValue('department_id',newValue.map((v) => v.value))
                                                                }}
                                                                menuPlacement={`bottom`}
                                                                onBlur={handleBlur}
                                                                menuShouldScrollIntoView={true}
                                                            />
                                                            <ErrorMessage
                                                                name='department_id'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                        </div>
                                                        <div className="w-full">
                                                            <div className="mb-2 block">
                                                                <Label
                                                                    htmlFor="designation_id"
                                                                    value="Designation"
                                                                />
                                                            </div>
                                                            <Select
                                                                className={`select`}
                                                                classNames={{
                                                                    control: (state) => 'select'
                                                                }}
                                                                id="designation_id"
                                                                name="designation_id"
                                                                closeMenuOnSelect={false}
                                                                components={animatedComponents}
                                                                isMulti
                                                                options={designation?.data?.data.map((o) => ({value: o.id, label: o.name}))}
                                                                onChange={(newValue, actionMeta) => {
                                                                    setFieldValue('designation_id',newValue.map((v) => v.value));
                                                                }}
                                                                value={designation?.data?.data?.filter((r) => {
                                                                    return values.designation_id.filter(v => v === r.id).length;
                                                                }).map((o) => ({value: o.id, label: o.name?.toUpperCase()}))}
                                                                menuPlacement={`bottom`}
                                                                onBlur={handleBlur}
                                                                menuShouldScrollIntoView={true}
                                                            />
                                                            <ErrorMessage
                                                                name='designation_id'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="w-full">
                                                            <div className="mb-2 block">
                                                                <Label
                                                                    htmlFor="roles"
                                                                    value="Roles"
                                                                />
                                                            </div>
                                                            <Select
                                                                className={`select`}
                                                                classNames={{
                                                                    control: (state) => 'select'
                                                                }}
                                                                id="roles"
                                                                name="roles"
                                                                closeMenuOnSelect={false}
                                                                components={animatedComponents}
                                                                value={roles?.data?.filter((r) => {
                                                                    return values.roles.filter(v => v === r.id).length;
                                                                }).map((o) => ({value: o.id, label: o.name?.toUpperCase()}))}
                                                                isMulti
                                                                options={roles?.data?.map((o) => ({value: o.id, label: o.name?.toUpperCase()}))}
                                                                onChange={(newValue, actionMeta) => {
                                                                    setFieldValue('roles',newValue.map((v) => v.value));
                                                                }}
                                                                menuPlacement={`bottom`}
                                                                onBlur={handleBlur}
                                                                menuShouldScrollIntoView={true}
                                                            />
                                                            <ErrorMessage
                                                                name='roles'
                                                                render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-4 justify-end">
                                                        <Button
                                                            isProcessing={updateResult.isLoading}
                                                            onClick={handleSubmit}
                                                            type='submit'
                                                            color={`success`}>Submit</Button>
                                                    </div>
                                                </Form>
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
