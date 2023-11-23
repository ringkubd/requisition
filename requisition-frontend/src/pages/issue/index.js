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
import {
    useGetIssueQuery,
    useEditIssueQuery,
    useDestroyIssueMutation,
    getRunningQueriesThunk, getIssue
} from "@/store/service/issue";
import moment from "moment";

const ProductIssue = () => {
  const router = useRouter();
  const {data, isLoading, isError} = useGetIssueQuery();
  const [destroy, destroyResponse] = useDestroyIssueMutation();


  useEffect(() => {
      if (!destroyResponse.isLoading && destroyResponse.isSuccess){
          toast.success('Product Issue removed.')
      }
  }, [destroyResponse])

    const columns = [
        {
            name: 'Product',
            selector: row => row.product?.title,
            sortable: true,
        },
        {
            name: 'Variant',
            selector: row => row.variant?.title,
            sortable: true,
        },
        {
            name: 'Qty',
            selector: row => row.quantity,
            sortable: true,
        },
        {
            name: 'Receiver',
            selector: row => row.receiver?.name,
            sortable: true,
        },
        {
            name: 'Issuer',
            selector: row => row.issuer?.name,
            sortable: true,
        },
        {
            name: 'Purpose',
            selector: row => row.purpose,
            sortable: false,
        },
        {
            name: 'Uses Area',
            selector: row => row.uses_area,
            sortable: false,
        },
        {
            name: 'Note',
            selector: row => row.note,
            sortable: false,
        },
        {
            name: 'Issue Time',
            selector: row => moment(row.issue_time).format('D MMM Y @ H:mm '),
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
                permissionModule={`product-issues`}
            />,
            ignoreRowClick: true,
        }
    ];

  return (
    <>
      <Head>
        <title>Product Issuer Management</title>
      </Head>
      <AppLayout
          header={
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                  Product Issuer Management.
              </h2>
          }
      >
          <Head>
              <title>Product Issuer Management.</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
              <Card>
                  <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                      <NavLink
                          active={router.pathname === 'issue/create'}
                          href={`issue/create`}
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
    store.dispatch(getIssue.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default ProductIssue;
