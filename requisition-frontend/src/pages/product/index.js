import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/NavLink";
import { useRouter } from "next/router";
import Actions from "@/components/Actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getProduct,
  getRunningQueriesThunk,
  useDestroyProductMutation,
  useGetProductQuery
} from "@/store/service/product/product";


const Branch = () => {
  const router = useRouter();
  const {data, isLoading, isError} = useGetProductQuery();
  const [destroy, destroyResponse] = useDestroyProductMutation();
  const [columns, setColumns] = useState([]);


  useEffect(() => {
      if (!destroyResponse.isLoading && destroyResponse.isSuccess){
          toast.success('Options deleted.')
      }
  }, [destroyResponse])
  useEffect(() => {
    if (!isLoading && !isError && data){
      setColumns([
        {
          name: 'Title',
          selector: row => row.title,
          sortable: true,
        },
        {
          name: 'Sl No.',
          selector: row => row.sl_no,
          sortable: true,
        },
        {
          name: 'Unit',
          selector: row => row.unit,
          sortable: true,
        },
        {
          name: 'Category',
          selector: row => row.category?.title,
          sortable: true,
        },
        {
          name: 'Status',
          selector: row => row.status,
          sortable: true,
        },
        {
          name: 'Actions',
          cell: (row) => <Actions
            itemId={row.id}
            edit={`/product/${row.id}/edit`}
            view={`/product/${row.id}/view`}
            destroy={destroy}
            progressing={destroyResponse.isLoading}
          />,
          ignoreRowClick: true,
        }
      ]);
    }
  }, [isLoading, isError, data]);


  return (
    <>
      <Head>
        <title>Product Management</title>
      </Head>
      <AppLayout
          header={
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                Product Management.
              </h2>
          }
      >
          <Head>
              <title>Product Management.</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
              <Card>
                  <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                      <NavLink
                          active={router.pathname === 'product/create'}
                          href={`product/create`}
                      >
                          <Button>Create</Button>
                      </NavLink>
                  </div>
                  <DataTable
                      columns={columns}
                      data={data?.data}
                      pagination
                      responsive
                      progressPending={isLoading}
                      persistTableHead
                  />
              </Card>
          </div>
      </AppLayout>
    </>
  )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getProduct.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Branch;
