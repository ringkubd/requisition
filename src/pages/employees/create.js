import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button, Card, Label, TextInput } from 'flowbite-react'
import NavLink from '@/components/navLink'
import { useRouter } from 'next/router'
import { ErrorMessage, Formik } from 'formik'
import * as Yup from 'yup'
import { useGetOrganizationQuery } from '@/store/service/organization'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useGetBranchByOrganizationQuery } from '@/store/service/branch'
import { useStoreUserMutation } from '@/store/service/user/management'
import { useGetDepartmentByOrganizationBranchQuery } from '@/store/service/deparment'
import { useGetDesignationByOrganizationBranchQuery } from '@/store/service/designation'
import { useGetRolesQuery } from '@/store/service/roles'

import Select from 'react-select'
import makeAnimated from 'react-select/animated'

const animatedComponents = makeAnimated()
const create = props => {
    const router = useRouter()
    const [storeEmployee, storeResult] = useStoreUserMutation()
    const [selectedOrganization, setSelectedOrganization] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState(false)

    const [
        defaultOrganizationOptions,
        setDefaultOrganizationOptions,
    ] = useState([])
    const [defaultBranchOptions, setDefaultBranchOptions] = useState([])
    const [defaultDepartmentOptions, setDefaultDepartmentOptions] = useState([])

    const organizations = useGetOrganizationQuery()
    const branch = useGetBranchByOrganizationQuery(selectedOrganization, {
        skip: !selectedOrganization,
    })
    const department = useGetDepartmentByOrganizationBranchQuery(
        {
            organization_id: selectedOrganization,
            branch_id: selectedBranch,
        },
        { skip: !selectedOrganization || !selectedBranch },
    )

    const designation = useGetDesignationByOrganizationBranchQuery(
        {
            organization_id: selectedOrganization,
            branch_id: selectedBranch,
        },
        { skip: !selectedOrganization || !selectedBranch },
    )

    const {
        data: roles,
        isLoading: rolesLoading,
        isError: rolesError,
    } = useGetRolesQuery()

    let formikForm = useRef()

    useEffect(() => {
        if (storeResult.isError) {
            formikForm.current.setErrors(storeResult.error.data.errors)
        }
        if (storeResult.isError || storeResult.isSuccess) {
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess) {
            toast.success('Employees stored successfully.')
            router.push('/employees')
        }
    }, [storeResult])
    const submit = (values, pageProps) => {
        storeEmployee(values)
        pageProps.resetForm()
    }

    const initialValues = {
        name: '',
        organization_id: [],
        branch_id: [],
        password: '',
        designation_id: [],
        department_id: [],
        roles: [],
        default_organization_id: '',
        default_branch_id: '',
        default_department_id: '',
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required().label('Name'),
        email: Yup.string().email().required().label('Email'),
        organization_id: Yup.array().required().label('Organization'),
        branch_id: Yup.array().required().label('Branch'),
        password: Yup.string().required().label('Password'),
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

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add new employee.
                    </h2>
                }>
                <Head>
                    <title>Add new employee</title>
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
                                    <div className="flex flex-col gap-4 md:w-1/2 w-full">
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
                                                        htmlFor="organization_id"
                                                        value="Organization"
                                                    />
                                                </div>
                                                <Select
                                                    id="organization_id"
                                                    name="organization_id"
                                                    className={`select`}
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    value={organizations?.data
                                                        ?.filter(r => {
                                                            return values.organization_id.filter(
                                                                v => v === r.id,
                                                            ).length
                                                        })
                                                        .map(o => ({
                                                            value: o.id,
                                                            label: o.name?.toUpperCase(),
                                                        }))}
                                                    isMulti
                                                    options={organizations?.data?.map(
                                                        o => ({
                                                            value: o.id,
                                                            label: o.name?.toUpperCase(),
                                                        }),
                                                    )}
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'organization_id',
                                                            newValue.map(
                                                                v => v.value,
                                                            ),
                                                        )
                                                        setSelectedOrganization(
                                                            newValue.map(
                                                                v => v.value,
                                                            ),
                                                        )
                                                        setDefaultOrganizationOptions(
                                                            newValue,
                                                        )
                                                    }}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="organization_id"
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
                                                        htmlFor="branch_id"
                                                        value="Branch"
                                                    />
                                                </div>
                                                <Select
                                                    id="branch_id"
                                                    name="branch_id"
                                                    className={`select`}
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    value={branch?.data?.data
                                                        ?.filter(r => {
                                                            return values.branch_id.filter(
                                                                v => v === r.id,
                                                            ).length
                                                        })
                                                        .map(o => ({
                                                            value: o.id,
                                                            label: o.name?.toUpperCase(),
                                                        }))}
                                                    isMulti
                                                    options={branch?.data?.data.map(
                                                        o => ({
                                                            value: o.id,
                                                            label: o.name,
                                                        }),
                                                    )}
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'branch_id',
                                                            newValue.map(
                                                                v => v.value,
                                                            ),
                                                        )
                                                        setSelectedBranch(
                                                            newValue.map(
                                                                v => v.value,
                                                            ),
                                                        )
                                                        setDefaultBranchOptions(
                                                            newValue,
                                                        )
                                                    }}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="branch_id"
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
                                                        htmlFor="default_organization_id"
                                                        value="Default Organization"
                                                    />
                                                </div>
                                                <Select
                                                    id="default_organization_id"
                                                    name="default_organization_id"
                                                    className={`select`}
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    options={
                                                        defaultOrganizationOptions
                                                    }
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'default_organization_id',
                                                            newValue?.value,
                                                        )
                                                    }}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="default_organization_id"
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
                                                        htmlFor="default_branch_id"
                                                        value="Default Branch"
                                                    />
                                                </div>
                                                <Select
                                                    id="default_branch_id"
                                                    name="default_branch_id"
                                                    className={`select`}
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    options={
                                                        defaultBranchOptions
                                                    }
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'default_branch_id',
                                                            newValue.value,
                                                        )
                                                    }}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="default_branch_id"
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
                                                        htmlFor="department_id"
                                                        value="Department"
                                                    />
                                                </div>
                                                <Select
                                                    className={`select`}
                                                    id="department_id"
                                                    name="department_id"
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    value={department?.data?.data
                                                        ?.filter(r => {
                                                            return values.department_id.filter(
                                                                v => v === r.id,
                                                            ).length
                                                        })
                                                        .map(o => ({
                                                            value: o.id,
                                                            label: o.name?.toUpperCase(),
                                                        }))}
                                                    isMulti
                                                    options={department?.data?.data.map(
                                                        o => ({
                                                            value: o.id,
                                                            label: o.name,
                                                        }),
                                                    )}
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'department_id',
                                                            newValue.map(
                                                                v => v.value,
                                                            ),
                                                        )
                                                        setDefaultDepartmentOptions(
                                                            newValue,
                                                        )
                                                    }}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />

                                                <ErrorMessage
                                                    name="department_id"
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
                                                        htmlFor="designation_id"
                                                        value="Designation"
                                                    />
                                                </div>
                                                <Select
                                                    className={`select`}
                                                    id="designation_id"
                                                    name="designation_id"
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    isMulti
                                                    options={designation?.data?.data.map(
                                                        o => ({
                                                            value: o.id,
                                                            label: o.name,
                                                        }),
                                                    )}
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'designation_id',
                                                            newValue.map(
                                                                v => v.value,
                                                            ),
                                                        )
                                                    }}
                                                    value={designation?.data?.data
                                                        ?.filter(r => {
                                                            return values.designation_id.filter(
                                                                v => v === r.id,
                                                            ).length
                                                        })
                                                        .map(o => ({
                                                            value: o.id,
                                                            label: o.name?.toUpperCase(),
                                                        }))}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="designation_id"
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
                                                        htmlFor="default_department_id"
                                                        value="Default Department"
                                                    />
                                                </div>
                                                <Select
                                                    className={`select`}
                                                    id="default_department_id"
                                                    name="default_department_id"
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    options={
                                                        defaultDepartmentOptions
                                                    }
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'default_department_id',
                                                            newValue?.value,
                                                        )
                                                    }}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />

                                                <ErrorMessage
                                                    name="default_department_id"
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
                                                        htmlFor="roles"
                                                        value="Roles"
                                                    />
                                                </div>
                                                <Select
                                                    className={`select`}
                                                    id="roles"
                                                    name="roles"
                                                    closeMenuOnSelect={false}
                                                    components={
                                                        animatedComponents
                                                    }
                                                    value={roles?.data
                                                        ?.filter(r => {
                                                            return values.roles.filter(
                                                                v => v === r.id,
                                                            ).length
                                                        })
                                                        .map(o => ({
                                                            value: o.id,
                                                            label: o.name?.toUpperCase(),
                                                        }))}
                                                    isMulti
                                                    options={roles?.data?.map(
                                                        o => ({
                                                            value: o.id,
                                                            label: o.name?.toUpperCase(),
                                                        }),
                                                    )}
                                                    onChange={(
                                                        newValue,
                                                        actionMeta,
                                                    ) => {
                                                        setFieldValue(
                                                            'roles',
                                                            newValue.map(
                                                                v => v.value,
                                                            ),
                                                        )
                                                    }}
                                                    menuPlacement={`bottom`}
                                                    onBlur={handleBlur}
                                                    menuShouldScrollIntoView={
                                                        true
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="roles"
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
                                                    storeResult.isLoading
                                                }
                                                onClick={handleSubmit}
                                                type="submit"
                                                color={`success`}>
                                                Submit
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Formik>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default create
