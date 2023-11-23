import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import NavLink from "@/components/navLink";
import { Button, Card } from "flowbite-react";
import DataTable from "react-data-table-component";
import { useEffect, useState } from "react";
import { getUnits, useDeleteUnitsMutation, useGetUnitsQuery, getRunningQueriesThunk } from "@/store/service/units";
import { toast } from "react-toastify";
import Actions from "@/components/actions";
import { useRouter } from "next/router";
import { wrapper } from "@/store";

export default function Units(){
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const {data, isLoading, isError, isSuccess} = useGetUnitsQuery();
  const [destroy, destroyResponse] = useDeleteUnitsMutation();

  useEffect(() => {
    if (!destroyResponse.isLoading && destroyResponse.isSuccess){
      toast.success('Unit deleted.')
    }
  }, [destroyResponse])

  useEffect(() => {
    if (!isLoading && !isError && data){
      setColumns([
        {
          name: 'Name',
          selector: row => row.unit_name,
          sortable: true,
        },
        {
          name: 'Code',
          selector: row => row.unit_code,
          sortable: true,
        },
        {
          name: 'Actions',
          cell: (row) => <Actions
            itemId={row.id}
            edit={`/units/${row.id}/edit`}
              // view={`/category/${row.id}/view`}
            destroy={destroy}
            progressing={destroyResponse.isLoading}
            permissionModule={`measurement-units`}
          />,
          ignoreRowClick: true,
        }
      ]);
    }
  }, [isLoading, isError, data]);
  return (
    <AppLayout
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Unit Management.
        </h2>
      }
    >
      <Head>
        <title>Unit Management</title>
      </Head>
      <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="flex flex-row space-x-4 space-y-4 shadow-lg py-4 px-4">
            <NavLink
              active={router.pathname === 'units/create'}
              href={`units/create`}
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
            fixedHeader
            dense
          />
        </Card>
      </div>
    </AppLayout>
  )
}
export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getUnits.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})
