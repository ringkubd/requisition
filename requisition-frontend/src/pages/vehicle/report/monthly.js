import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card, Label } from "flowbite-react";
import DataTable from 'react-data-table-component';
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import {
    getVehicleHistory,
    useGetVehicleMonthlyReportQuery,
    getRunningQueriesThunk
} from "@/store/service/vehicle/VehicleHistoryAPI";
import moment from "moment";
import Select from "react-select";
import FuelMonthlyReportPrint from "@/components/fuel/FuelMonthlyReportPrint";
import { useReactToPrint } from "react-to-print";

const Monthly = () => {
    const router = useRouter();
    const printPageRef = useRef();
    const [page, setPage] = useState(1);
    const [month, setMonth] = useState(moment().format("MM-y"));
    const {data, isLoading, isError} = useGetVehicleMonthlyReportQuery({page, month});
    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: (a) => console.log(a)
    });


    return (
        <>
            <Head>
                <title>Monthly Fuel Report</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Monthly Fuel Report.
                    </h2>
                }
            >
                <Head>
                    <title>Monthly Fuel Report.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-col sm:flex-row shadow-lg justify-center items-center sm:items-start sm:justify-start py-4 px-4 space-x-1 sm:space-x-3 space-y-3 sm:space-y-0">
                            <NavLink
                                active={router.pathname === 'vehicle/report'}
                                href={`/vehicle/report`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                            <div className={`flex flex-row justify-center items-center`}>
                                <Button className={`mt-1`} color={"indigo"} onClick={handlePrint}>Print</Button>
                            </div>
                            <div className={`flex flex-row justify-center items-center space-x-3 ml-4`}>
                                <Label>Month</Label>
                                <Select
                                    options={Array.from({ length: 24 - 1 + 1 }, (_, i) => i).map((m, index) => ({
                                        label: moment().subtract(index, 'month').format("MMM y"),
                                        value: moment().subtract(index, 'month').format("MM-y"),
                                    }))}
                                    defaultValue={{value:  moment().format("MM-y"),label: moment().format("MMM y")}}
                                    onChange={(value) => {
                                        setMonth(value.value)
                                    }}
                                />
                            </div>
                        </div>
                        <div className={`flex flex-col justify-center items-center`}>
                            <FuelMonthlyReportPrint
                                reports={data?.data ?? []}
                                month={month}
                                ref={printPageRef}
                            />
                        </div>

                    </Card>
                </div>
            </AppLayout>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(getVehicleHistory.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default Monthly;
