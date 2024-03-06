import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Textarea, TextInput } from "flowbite-react";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
    useGetCashRequisitionSelectQuery,
    useStoreVehicleHistoryMutation
} from "@/store/service/vehicle/VehicleHistoryAPI";
import { useGetVehicleQuery } from "@/store/service/vehicle/VehicleAPI";
import Select from "react-select";
import { useGetPumpQuery } from "@/store/service/vehicle/PumpAPI";
import moment from "moment";

const create = (props) => {
    const router = useRouter();
    const [storeReport, storeResult] = useStoreVehicleHistoryMutation();
    const {data: vehicles, isLoading: vehicleISLoading, isError: vehicleISError} = useGetVehicleQuery();
    const [cashItem, setCashItem] = useState(null);
    const {data: requisition, isLoading: requisitionISLoading, isError: requisitionISError} = useGetCashRequisitionSelectQuery({
        cash_item: cashItem
    },{
        skip: !cashItem
    })
    const {data: pumps, isLoading: pumpsISLoading, isError: pumpsISError} = useGetPumpQuery();
    let formikForm = useRef();

    const initValues = {
        vehicle_id: '',
        cash_requisition_id: '',
        refuel_date: moment().format('Y-MM-DD'),
        unit: 'Octane',
        quantity: '',
        rate: '',
        bill_no: '',
        last_mileage: '',
        current_mileage: '',
        pump_id: '',
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Vehicle report stored successfully.')
            router.push('/vehicle/report')
        }
    }, [storeResult]);
    const submit = (values, pageProps) => {
        storeReport(values)
    }

    const validationSchema = Yup.object().shape({
        vehicle_id: Yup.number().label('Vehicle'),
        cash_requisition_id: Yup.number().required().label('Related Requisition'),
        refuel_date: Yup.date().required().label('Refuel Date'),
        quantity: Yup.number().required().label('Quantity'),
        rate: Yup.number().required().label('Rate'),
        bill_no: Yup.string().nullable().label('Bill No'),
        last_mileage: Yup.number().label('Last Mileage'),
        current_mileage: Yup.number().label('Current Mileage'),
        pump_id: Yup.number().label('Pump'),
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add New Vehicle Report.
                    </h2>
                }>
                <Head>
                    <title>Add New Vehicle Report</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <Button onClick={() => router.back()}>Back</Button>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            <Formik
                                initialValues={initValues}
                                onSubmit={submit}
                                validationSchema={validationSchema}
                                innerRef={formikForm}>
                                {({
                                    handleSubmit,
                                    handleChange,
                                    setFieldValue,
                                    handleBlur,
                                    values,
                                    errors,
                                    isSubmitting,
                                    setErrors,
                                }) => (
                                    <div className="flex flex-col gap-4 md:w-1/2 w-full">
                                        <div className="flex flex-row gap-4">
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="vehicle_id"
                                                        value="Vehicle"
                                                    />
                                                </div>
                                                <Select
                                                    options={vehicles?.data?.map(
                                                        (data, index) => ({
                                                            label:
                                                                data.brand +
                                                                ' - ' +
                                                                data.model +
                                                                ' - ' +
                                                                data.reg_no,
                                                            value: data.id,
                                                            cash_item:
                                                                data.cash_product_id,
                                                            last_mileage: data.last_mileage
                                                        }),
                                                    )}
                                                    isLoading={vehicleISLoading}
                                                    className={`select`}
                                                    classNames={() => ({
                                                        control: 'select',
                                                    })}
                                                    onChange={vehicle => {
                                                        setFieldValue(
                                                            'vehicle_id',
                                                            vehicle.value,
                                                        )
                                                        setCashItem(
                                                            vehicle.cash_item,
                                                        )
                                                        setFieldValue('last_mileage', vehicle.last_mileage);
                                                    }}
                                                />
                                                <ErrorMessage
                                                    name="vehicle_id"
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
                                                        htmlFor="cash_requisition_id"
                                                        value="Requisition"
                                                    />
                                                </div>
                                                <Select
                                                    options={requisition?.data?.map(
                                                        (data, index) => ({
                                                            label:
                                                                data.department
                                                                    ?.name +
                                                                ' - ' +
                                                                data.prf_no +
                                                                ' - ' +
                                                                data.total_cost,
                                                            value: data.id,
                                                            items: data.items,
                                                        }),
                                                    )}
                                                    isLoading={
                                                        requisitionISLoading
                                                    }
                                                    className={`select`}
                                                    classNames={() => ({
                                                        control: 'select',
                                                    })}
                                                    onChange={req => {
                                                        setFieldValue(
                                                            'cash_requisition_id',
                                                            req.value,
                                                        )
                                                    }}
                                                />
                                                <ErrorMessage
                                                    name="cash_requisition_id"
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
                                                        htmlFor="refuel_date"
                                                        value="Refuel Date"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="refuel_date"
                                                    name="refuel_date"
                                                    type="date"
                                                    value={values.refuel_date}
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="refuel_date"
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
                                                        htmlFor="quantity"
                                                        value="Quantity"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="quantity"
                                                    name="quantity"
                                                    type="number"
                                                    value={values.quantity}
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="quantity"
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
                                                        htmlFor="unit"
                                                        value="Unit"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="unit"
                                                    name="unit"
                                                    type="text"
                                                    value={values.unit}
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
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
                                            <div className="w-full">
                                                <div className="mb-2 block">
                                                    <Label
                                                        htmlFor="rate"
                                                        value="Rate"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="rate"
                                                    name="rate"
                                                    type="text"
                                                    value={values.rate}
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="rate"
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
                                                        htmlFor="bill_no"
                                                        value="Bill No"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="bill_no"
                                                    name="bill_no"
                                                    type="text"
                                                    value={values.bill_no}
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="bill_no"
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
                                                        htmlFor="last_mileage"
                                                        value="Last Mileage"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="last_mileage"
                                                    name="last_mileage"
                                                    type="number"
                                                    value={values.last_mileage}
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="last_mileage"
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
                                                        htmlFor="current_mileage"
                                                        value="Current Mileage"
                                                    />
                                                </div>
                                                <TextInput
                                                    id="current_mileage"
                                                    name="current_mileage"
                                                    type="number"
                                                    value={
                                                        values.current_mileage
                                                    }
                                                    required
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage
                                                    name="current_mileage"
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
                                                        htmlFor="pump_id"
                                                        value="Pump"
                                                    />
                                                </div>
                                                <Select
                                                    options={pumps?.data?.map(
                                                        (data, index) => ({
                                                            label:
                                                                data.name +
                                                                ' - ' +
                                                                data.address,
                                                            value: data.id,
                                                        }),
                                                    )}
                                                    isLoading={pumpsISLoading}
                                                    className={`select`}
                                                    classNames={() => ({
                                                        control: 'select',
                                                    })}
                                                    onChange={pump => {
                                                        setFieldValue(
                                                            'pump_id',
                                                            pump.value,
                                                        )
                                                    }}
                                                />
                                                <ErrorMessage
                                                    name="pump_id"
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
                                                isProcessing={isSubmitting}
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
export default create;
