import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Card, Table } from "flowbite-react";
import NavLink from "@/components/navLink";
import DataTable from "react-data-table-component";
import React, { useEffect, useState } from "react";
import { useEditPurchaseRequisitionQuery } from "@/store/service/requisitions/purchase";

const View = (props) => {
    const router = useRouter();
    const [columns, setColumns] = useState([]);

    const {data, isLoading, isError} = useEditPurchaseRequisitionQuery(router.query.id, {
        skip: !router.query.id
    });

    const requisition_products = data?.data?.purchase_requisition_products;

    useEffect(() => {
        if (!isLoading && !isError && requisition_products){
            setColumns([
                {
                    name: 'Sl#',
                    selector: (row, index) => index + 1,
                    sortable: true,
                    maxWidth: "40px",
                },
                {
                    name: 'Name of the Item',
                    selector: row => row.title,
                    sortable: true,
                },
                {
                    name: 'Last Purchase Date',
                    selector: row => row.last_purchase_date_formated,
                    sortable: true,
                    maxWidth: "155px",
                },
                {
                    name: 'Unit',
                    selector: row => row.product?.unit,
                    sortable: true,
                    maxWidth: "140px",
                },
                {
                    name: 'Required Qty',
                    selector: row => row.required_quantity,
                    sortable: true,
                    maxWidth: "140px",
                },
                {
                    name: 'Available Qty',
                    selector: row => row.available_quantity,
                    sortable: true,
                    maxWidth: "140px",
                },
                {
                    name: 'Qty to be Purchase',
                    selector: row => row.quantity_to_be_purchase,
                    sortable: true,
                    maxWidth: "140px",
                },
                {
                    name: 'Unit Price',
                    selector: row => row.unit_price,
                    sortable: true,
                    maxWidth: "140px",
                },
                {
                    name: 'Purpose ',
                    selector: row => row.purpose,
                    sortable: true,
                },
            ])
        }
    }, [isLoading, isError, requisition_products])


    return (
      <AppLayout
        header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                Purchase Requisition
            </h2>
        }>
          <Head>
              <title>Purchase Requisition</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="min-h-screen">
                  <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                      <NavLink
                        active={router.pathname === 'initial-requisition'}
                        href={`/purchase-requisition`}>
                          <Button>Back</Button>
                      </NavLink>
                      <NavLink
                        active={router.pathname === 'initial-requisition'}
                        href={`/purchase-requisition/${router.query.id}/print_view`}>
                          <Button
                            gradientDuoTone="purpleToBlue"
                            outline
                          >
                              Print
                          </Button>
                      </NavLink>
                  </div>
                  <div className="flex flex-col space-y-6">
                      <div className={`w-full shadow-md  p-2`}>
                          <h2
                            className={`w-full border-b pb-2 font-bold`}>
                              Basic Information
                          </h2>
                          <div className={`overflow-x-auto`}>
                              {
                                  !isLoading && !isError && data ? (
                                      <Table>
                                          <Table.Head>
                                              <Table.HeadCell>I.R.F. No</Table.HeadCell>
                                              <Table.HeadCell>Department</Table.HeadCell>
                                              <Table.HeadCell>Estimated Cost</Table.HeadCell>
                                              <Table.HeadCell>Purchase Status</Table.HeadCell>
                                              <Table.HeadCell>Purchase Requisition</Table.HeadCell>
                                              <Table.HeadCell>Generated by</Table.HeadCell>
                                              <Table.HeadCell>Created at</Table.HeadCell>
                                          </Table.Head>
                                          <Table.Body>
                                              <Table.Row>
                                                  <Table.Cell>{data?.data?.irf_no}</Table.Cell>
                                                  <Table.Cell>{data?.data?.department?.name}</Table.Cell>
                                                  <Table.Cell>{data?.data?.estimated_total_amount}</Table.Cell>
                                                  <Table.Cell>{data?.data?.is_purchase_done ? "Done" : 'No'}</Table.Cell>
                                                  <Table.Cell>{data?.data?.is_purchase_requisition_generated ? 'Generated' : 'No'}</Table.Cell>
                                                  <Table.Cell>{data?.data?.user?.name}</Table.Cell>
                                                  <Table.Cell>{data?.data?.created_at}</Table.Cell>
                                              </Table.Row>
                                          </Table.Body>
                                      </Table>
                                    )
                                    : <h2>Data loading or error.</h2>
                              }
                          </div>
                      </div>
                      <div className={`w-full shadow-md  p-2 space-y-4`}>
                          <h2
                            className={`w-full border-b pb-2 font-bold`}>
                              Requisite Items
                          </h2>
                          <DataTable
                            columns={columns}
                            data={requisition_products}
                            responsive
                            progressPending={isLoading}
                            persistTableHead
                          />
                      </div>
                  </div>
              </Card>
          </div>
      </AppLayout>
    )
}
export default View;
