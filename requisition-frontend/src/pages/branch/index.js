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
import { useDestroyBranchMutation, useGetBranchQuery, getBranch, getRunningQueriesThunk } from "@/store/service/branch";

const Branch = () => {
  const router = useRouter();
  const {data, isLoading, isError} = useGetBranchQuery();
  const [destroy, destroyResponse] = useDestroyBranchMutation();


  useEffect(() => {
      if (!destroyResponse.isLoading && destroyResponse.isSuccess){
          toast.success('Branch deleted.')
      }
  }, [destroyResponse])

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Contact',
            selector: row => row.contact_no,
            sortable: true,
        },
        {
            name: 'Address',
            selector: row => row.address,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => <Actions
                itemId={row.id}
                edit={`/branch/${row.id}/edit`}
                view={`/branch/${row.id}/view`}
                destroy={destroy}
                permissionModule={`branches`}
                progressing={destroyResponse.isLoading}
            />,
            ignoreRowClick: true,
        }
    ];

  return (
    <>
      <Head>
        <title>Branch Management</title>
      </Head>
      <AppLayout
          header={
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                  Branch Management.
              </h2>
          }
      >
          <Head>
              <title>Add new branch</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
              <Card>
                  <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                      <NavLink
                          active={router.pathname === 'branch/create'}
                          href={`branch/create`}
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
                              persistTableHead
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
    store.dispatch(getBranch.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Branch;
