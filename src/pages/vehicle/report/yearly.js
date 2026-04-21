import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card, Label } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import {
    getVehicleHistory,
    useGetVehicleYearlyReportQuery,
    getRunningQueriesThunk,
} from "@/store/service/vehicle/VehicleHistoryAPI";
import moment from "moment";
import Select from "react-select";
import FuelYearlyReportPrint from "@/components/fuel/FuelYearlyReportPrint";
import { useReactToPrint } from "react-to-print";

const Yearly = () => {
    const router = useRouter();
    const printPageRef = useRef();
    const [page, setPage] = useState(1);
    const [year, setYear] = useState(moment().format("Y"));
    const { data } = useGetVehicleYearlyReportQuery({
        page,
        year,
    });

    const handlePrint = useReactToPrint({
        content: () => printPageRef.current,
        onBeforePrint: (a) => console.log(a),
    });

    return (
        <>
            <Head>
                <title>Yearly Fuel Report</title>
            </Head>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Yearly Fuel Report.
                    </h2>
                }
            >
                <Head>
                    <title>Yearly Fuel Report.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="flex flex-col sm:flex-row shadow-lg justify-center items-center sm:items-start sm:justify-start py-4 px-4 space-x-1 sm:space-x-3 space-y-3 sm:space-y-0">
                            <NavLink
                                active={router.pathname === "vehicle/report"}
                                href={`/vehicle/report`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                            <div
                                className={`flex flex-row justify-center items-center`}
                            >
                                <Button
                                    className={`mt-1`}
                                    color={"indigo"}
                                    onClick={handlePrint}
                                >
                                    Print
                                </Button>
                            </div>
                            <div
                                className={`flex flex-row justify-center items-center space-x-3 ml-4`}
                            >
                                <Label>Year</Label>
                                <Select
                                    options={Array.from(
                                        { length: 10 },
                                        (_, index) => index
                                    ).map((index) => ({
                                        label: moment()
                                            .subtract(index, "year")
                                            .format("Y"),
                                        value: moment()
                                            .subtract(index, "year")
                                            .format("Y"),
                                    }))}
                                    defaultValue={{
                                        value: moment().format("Y"),
                                        label: moment().format("Y"),
                                    }}
                                    onChange={(value) => {
                                        setYear(value.value);
                                    }}
                                />
                            </div>
                        </div>
                        <div
                            className={`flex flex-col justify-center items-center`}
                        >
                            <FuelYearlyReportPrint
                                reports={data?.data ?? []}
                                year={year}
                                ref={printPageRef}
                            />
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
};

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        store.dispatch(getVehicleHistory.initiate());
        await Promise.all(store.dispatch(getRunningQueriesThunk()));
        return {
            props: {},
        };
    }
);

export default Yearly;
