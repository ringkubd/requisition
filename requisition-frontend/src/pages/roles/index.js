import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import { Button, Card } from "flowbite-react";
import NavLink from "@/components/navLink";
import DataTable from "react-data-table-component";
import { getRoles, useDestroyRolesMutation, useGetRolesQuery, getRunningQueriesThunk } from "@/store/service/roles";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Actions from "@/components/actions";
import { wrapper } from "@/store";

export default function Roles(){
  const router = useRouter();
  const {data, isLoading, isError} = useGetRolesQuery();
  const [destroy, destroyResponse] = useDestroyRolesMutation();
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    if (!destroyResponse.isLoading && destroyResponse.isSuccess){
      toast.success('Role deleted.')
    }
  }, [destroyResponse])

  useEffect(() => {
    if (!isLoading && !isError && data){
      setColumns([
        {
          name: 'Name',
          selector: row => row.name,
          sortable: true,
        },
        {
          name: 'Guard',
          selector: row => row.guard_name,
          sortable: true,
        },
        {
          name: 'Actions',
          cell: (row) => <Actions
            itemId={row.id}
            edit={`/roles/${row.id}/edit`}
            destroy={destroy}
            progressing={destroyResponse.isLoading}
            other={`/roles/${row.id}/permissions`}
            permissionModule={`roles`}
          />,
          ignoreRowClick: true,
        }
      ]);
    }
  }, [isLoading, isError, data]);
  return (
    <AppLayout header={
      <h2 className="font-semibold text-xl text-gray-800 leading-tight">
        Roles Management.
      </h2>
    }>
      <Head>
        <title>Roles Management.</title>
      </Head>
      <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
            <NavLink
              active={router.pathname === 'roles/create'}
              href={`roles/create`}
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
  )
}
export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getRoles.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})
