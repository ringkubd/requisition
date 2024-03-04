import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import { Button, Card, Checkbox, Label, Radio } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import Select from "react-select";
import { useGetNavigationDepartmentQuery } from "@/store/service/navigation";
import { useGetCategoryQuery } from "@/store/service/category";
import React, { useEffect, useRef, useState } from "react";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";
import PurchaseReport from "@/components/report/purchaseReport";
import IssueReport from "@/components/report/issueReport";
import {
    useIssuesReportMutation,
    usePurchaseReportMutation,
    useBothReportMutation,
    useProductCurrentBalanceMutation, useProductCurrentBalanceOptionMutation
} from "@/store/service/report";
import { useReactToPrint } from "react-to-print";
import ItemBaseIssueReport from "@/components/report/itemBaseIssueReport";
import ItemBasePurchaseReport from "@/components/report/itemBasePurchaseReport";
import BothReport from "@/components/report/BothReport";
import axios from "@/lib/axios";
import { AsyncPaginate } from "react-select-async-paginate";
import ProductBalance from "@/components/report/productBalance";

Object.filter = (obj, predicate) => Object.fromEntries(Object.entries(obj).filter(predicate));
const Report = () => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("");
    const {data: departments, isLoading: departmentISLoading, isError: departmentISError} = useGetNavigationDepartmentQuery();
    const {data: categories, isLoading: categoryISLoading, isError: categoryISError} = useGetCategoryQuery();
    const [submitIssueReport, {data: issueReports, isLoading:issueReportsISLoading, isError:issueReportsISError, isSuccess: issueReportsISSuccess}] = useIssuesReportMutation();
    const [submitPurchaseReport, {data: purchaseReport, isLoading: purchaseReportISLoading, isError:purchaseReportISError, isSuccess: purchaseReportISSuccess}] = usePurchaseReportMutation();
    const [submitBothReport, {data: bothReport, isLoading: bothReportISLoading, isError:bothReportISError, isSuccess: bothReportISSuccess}] = useBothReportMutation();
    const [submitBalance, {data: balance, isLoading: balanceISLoading, isError:balanceISError, isSuccess: balanceISSuccess}] = useProductCurrentBalanceMutation();
    const [submitBalanceOption, {data: balanceOption, isLoading: balanceOptionISLoading, isError:balanceOptionISError, isSuccess: balanceOptionISSuccess}] = useProductCurrentBalanceOptionMutation();

    const printRef = useRef();
    const [reportType, setReportType] = useState('usage');
    const [reportFormat, setReportFormat] = useState('category_base');
    const [columns, setColumns] = useState({
        category: true,
        issuer: true,
        department: true,
        avg: true,
        use_date: true,
        variant: true,
    });

    const {start_date, end_date} = issueReports ?? purchaseReport ?? bothReport ?? balance ?? {};

    const initialValues = {
        category: '',
        department: '',
        start_date: '',
        end_date: moment().format('Y-MM-DD'),
        product: '',
        report_type: 'usage',
        report_format: 'category_base'
    };

    const submit = (values, formikHelper) => {
        if (values.report_type === "purchase"){
            submitPurchaseReport(values);
        }else if (values.report_type === "usage"){
            submitIssueReport(values);
        }else if (values.report_type === "both"){
            submitBothReport(values);
        }else{
            submitBalance(values);
        }

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

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        onBeforePrint: (a) => console.log(a)
    });

    useEffect(() => {
        if (reportType === "purchase" && reportFormat === "category_base"){
            setColumns({
                category: true,
                supplier: true,
                department: true,
                variant: true,
            })
        }else if(reportType === "purchase" && reportFormat !== "category_base"){
            setColumns({
                category: true,
                variant: true,
            })
        }else if(reportType === "usage"  && reportFormat === "category_base"){
            setColumns({
                category: true,
                issuer: true,
                department: true,
                avg: true,
                use_date: true,
                variant: true,
            });
        }else if(reportType === "usage" && reportFormat !== "category_base"){
            setColumns({
                category: true,
                avg: true,
            });
        }
    }, [reportType, reportFormat])
    async function loadOptions(search, loadedOptions, { page }) {
        const response = await axios.get(`/api/product-select`, {
            params: {
                search: search,
                page: page,
                category_id: selectedCategory
            }
        });
        const responseJSON = response.data?.data;

        return {
            options: responseJSON?.products.map((r,index) => {
                return {
                    label: r.title,
                    value: r.id,
                    product: r,
                    product_options: r.product_options,
                }
            }),
            hasMore: responseJSON.count > 20,
            additional: {
                page: search ? 1 : page + 1,
            },
        };
    }
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
                                    <div className="flex flex-col md:flex-row md:space-x-4">
                                        <fieldset className="flex flex-row gap-4 border border-solid border-gray-300 p-3 w-full shadow-md">
                                            <legend className="mb-4 font-bold">
                                                Report Type
                                            </legend>
                                            <div className="flex items-center gap-2">
                                                <Radio
                                                    id="purchase"
                                                    name="report_type"
                                                    value="purchase"
                                                    defaultChecked={
                                                        values.report_type ===
                                                        'purchase'
                                                    }
                                                    onChange={e => {
                                                        handleChange(e)
                                                        if (e.target.checked) {
                                                            setReportType(
                                                                'purchase',
                                                            )
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor="purchase"
                                                    className={`font-bold`}>
                                                    Receive
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Radio
                                                    id="usage"
                                                    name="report_type"
                                                    value="usage"
                                                    defaultChecked={
                                                        values.report_type ===
                                                        'usage'
                                                    }
                                                    onChange={e => {
                                                        handleChange(e)
                                                        if (e.target.checked) {
                                                            setReportType(
                                                                'usage',
                                                            )
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor="usage"
                                                    className={`font-bold`}>
                                                    Issue
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Radio
                                                    id="both"
                                                    name="report_type"
                                                    value="both"
                                                    defaultChecked={
                                                        values.report_type ===
                                                        'both'
                                                    }
                                                    onChange={e => {
                                                        handleChange(e)
                                                        if (e.target.checked) {
                                                            setReportType(
                                                                'both',
                                                            )
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor="both"
                                                    className={`font-bold`}>
                                                    Both
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Radio
                                                    id="balance"
                                                    name="report_type"
                                                    value="balance"
                                                    defaultChecked={
                                                        values.report_type ===
                                                        'balance'
                                                    }
                                                    onChange={e => {
                                                        handleChange(e)
                                                        if (e.target.checked) {
                                                            setReportType(
                                                                'balance',
                                                            )
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor="balance"
                                                    className={`font-bold`}>
                                                    Balance
                                                </Label>
                                            </div>
                                        </fieldset>
                                        {reportType !== 'both' && reportType !== 'balance' ? (
                                            <>
                                                <fieldset className="flex flex-row gap-4 border border-solid border-gray-300 p-3 w-full shadow-md">
                                                    <legend className="mb-4 font-bold">
                                                        Columns
                                                    </legend>
                                                    {Object.keys(columns).map(
                                                        (c, i) => (
                                                            <div
                                                                className="flex items-center gap-2"
                                                                key={i}>
                                                                <Checkbox
                                                                    id={c}
                                                                    name="column"
                                                                    defaultChecked={
                                                                        columns[
                                                                            c
                                                                        ]
                                                                    }
                                                                    onChange={e => {
                                                                        handleChange(
                                                                            e,
                                                                        )
                                                                        columns[
                                                                            c
                                                                        ] =
                                                                            e.target.checked
                                                                        setColumns(
                                                                            columns,
                                                                        )
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor={c}
                                                                    className={`font-bold`}>
                                                                    {c.toLocaleUpperCase()}
                                                                </Label>
                                                            </div>
                                                        ),
                                                    )}
                                                </fieldset>
                                            </>
                                        ) : ""}
                                        {
                                            reportType !== 'both' ? (
                                                <fieldset className="flex flex-row gap-4 border border-solid border-gray-300 p-3 w-full shadow-md">
                                                    <legend className="mb-4 font-bold">
                                                        Report Format
                                                    </legend>
                                                    {reportType !== 'balance' ? (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <Radio
                                                                    id="category_base"
                                                                    name="report_format"
                                                                    defaultChecked={
                                                                        values.report_format ===
                                                                        'category_base'
                                                                    }
                                                                    onChange={e => {
                                                                        handleChange(
                                                                            e,
                                                                        )
                                                                        if (
                                                                            e.target
                                                                                .checked
                                                                        ) {
                                                                            setReportFormat(
                                                                                'category_base',
                                                                            )
                                                                        }
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor="category_base"
                                                                    className={`font-bold`}>
                                                                    Category Base
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Radio
                                                                    id="item_base"
                                                                    name="report_format"
                                                                    defaultChecked={
                                                                        values.report_format ===
                                                                        'item_base'
                                                                    }
                                                                    onChange={e => {
                                                                        handleChange(
                                                                            e,
                                                                        )
                                                                        if (
                                                                            e.target
                                                                                .checked
                                                                        ) {
                                                                            setReportFormat(
                                                                                'item_base',
                                                                            )
                                                                        }
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor="item_base"
                                                                    className={`font-bold`}>
                                                                    Item Base
                                                                </Label>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <Radio
                                                                    id="item_base"
                                                                    name="report_format"
                                                                    defaultChecked={
                                                                        values.report_format ===
                                                                        'item_base'
                                                                    }
                                                                    onChange={e => {
                                                                        if (
                                                                            e.target
                                                                                .checked
                                                                        ) {
                                                                            setReportFormat(
                                                                                'item_base',
                                                                            )
                                                                            setFieldValue('report_format', 'item_base');
                                                                        }
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor="item_base"
                                                                    className={`font-bold`}>
                                                                    Item Base
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Radio
                                                                    id="option_base"
                                                                    name="report_format"
                                                                    defaultChecked={
                                                                        values.report_format ===
                                                                        'option_base'
                                                                    }
                                                                    onChange={e => {
                                                                        if (
                                                                            e.target
                                                                                .checked
                                                                        ) {
                                                                            setReportFormat(
                                                                                'option_base',
                                                                            )
                                                                            setFieldValue('report_format', 'option_base');
                                                                        }
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor="option_base"
                                                                    className={`font-bold`}>
                                                                    Variant Base
                                                                </Label>
                                                            </div>
                                                        </>
                                                    )}
                                                </fieldset>
                                            ) : (
                                                ''
                                            )
                                        }
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
                                                onChange={d => {
                                                    setFieldValue(
                                                        'start_date',
                                                        d.startDate,
                                                    )
                                                    setFieldValue(
                                                        'end_date',
                                                        d.endDate,
                                                    )
                                                }}
                                                value={{
                                                    startDate:
                                                        values.start_date,
                                                    endDate: values.end_date,
                                                }}
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
                                            <AsyncPaginate
                                                defaultOptions
                                                key={selectedCategory}
                                                name="product_id"
                                                id="product_id"
                                                className={`select`}
                                                classNames={{
                                                    control: state => 'select',
                                                }}
                                                isMulti
                                                onChange={newValue =>
                                                    setFieldValue(
                                                        'product',
                                                        newValue?.map(
                                                            v => v.value,
                                                        ),
                                                    )
                                                }
                                                additional={{
                                                    page: 1,
                                                }}
                                                loadOptions={loadOptions}
                                                data-placeholder="Select options..."
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
                        <div className={`flex flex-col`}>
                            <div>
                                <Button onClick={handlePrint}>Print</Button>
                            </div>
                            <div
                                className="flex flex-col relative overflow-x-auto"
                                ref={printRef}>
                                <div className={`flex flex-col`}>
                                    <div className={`text-center font-bold`}>
                                        <h2>
                                            IsDB-Bangladesh Islamic Solidarity
                                            Educational Wakf (IsDB-BISEW)
                                        </h2>
                                    </div>
                                    <div
                                        className={`flex flex-col justify-center items-center justify-items-center text-center`}>
                                        <p
                                            className={`py-1 px-4 underline bg-gray-300 w-fit`}>
                                            Product{' '}
                                            {reportType === 'purchase'
                                                ? 'Purchase'
                                                : reportType === 'usage'
                                                ? 'Issue'
                                                : reportType === 'balance'
                                                ? 'Balance'
                                                : 'Purchase and Issue'}{' '}
                                            Report
                                        </p>
                                    </div>
                                    <div
                                        className={`flex justify-center items-center justify-items-center text-center`}>
                                        <i
                                            className={`px-4 w-fit font-extralight font-serif`}>
                                            Date:{' '}
                                            {reportType === 'balance'
                                                ? moment(start_date).format(
                                                      'DD MMM Y',
                                                  )
                                                : (start_date
                                                      ? moment(
                                                            start_date,
                                                        ).format('DD MMM Y')
                                                      : '') +
                                                  ' - ' +
                                                  (end_date
                                                      ? moment(end_date).format(
                                                            'DD MMM Y',
                                                        )
                                                      : '')}
                                        </i>
                                    </div>
                                </div>
                                {reportType === 'purchase' ? (
                                    reportFormat === 'category_base' ? (
                                        <PurchaseReport
                                            data={purchaseReport}
                                            columns={columns}
                                            isLoading={purchaseReportISLoading}
                                            key={reportFormat}
                                        />
                                    ) : (
                                        <ItemBasePurchaseReport
                                            data={purchaseReport}
                                            columns={columns}
                                            isLoading={purchaseReportISLoading}
                                            key={reportFormat}
                                        />
                                    )
                                ) : reportType === 'usage' ? (
                                    reportFormat === 'category_base' ? (
                                        <IssueReport
                                            isLoading={issueReportsISLoading}
                                            data={issueReports}
                                            columns={columns}
                                            key={
                                                Object.keys(
                                                    Object.filter(
                                                        columns,
                                                        ([name, status]) =>
                                                            status === true,
                                                    ),
                                                ).length * Math.random()
                                            }
                                        />
                                    ) : (
                                        <ItemBaseIssueReport
                                            isLoading={issueReportsISLoading}
                                            data={issueReports}
                                            columns={columns}
                                            key={
                                                Object.keys(
                                                    Object.filter(
                                                        columns,
                                                        ([name, status]) =>
                                                            status === true,
                                                    ),
                                                ).length * Math.random()
                                            }
                                        />
                                    )
                                ) : reportType === 'both' ? (
                                    <BothReport
                                        isLoading={bothReportISLoading}
                                        data={bothReport}
                                        columns={columns}
                                        key={
                                            Object.keys(
                                                Object.filter(
                                                    columns,
                                                    ([name, status]) =>
                                                        status === true,
                                                ),
                                            ).length * Math.random()
                                        }
                                    />
                                ) : (
                                    <ProductBalance
                                        isLoading={balanceISLoading}
                                        data={balance}
                                        columns={columns}
                                        key={
                                            Object.keys(
                                                Object.filter(
                                                    columns,
                                                    ([name, status]) =>
                                                        status === true,
                                                ),
                                            ).length * Math.random()
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

export default Report;
