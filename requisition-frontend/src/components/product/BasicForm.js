import { ErrorMessage, Formik } from "formik";
import { Button, Label, Textarea, TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useGetCategoryQuery } from "@/store/service/category";
import { useDispatch, useSelector } from "react-redux";
import { setProductBasicInfo } from "@/store/service/product/product_basic_form";
import { setActiveForm } from "@/store/service/product/product_active_form";
import { useGetUnitsQuery } from "@/store/service/units";
import Select from "react-select";

export default function BasicForm(props){
    const category = useGetCategoryQuery()
    const [categoryOptions, setCategoryOptions] = useState([]);
    const dispatch = useDispatch();
    const { basic } = useSelector(state => state.product_basic_form)
    const formikRef = useRef();
    const {basic: basicData} = props;
    const {data: units, isLoading: unitLoading, isSuccess: unitIsSuccess, isError: unitIsError} = useGetUnitsQuery();

    useEffect(() => {
        if (!category.isError && !category.isLoading) {
            setCategoryOptions(
                category?.data?.data
                    ?.map(c => ({ label: c.title, value: c.id }))
                    .slice(0, 50),
            )
        }
    }, [category])

    const initValues = {
        title: basic?.title ?? basicData?.title ?? "",
        unit: basic?.unit ?? basicData?.unit ?? "",
        category_id: basic?.category_id ?? basicData?.category_id ?? "",
        description: basic?.description ?? basicData?.description ?? "",
    }
    const validationSchema = Yup.object().shape({
        title: Yup.string().required().label('Title'),
        unit: Yup.string().required().label('Unit'),
        category_id: Yup.string().required().label('Category'),
        description: Yup.string().nullable().label('Description'),
    })
    const submit = (values, pageProps) => {
        dispatch(setProductBasicInfo(values))
        dispatch(setActiveForm(2));
        pageProps.setSubmitting(false);
    }
    useEffect(() => {
        formikRef.current.setValues({
            title: basic?.title ?? "",
            unit: basic?.unit ?? "",
            category_id: basic?.category_id ?? "",
            description: basic?.description ?? "",
        })
    }, [basic]);

    return (
        <>
            <h2
                className={`w-full border-b pb-2 font-bold`}>
                Basic Information
            </h2>
            <Formik
                innerRef={formikRef}
                initialValues={initValues}
                onSubmit={submit}
                validationSchema={validationSchema}>
                {({
                      handleBlur,
                      handleChange,
                      handleSubmit,
                      setFieldValue,
                      values,
                      isSubmitting,
                  }) => (
                    <>
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
                                    name="title"
                                    placeholder="Product Name"
                                    type="text"
                                    required
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={handleBlur}
                                    value={values.title}
                                />
                                <ErrorMessage
                                    name="title"
                                    render={msg => (
                                        <span className="text-red-500">
                                                                    {msg}
                                                                </span>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex flex-row gap-4">
                            <div className="w-full">
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="category"
                                        value="Category"
                                    />
                                </div>
                                <Select
                                    name={`category_id`}
                                    id={`category_id`}
                                    onChange={(newValue) => {
                                        setFieldValue('category_id', newValue?.value)
                                    }}
                                    onBlur={handleBlur}
                                    options={categoryOptions}
                                    value={categoryOptions.filter(c => c.value === values.category_id)[0]}
                                    data-placeholder="Select options..."
                                    className={`select`}
                                    classNames={{control: state => `select`}}
                                />

                                <ErrorMessage
                                    name="category_id"
                                    render={msg => (
                                        <span className="text-red-500">
                                                                    {msg}
                                                                </span>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row gap-4">
                            <div className="w-full">
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="unit"
                                        value="Unit"
                                    />
                                </div>
                                <Select
                                    name={`unit`}
                                    id={`unit`}
                                    options={units?.data?.map((u) => ({label: u.unit_code + ` (${u.unit_name})`, value: u.unit_code}) )}
                                    value={units?.data?.filter(u => u.unit_code === values.unit)?.map((u) => ({label: u.unit_code + ` (${u.unit_name})`, value: u.unit_code}))[0]}
                                    onChange={(newValue) => {
                                        setFieldValue('unit', newValue?.value)
                                    }}
                                    data-placeholder="Select options..."
                                    className={`select`}
                                    classNames={{control: state => `select`}}
                                />
                                <ErrorMessage
                                    name="unit"
                                    render={msg => (<span className="text-red-500">{msg}</span>)}
                                />
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
                                    name="description"
                                    placeholder="All kind of detergent products."
                                    type="text"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage
                                    name="description"
                                    render={msg => (
                                        <span className="text-red-500">
                                                                    {msg}
                                                                </span>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row gap-4 justify-end">
                            <Button
                                isProcessing={
                                    isSubmitting
                                }
                                onClick={handleSubmit}
                                type="submit"
                                color={`success`}>
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </Formik>
        </>
    )
}
