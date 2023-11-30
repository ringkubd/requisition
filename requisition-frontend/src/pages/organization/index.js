import Head from "next/head";
import {
    getOrganization,
    getRunningQueriesThunk,
    useDestroyOrganizationMutation,
    useGetOrganizationQuery
} from "@/store/service/organization";
import { useAuth } from "@/hooks/auth";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import Actions from "@/components/actions";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Organization = () => {
  const router = useRouter();
  const {data, isLoading, isError} = useGetOrganizationQuery();
  const [destroy, destroyResponse] = useDestroyOrganizationMutation();

  useEffect(() => {
      if (!destroyResponse.isLoading && destroyResponse.isSuccess){
          toast.success('Organization deleted.')
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
                edit={`/organization/${row.id}/edit`}
                view={`/organization/${row.id}/view`}
                destroy={destroy}
                progressing={destroyResponse.isLoading}
                permissionModule={`organization`}
            />,
            ignoreRowClick: true,
        }
    ];

  return (
    <>
      <Head>
        <title>Organization Management</title>
      </Head>
      <AppLayout
          header={
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                  Organization Management.
              </h2>
          }
      >
          <Head>
              <title>Organization Management.</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
              <Card>
                  <div className="flex flex-row space-x-4 space-y-4 shadow-lg py-4 px-4">
                      <NavLink
                          active={router.pathname === 'organization/create'}
                          href={`organization/create`}
                      >
                          <Button>Create</Button>
                      </NavLink>
                  </div>
                  {
                      !isLoading && !isError && data && (
                          <DataTable
                              columns={columns}
                              data={data}
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
    store.dispatch(getOrganization.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Organization;
