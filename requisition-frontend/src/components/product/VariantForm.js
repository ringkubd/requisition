import DataTable from "react-data-table-component";
import { Button, Label, TextInput } from "flowbite-react";
import { ErrorMessage, Formik } from "formik";
import { setProductOptionsLocal } from "@/store/service/options/optionSlice";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { useGetOptionsQuery } from "@/store/service/options";
import Select2Component from "@/components/select2/Select2Component";
import { setActiveForm } from "@/store/service/product/product_active_form";

export default function VariantForm(props) {
    const options = useGetOptionsQuery();
    const {productOptions} = useSelector((state) => state.product_option_local);
    const dispatch = useDispatch();
    const {variant} = props;
    const selectRef = useRef();

    useEffect(() => {
        if (variant){
            selectRef.current.resetSelect();
            dispatch(setProductOptionsLocal(...variant))
        }
    });

    const optionInitValues = {
        option_id: '',
        sku: '',
        option_value: '',
        unit_price: '',
        stock: '',
    }

    const submitOptions = (values, props) => {
        dispatch(setProductOptionsLocal(values))
        props.resetForm();
        selectRef.current.resetSelect();
        props.setSubmitting(false);
    }

    const next = () => {
        dispatch(setActiveForm(3));
    }

    const optionsColumns = [
        {
            name: 'Option',
            selector: row => !options.isLoading && !options.isError && options.data ? options.data.data.filter((o) => o.id === parseInt(row.option_id))[0]?.name : '',
            sortable: true,
        },
        {
            name: 'Value',
            selector: row => row?.option_value,
            sortable: true,
        },
        {
            name: 'SKU',
            selector: row => row?.sku,
            sortable: true,
        },
        {
            name: 'Unit Price',
            selector: row => row?.unit_price,
            sortable: true,
        },
        {
            name: 'Stock',
            selector: row => row?.stock,
            sortable: true,
        },
    ];

    const optionsValidationSchema = Yup.object().shape({
        option_id: Yup.number().required().label('Option'),
        sku: Yup.string().nullable().label('SKU'),
        option_value: Yup.string()
            .when('option_id', {
                is: (val) => val,
                then: () => Yup.string().required().label('Option Value')
            }).label('Option Value'),
        unit_price: Yup.string().label('Unit Price'),
        stock: Yup.string().when('option_id', {
            is: (val) => val,
            then: () => Yup.string().required().label('Stock'),
        }).label('Stock'),
    });

    return (
        <>
            <h2
                className={`w-full border-b pb-2 font-bold`}>
                Variant Information
            </h2>
            <Formik
                initialValues={optionInitValues}
                onSubmit={submitOptions}
                validationSchema={optionsValidationSchema}
            >
                {({
                      handleBlur,
                      handleChange,
                      handleSubmit,
                      isSubmitting,
                      setFieldValue,
                      errors,
                      values,
                  }) => (
                    <>
                        <DataTable
                            columns={optionsColumns}
                            data={productOptions}
                        />
                        <div className="flex flex-row gap-4">
                            <div className="w-full">
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="option_id"
                                        value="Option"
                                    />
                                </div>
                                <Select2Component
                                    id='option_id'
                                    name='option_id'
                                    options={options?.data?.data.map(m => ({value: m.id, label: m.name}))}
                                    loading={options.isLoading ? "": ''}
                                    onChange={handleChange}
                                    value={values.opiton_id}
                                    data-placeholder="Select options..."
                                    className={`w-full border-1 border-gray-300`}
                                />
                                <ErrorMessage
                                    name="opiton_id"
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
                                        htmlFor="option_value"
                                        value="Value"
                                    />
                                </div>
                                <TextInput
                                    id={`option_value`}
                                    name={`option_value`}
                                    value={values.option_value}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage
                                    name="option_value"
                                    render={msg => (
                                        <span className="text-red-500">{msg}</span>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row gap-4">
                            <div className="w-full">
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="sku"
                                        value="SKU"
                                    />
                                </div>
                                <TextInput
                                    id={`sku`}
                                    name={`sku`}
                                    value={values.sku}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage
                                    name="sku"
                                    render={msg => (
                                        <span className="text-red-500">{msg}</span>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row gap-4">
                            <div className="w-full">
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="unit_price"
                                        value="Unit Price"
                                    />
                                </div>
                                <TextInput
                                    id={`unit_price`}
                                    name={`unit_price`}
                                    value={values.unit_price}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage
                                    name="unit_price"
                                    render={msg => (
                                        <span className="text-red-500">{msg}</span>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row gap-4">
                            <div className="w-full">
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="stock"
                                        value="Stock"
                                    />
                                </div>
                                <TextInput
                                    type={`number`}
                                    step={0.1}
                                    id={`stock`}
                                    name={`stock`}
                                    value={values.stock}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage
                                    name="stock"
                                    render={msg => (
                                        <span className="text-red-500">{msg}</span>
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
                                color={`info`}>
                                Add
                            </Button>
                            <Button
                                onClick={next}
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
