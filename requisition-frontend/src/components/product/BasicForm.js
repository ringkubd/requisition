import { ErrorMessage, Formik } from "formik";
import { Button, Label, Textarea, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import unit2select from "unit2select";
import * as Yup from "yup";
import { useGetCategoryQuery } from "@/store/service/category";
import { useDispatch, useSelector } from "react-redux";
import { setProductBasicInfo } from "@/store/service/product/product_basic_form";
import MySelect2Component from "@/components/select2/Select2Component";
import { setActiveForm } from "@/store/service/product/product_active_form";

export default function BasicForm(props){
    const category = useGetCategoryQuery()
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const dispatch = useDispatch();
    const { basic } = useSelector(state => state.product_basic_form)

    useEffect(() => {
        setUnitOptions(
            unit2select(true)
                .filter(f => f.value)
                .map(i => ({ value: i.value, label: i.text })),
        )
    }, [])

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
        title: basic?.title ?? "",
        sl_no: basic?.sl_no ?? "",
        unit: basic?.unit ?? "",
        category_id: basic?.category_id ?? "",
        description: basic?.description ?? "",
    }
    const validationSchema = Yup.object().shape({
        title: Yup.string().required().label('Title'),
        sl_no: Yup.string().nullable().label('Serial No.'),
        unit: Yup.string().required().label('Unit'),
        category_id: Yup.string().required().label('Category'),
        description: Yup.string().nullable().label('Description'),
    })
    const submit = (values, pageProps) => {
        dispatch(setProductBasicInfo(values))
        dispatch(setActiveForm(2));
        pageProps.setSubmitting(false);
    }

    return (
        <>
            <h2
                className={`w-full border-b pb-2 font-bold`}>
                Basic Information
            </h2>
            <Formik
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
                                        htmlFor="sl_no"
                                        value="Sl. No."
                                    />
                                </div>
                                <TextInput
                                    id="sl_no"
                                    placeholder="Serial No"
                                    type="text"
                                    required
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={handleBlur}
                                    value={values.sl_no}
                                />
                                <ErrorMessage
                                    name="sl_no"
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
                                <MySelect2Component
                                    name={`category_id`}
                                    id={`category_id`}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    options={categoryOptions}
                                    value={values.category_id}
                                    data-placeholder="Select options..."
                                    className={`w-full border-1 border-gray-300`}
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
                                <MySelect2Component
                                    name={`unit`}
                                    id={`unit`}
                                    options={unitOptions}
                                    value={values.unit}
                                    onChange={handleChange}
                                    data-placeholder="Select options..."
                                    className={`w-full border-1 border-gray-300`}
                                />
                                <ErrorMessage
                                    name="unit"
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
                                        htmlFor="description"
                                        value="Description"
                                    />
                                </div>
                                <Textarea
                                    id="description"
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
