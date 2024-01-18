import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import Actions from "@/components/actions";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import {
    getPurchase,
    useGetPurchaseQuery,
    useDestroyPurchaseMutation,
    getRunningQueriesThunk,
} from "@/store/service/purchase";

const Purchase = () => {
  const router = useRouter();
  const {data, isLoading, isError} = useGetPurchaseQuery();
  const [destroy, destroyResponse] = useDestroyPurchaseMutation();


  useEffect(() => {
      if (!destroyResponse.isLoading && destroyResponse.isSuccess){
          toast.success('Supplier deleted.')
      }
  }, [destroyResponse])

    const columns = [
        {
            name: 'SL',
            selector: (row, index) => index + 1,
            sortable: true,
            width: "38px",
            style: {
                padding: 0
            }
        },
        {
            name: 'Product',
            selector: row => row.product?.title + " - " +  row.productOption?.title,
            sortable: true,
            minWidth: "220px"
        },
        {
            name: 'Supplier',
            selector: row => row.supplier?.logo ? <Image width={50} height={50} alt={row.supplier?.name} src={row.supplier?.logo} /> : row.supplier?.name,
            sortable: true,
        },
        {
            name: 'Brand',
            selector: row => row.brand?.logo ? <Image width={50} height={50} alt={row.brand?.name} src={row.brand?.logo} /> : row.brand?.name,
            sortable: true,
        },
        {
            name: 'P.R. No.',
            selector: row => row.purchaseRequisition?.prf_no,
            sortable: true,
            width: "96px",
        },
        {
            name: 'Qty',
            selector: row => row.qty + " (" + row.product?.unit +")",
            sortable: true,
            width: "90px",
        },
        {
            name: 'Unit Price',
            selector: row => row.unit_price,
            sortable: true,
            width: "100px",
        },
        {
            name: 'Purchase Date',
            selector: row => row.purchase_date,
            sortable: true,
        },
        {
            name: 'Expiry Date',
            selector: row => row.expiry_date,
            sortable: true,
        },
        {
            name: 'Available Qty.',
            selector: row => row.available_qty,
            sortable: true,
        },
        {
            name: 'Total',
            selector: row => row.total_price,
            sortable: true,
        },
        {
            name: 'Chalan',
            selector: row => row.chalan_no,
            sortable: true,
        },
        {
            name: 'Origin',
            selector: row => row.origin,
            sortable: true,
        },
        {
            name: 'Notes',
            selector: row => row.notes,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => <Actions
                itemId={row.id}
                // edit={`/purchase/${row.id}/edit`}
                // view={`/purchase/${row.id}/view`}
                destroy={destroy}
                progressing={destroyResponse.isLoading}
                permissionModule={`purchases`}
            />,
            ignoreRowClick: true,
        }
    ];

  return (
    <>
      <Head>
        <title>Purchase Management</title>
      </Head>
      <AppLayout
          header={
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                  Purchase Management.
              </h2>
          }
      >
          <Head>
              <title>Purchase Management.</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
              <Card>
                  <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                      <NavLink
                          active={router.pathname === 'purchase/create'}
                          href={`purchase/create`}
                      >
                          <Button>Create</Button>
                      </NavLink>
                  </div>
                  {
                      !isLoading && !isError && data && (
                          <DataTable
                              columns={columns}
                              data={data.data}
                              pagination
                              responsive
                              progressPending={isLoading}
                              persistTableHead={true}
                          />
                      )
                  }
              </Card>
          </div>
      </AppLayout>
    </>
  )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getPurchase.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Purchase;
