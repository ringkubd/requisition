import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import { Button, Card, Label, Radio } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import Select from "react-select";
import { useGetNavigationDepartmentQuery } from "@/store/service/navigation";
import { useGetCategoryQuery } from "@/store/service/category";
import { useEffect, useRef, useState } from "react";
import { useGetProductQuery, useReportMutation } from "@/store/service/product/product";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";

const Report = () => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(false);
    const {data: departments, isLoading: departmentISLoading, isError: departmentISError} = useGetNavigationDepartmentQuery();
    const {data: categories, isLoading: categoryISLoading, isError: categoryISError} = useGetCategoryQuery();
    const {data: products, isLoading: productISLoading, isError: productISError} = useGetProductQuery({category: selectedCategory}, {
        skip: !selectedCategory
    });
    const [productReport, {data: reports, isLoading: reportISLoading, isError: reportISError, isSuccess: reportISSuccess}] = useReportMutation();
    const dateRef = useRef();

    useEffect(() => {
        console.log(dateRef)
    }, [dateRef])

    const times = [
        {label: 'Weekly', value: 'weekly'},
        {label: 'Last month', value: 'last_month'},
        {label: 'Quarterly', value: 'quarterly'},
        {label: 'Last Six Month', value: 'last_six_month'},
        {label: 'Yearly', value: 'yearly'},
    ]
    const initialValues = {
        category: '',
        department: '',
        start_date: '',
        end_date: moment().format('Y-MM-DD'),
        product: '',
        report_type: 'usage',
    };
    useEffect(() => {
        if (reportISSuccess){
            console.log(reports)
        }
    }, [reportISLoading, reportISSuccess])
    const submit = (values, formikHelper) => {
        productReport(values);
    }
    Yup.addMethod(Yup.mixed, 'atLeastOneOf', function(list, v) {
        return this.test({
            name: 'atLeastOneOf',
            message: 'At least one of these fields: ${keys} is required.',
            exclusive: true,
            params: { keys: list.join(', ') },
            test: (value, context) => {
                return list.some(f => !!context.parent[f])
            }
        })
    })

    const validationSchema = Yup.object().shape({
        category: Yup.array().label('Category'),
        department:  Yup.number(),
        start_date: Yup.date(),
        end_date: Yup.date(),
        product: Yup.mixed().atLeastOneOf(['department', 'start_date', 'end_date', 'product', 'category']),
        report_type: Yup.string().required().label('Report Type'),
    });
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Product usage and purchase report.
                </h2>
            }>
            <Head>
                <title>Product usage and purchase report.</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                <Card>
                    <div className="flex flex-col space-x-4 space-y-4  shadow-lg py-4 px-4">
                        <NavLink
                            active={router.pathname === 'product'}
                            href={`/product`}>
                            <Button>Back to Product</Button>
                        </NavLink>
                        <Formik
                            initialValues={initialValues}
                            onSubmit={submit}
                            validationSchema={validationSchema}>
                            {({
                                handleSubmit,
                                handleChange,
                                values,
                                errors,
                                isSubmitting,
                                setFieldValue,
                            }) => (
                                <div
                                    className={`flex flex-col w-full space-y-6`}>
                                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                                        <fieldset className="flex flex-row gap-4 border border-solid border-gray-300 p-3 w-full shadow-md">
                                            <legend className="mb-4 font-bold">
                                                Report Type
                                            </legend>
                                            <div className="flex items-center gap-2">
                                                <Radio
                                                    id="purchase"
                                                    name="report_type"
                                                    value="purchase"
                                                    defaultChecked={values.report_type === "purchase"}
                                                    onChange={handleChange}
                                                />
                                                <Label htmlFor="purchase" className={`font-bold`}>
                                                    Purchase
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Radio
                                                    id="usage"
                                                    name="report_type"
                                                    value="usage"
                                                    defaultChecked={values.report_type === "usage"}
                                                    onChange={handleChange}
                                                />
                                                <Label htmlFor="usage" className={`font-bold`}>
                                                    Usage
                                                </Label>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div
                                        className={`flex flex-col sm:flex-row w-full sm:space-x-4`}>
                                        <div className={`w-full`}>
                                            <Label
                                                htmlFor={`date_range`}
                                                value={'Date Range'}
                                                className={`font-bold`}
                                            />
                                            <Datepicker
                                                inputId={`date_range`}
                                                inputName={`date_range`}
                                                onChange={(d) => {
                                                    setFieldValue('start_date', d.startDate);
                                                    setFieldValue('end_date', d.endDate);
                                                }}
                                                value={{startDate: values.start_date, endDate: values.end_date}}
                                            />
                                            <ErrorMessage name={'time'} />
                                        </div>
                                        <div className={`w-full`}>
                                            <Label
                                                htmlFor={`department`}
                                                value={'Department'}
                                                className={`font-bold`}
                                            />
                                            <Select
                                                id={`department`}
                                                className={`select`}
                                                classNames={{
                                                    control: state => 'select',
                                                }}
                                                isLoading={departmentISLoading}
                                                options={departments?.data?.map(
                                                    d => ({
                                                        label: d.name,
                                                        value: d.id,
                                                    }),
                                                )}
                                                onChange={newValue =>
                                                    setFieldValue(
                                                        'department',
                                                        newValue?.value ?? '',
                                                    )
                                                }
                                                isClearable={true}
                                            />
                                            <ErrorMessage name={'department'} />
                                        </div>
                                    </div>
                                    <div
                                        className={`flex flex-col sm:flex-row w-full sm:space-x-4`}>
                                        <div className={`w-full`}>
                                            <Label
                                                htmlFor={`category`}
                                                value={'Category'}
                                                className={`font-bold`}
                                            />
                                            <Select
                                                id={`category`}
                                                className={`select`}
                                                classNames={{
                                                    control: state => 'select',
                                                }}
                                                isLoading={categoryISLoading}
                                                options={categories?.data
                                                    ?.filter(c => !c.parent_id)
                                                    .map(c => {
                                                        const sub = c.subCategory?.map(
                                                            s => ({
                                                                label:
                                                                    '=> ' +
                                                                    s.title,
                                                                value: s.id,
                                                            }),
                                                        )
                                                        return {
                                                            label: c.title,
                                                            options: [
                                                                {
                                                                    label:
                                                                        c.title,
                                                                    value: c.id,
                                                                },
                                                                ...sub,
                                                            ],
                                                        }
                                                    })}
                                                isMulti
                                                onChange={(
                                                    newValue,
                                                    actionMeta,
                                                ) => {
                                                    setSelectedCategory(
                                                        newValue?.map(
                                                            v => v.value,
                                                        ) ?? false,
                                                    )
                                                    setFieldValue(
                                                        'category',
                                                        newValue?.map(
                                                            v => v.value,
                                                        ),
                                                    )
                                                }}
                                            />
                                            <ErrorMessage name={'category'} />
                                        </div>
                                        <div className={`w-full`}>
                                            <Label
                                                htmlFor={`product`}
                                                value={'Product'}
                                                className={`font-bold`}
                                            />
                                            <Select
                                                className={`select`}
                                                classNames={{
                                                    control: state => 'select',
                                                }}
                                                isMulti
                                                isLoading={productISLoading}
                                                options={products?.data?.map(
                                                    p => ({
                                                        label: p.title,
                                                        value: p.id,
                                                    }),
                                                )}
                                                onChange={newValue =>
                                                    setFieldValue(
                                                        'product',
                                                        newValue?.map(
                                                            v => v.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            <ErrorMessage
                                                name={'product'}
                                                className={`text-red-600`}>
                                                {msg => (
                                                    <span
                                                        className={`text-red-600`}>
                                                        {msg}
                                                    </span>
                                                )}
                                            </ErrorMessage>
                                        </div>
                                    </div>
                                    <div className={`flex justify-end`}>
                                        <Button onClick={handleSubmit}>
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Formik>
                    </div>
                    <div>

                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

export default Report;
