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
    useDestroyDepartmentMutation,
    useGetDepartmentQuery,
    getRunningQueriesThunk,
    getDepartment
} from "@/store/service/deparment";

const Department = () => {
  const router = useRouter();
  const {data, isLoading, isError} = useGetDepartmentQuery();
  const [destroy, destroyResponse] = useDestroyDepartmentMutation();


  useEffect(() => {
      if (!destroyResponse.isLoading && destroyResponse.isSuccess){
          toast.success('Department deleted.')
      }
  }, [destroyResponse])

    const columns = [
        {
            name: 'Department Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Branch',
            selector: row => row.branch_name,
            sortable: true,
        },
        {
            name: 'Organization',
            selector: row => row.organization_name,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => <Actions
                itemId={row.id}
                edit={`/department/${row.id}/edit`}
                view={`/department/${row.id}/view`}
                destroy={destroy}
                progressing={destroyResponse.isLoading}
            />,
            ignoreRowClick: true,
        }
    ];

  return (
    <>
      <Head>
        <title>Department Management</title>
      </Head>
      <AppLayout
          header={
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                  Department Management.
              </h2>
          }
      >
          <Head>
              <title>Add new department</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
              <Card>
                  <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                      <NavLink
                          active={router.pathname === 'department/create'}
                          href={`department/create`}
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
    store.dispatch(getDepartment.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Department;
