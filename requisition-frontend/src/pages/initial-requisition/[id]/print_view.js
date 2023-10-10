import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Card } from "flowbite-react";
import NavLink from "@/components/NavLink";
import { useEditInitialRequisitionQuery } from "@/store/service/requisitions/initial";
import React, { useRef } from "react";
import InitialPrint from "@/components/initial-requisition/initialPrint";
import { useReactToPrint } from "react-to-print";

const PrintView = (props) => {
  const router = useRouter();
  const {data, isLoading, isError} = useEditInitialRequisitionQuery(router.query.id, {
    skip: !router.query.id
  });

  const printPageRef = useRef();

  const requisition_products = data?.data?.requisition_products;
  const mainData = data?.data;


  const handlePrint = useReactToPrint({
    content: () => printPageRef.current,
    onBeforePrint: (a) => console.log(a)
  });

  return (
    <AppLayout
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Initial Requisition
        </h2>
      }>
      <Head>
        <title>Initial Requisition</title>
      </Head>
      <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="min-h-screen">
          <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
            <NavLink
              active={router.pathname === 'initial-requisition'}
              href={`/initial-requisition`}>
              <Button>Back</Button>
            </NavLink>
            <div className={`pt-1`}>
              <Button
                onClick={handlePrint}
                gradientDuoTone="purpleToBlue"
                outline
              >Print</Button>
            </div>
          </div>

          <div className={`mx-auto shadow-none`}>
            {
              !isLoading && !isError && data ? (
                  <InitialPrint
                    mainData={mainData}
                    requisition_products={requisition_products}
                    ref={printPageRef}
                  />
                )
                : <h2>Data loading or error.</h2>
            }
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
export default PrintView;
