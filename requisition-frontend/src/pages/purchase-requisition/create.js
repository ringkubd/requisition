import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Select } from "flowbite-react";
import NavLink from "@/components/NavLink";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import {
    useGetInitialRequisitionForPurchaseQuery,
    useStorePurchaseRequisitionMutation
} from "@/store/service/requisitions/purchase";
import { useDispatch, useSelector } from "react-redux";
import {
    removePurchaseRequisitionData,
    setAllPurchaseRequisitionData
} from "@/store/service/requisitions/purchase_requisition_input_change";
import PurchaseInput from "@/components/purchase-requisition/PurchaseInput";
import moment from "moment";

const InitialRequisitionCreate = (props) => {
    const router = useRouter();
    const [storePurchaseRequisition, storeResult] = useStorePurchaseRequisitionMutation();
    const initialRequisitionForPurchase = useGetInitialRequisitionForPurchaseQuery();
    const [selectedRequisition, setSelectedRequisition] = useState(false);
    const dispatch = useDispatch();
    const {products} = useSelector(state => state.purchase_requisition_inputs);
    const [totalPrice, setTotalPrice] = useState(0);


    useEffect(() => {
        if (initialRequisitionForPurchase.isSuccess && initialRequisitionForPurchase.data){
            const requisition_products = initialRequisitionForPurchase.data.data.filter(it => it.id == selectedRequisition)[0]?.requisition_products?.map(p => ({
                ...p,
                price: p.price ?? 0
            }));
            dispatch(setAllPurchaseRequisitionData(requisition_products));
            setTotalPrice(0);
        }
    }, [selectedRequisition]);

    useEffect(() => {
        if (!products) return
        const t = products.reduceRight((total, current) => {
            const abc = (parseFloat(current.price) * parseFloat(current.quantity_to_be_purchase))
            return (isNaN(abc) ? 0 : abc)  + total;
        }, 0);
        setTotalPrice(t);
    }, [products]);

    const submit = () => {
        if (products.length){
            if (!totalPrice){
                const check = confirm("Are you sure you want to submit an estimated amount of 0?");
                if (check){
                    toast.error("You are going to submit an estimated amount of 0?");
                    storePurchaseRequisition(products);
                }

            }else{
                storePurchaseRequisition(products);
            }
        }else {
            toast.warn("Perhaps you forgot to add the item.");
        }
    }

    useEffect(() => {
        if (!storeResult.isError && !storeResult.isLoading && storeResult.isSuccess){
            toast.success("Purchase requisition successfully generated.");
            dispatch(removePurchaseRequisitionData());
            router.push('/purchase-requisition');
        }
    }, [storeResult])

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
            selector: row => <PurchaseInput key={row.id} row={row} price={row.price ?? 0} />,
            sortable: true,
        },
        {
            name: 'Est. Total',
            selector: row => isNaN(row.price * row.quantity_to_be_purchase) ? 0 : parseFloat(row.price * row.quantity_to_be_purchase).toLocaleString(),
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
                                                <option key={r.id} value={r.id}>{r.irf_no + " (" + moment(r.created_at).format('DD-MMM-Y@H:mm')+")"}</option>
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
                              <div className={`mx-4 my-3 border-t-2 justify-items-end text-right`}>
                                  <h2 className={`font-bold`}>Total Estimate Cost</h2>
                                  <h2 className={`font-bold`}>{totalPrice.toLocaleString()}</h2>
                              </div>
                              <div className={`flex mx-4 my-3 border-t-2 justify-items-end text-right items-end flex-row justify-end`}>
                                  <Button onClick={submit} gradientMonochrome="teal">Submit</Button>
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
