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
import { useDestroyBrandsMutation, useGetBrandsQuery, getBrands, getRunningQueriesThunk } from "@/store/service/brands";

const Department = () => {
  const router = useRouter();
  const {data, isLoading, isError} = useGetBrandsQuery();
  const [destroy, destroyResponse] = useDestroyBrandsMutation();


  useEffect(() => {
      if (!destroyResponse.isLoading && destroyResponse.isSuccess){
          toast.success('Brand deleted.')
      }
  }, [destroyResponse])

    const columns = [
        {
            name: 'Brand Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'logo',
            selector: row => row.logo ? <Image width={50} height={50} alt={row.name} src={row.logo} /> : "",
            sortable: true,
        },
        {
            name: 'contact',
            selector: row => row.contact,
            sortable: true,
        },
        {
            name: 'address',
            selector: row => row.address,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => <Actions
                itemId={row.id}
                destroy={destroy}
                progressing={destroyResponse.isLoading}
                permissionModule={`brands`}
            />,
            ignoreRowClick: true,
        }
    ];

  return (
    <>
      <Head>
        <title>Brands Management</title>
      </Head>
      <AppLayout
          header={
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                  Brands Management.
              </h2>
          }
      >
          <Head>
              <title>Brands Management.</title>
          </Head>
          <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
              <Card>
                  <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                      <NavLink
                          active={router.pathname === 'brands/create'}
                          href={`brands/create`}
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
    store.dispatch(getBrands.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Department;
