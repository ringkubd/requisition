import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Select, TextInput } from "flowbite-react";
import NavLink from "@/components/NavLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import {
    useGetInitialRequisitionForPurchaseQuery,
    useStorePurchaseRequisitionMutation
} from "@/store/service/requisitions/purchase";
import { useDispatch, useSelector } from "react-redux";
import {
    setPurchaseRequisitionData,
    setAllPurchaseRequisitionData,
    updatePurchaseRequisitionData
} from "@/store/service/requisitions/purchase_requisition_input_change";


function objectUpdateOrAdd(obj, newItem, key){
    const existingCheck = obj.filter((o) => o[key] == newItem[key])
    if (existingCheck.length){
        return obj.map(o => {
            if (o[key] == newItem[key]){
                return newItem
            }else{
                return o;
            }
        })
    }else {
        return [...obj, newItem];
    }
}

const InitialRequisitionCreate = (props) => {
    const router = useRouter();
    const [storeInitialRequisition, storeResult] = useStorePurchaseRequisitionMutation();
    const initialRequisitionForPurchase = useGetInitialRequisitionForPurchaseQuery();
    const [selectedRequisition, setSelectedRequisition] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState([]);
    const [estimatedUnitPrice, setEstimatedUniPrice] = useState([]);
    const dispatch = useDispatch();
    const [requisitionData, setRequisitionData] = useState([]);
    const {products} = useSelector(state => state.purchase_requisition_inputs);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (initialRequisitionForPurchase.isSuccess && initialRequisitionForPurchase.data){
            const requisition_products = initialRequisitionForPurchase.data.data.filter(it => it.id == selectedRequisition)[0]?.requisition_products
            dispatch(setAllPurchaseRequisitionData(requisition_products))
            setRequisitionData(requisition_products);
            setTotalPrice(0)
        }
    }, [selectedRequisition]);

    const submit = () => {
        if (requisitionData.length){
            storeInitialRequisition(requisitionData)
        }else {
            toast.warn("Perhaps you forgot to add the item.");
        }
    }


    const Input = ({ row, price }) => {
        const onInputChange = async e => {
            const {name, value} = e.target;
            const newRow = {...row, price: value}
            dispatch(updatePurchaseRequisitionData(newRow))
            setTotalPrice(totalPrice + parseFloat(value) * parseFloat(row.quantity_to_be_purchase));
        }
        return (
            <div>
                <input
                    key={row.id}
                    row={row.id}
                    type={"number"}
                    step={0.1}
                    className={`form-input rounded border max-w-[6rem]`}
                    onChange={onInputChange}
                    name={row.id}
                    value={price}
                />
            </div>
        )
    }

    const tableColumns = [
        {
            name: 'Product',
            selector: row => row.product?.title,
            sortable: true,
        },
        {
            name: 'Variant',
            selector: row =>  row.product_option?.option_name,
            sortable: true,
        },
        {
            name: 'Last Purchase',
            selector: row => row.last_purchase_date ?? 'New',
            sortable: true,
        },
        {
            name: 'Required Qty',
            selector: row => row.required_quantity,
            sortable: true,
        },
        {
            name: 'Available Qty',
            selector: row => row.available_quantity,
            sortable: true,
        },
        {
            name: 'Qty to be purchase',
            selector: row => row.quantity_to_be_purchase,
            sortable: true,
        },
        {
            name: 'Est. Unit Price',
            selector: row => <Input row={row} price={row.price} />,
            sortable: true,
        },
        {
            name: 'Est. Total',
            selector: row => row.price * row.quantity_to_be_purchase,
            sortable: true,
        },
        {
            name: 'Purpose',
            selector: row => row.purpose,
            sortable: true,
        }
    ];

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Purchase Requisition.
                    </h2>
                }
            >
                <Head>
                    <title>Purchase Requisition</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'purchase-requisition'}
                                href={`/purchase-requisition`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full space-y-4`}>
                            <div className={`shadow-md w-full`}>
                                {
                                    initialRequisitionForPurchase.isLoading ? "Loading...." : (
                                        !initialRequisitionForPurchase.isError && initialRequisitionForPurchase.isSuccess && (
                                            <Select onChange={(c) => setSelectedRequisition(c.target.value)}>
                                                <option value=""></option>
                                                {
                                                    initialRequisitionForPurchase.data?.data?.map(r => (
                                                        <option key={r.id} value={r.id}>{r.irf_no}</option>
                                                    ))
                                                }
                                            </Select>
                                        )
                                    )
                                }

                            </div>
                            <div className={`shadow-md w-full`}>
                                <DataTable
                                    columns={tableColumns}
                                    data={products}
                                />
                                <div className={`mx-4 my-3 border-t-2`}>
                                    <h2>Total Estimate Cost</h2>
                                    <h2>{totalPrice}</h2>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default InitialRequisitionCreate;
