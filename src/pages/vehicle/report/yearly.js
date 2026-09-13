import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card, Checkbox, Label } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import React, { useMemo, useRef, useState } from "react";
import {
    getVehicleHistory,
    useGetVehicleYearlyReportQuery,
    useLazyGetVehicleYearlyReportQuery,
    getRunningQueriesThunk,
} from "@/store/service/vehicle/VehicleHistoryAPI";
import moment from "moment";
import Select from "react-select";
import FuelYearlyReportPrint from "@/components/fuel/FuelYearlyReportPrint";
import FuelComparisonReport from "@/components/fuel/FuelComparisonReport";
import { useReactToPrint } from "react-to-print";

const YEARLY_METRICS = [
    { key: "quantity", label: "Quantity (ltr)", type: "sum" },
    { key: "millage", label: "Mileage", type: "sum" },
    { key: "cost", label: "Cost", type: "sum" },
    { key: "average_rate", label: "Avg Rate", type: "avg" },
    { key: "average_monthly_cost", label: "Avg Monthly Cost", type: "avg" },
    { key: "entries", label: "Entries", type: "sum" },
];

const Yearly = () => {
    const router = useRouter();
    const printPageRef = useRef();
    const [mode, setMode] = useState("single"); // single | compare
    const [page, setPage] = useState(1);
    const [year, setYear] = useState(moment().format("Y"));

    const yearOptions = useMemo(
        () =>
            Array.from({ length: 10 }, (_, i) => {
                const y = moment().subtract(i, "year").format("Y");
                return { label: y, value: y };
            }),
        []
    );

    const defaultYears = useMemo(
        () =>
            Array.from({ length: 3 }, (_, i) =>
                moment().subtract(i, "year").format("Y")
            ),
        []
    );
    const [selectedYears, setSelectedYears] = useState(defaultYears);
    const [periods, setPeriods] = useState([]);
    const [results, setResults] = useState([]);
    const { data } = useGetVehicleYearlyReportQuery({ page, year });
    const [
        fetchYearly,
        { isLoading: isLoadingCompare },
    ] = useLazyGetVehicleYearlyReportQuery();

    const handleShowComparison = async () => {
        const list = yearOptions
            .filter((o) => selectedYears.includes(o.value))
            .map((o) => ({ key: o.value, label: o.value, param: o.value }))
            .sort((a, b) => Number(a.key) - Number(b.key));
        if (!list.length) {
            alert("Please select at least one year.");
            return;
        }
        setPeriods(list);
        try {
            const res = await Promise.all(
                list.map((p) =>
                    fetchYearly({ page: 1, year: p.param }).unwrap()
                )
            );
            setResults(res.map((r) => r?.data ?? []));
        } catch (e) {
            setResults(list.map(() => []));
        }
    };

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
                        <div className="flex gap-2 border-b border-gray-200 mb-4">
                            <button
                                onClick={() => setMode("single")}
                                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                    mode === "single"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Single Year
                            </button>
                            <button
                                onClick={() => setMode("compare")}
                                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                    mode === "compare"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Compare Years
                            </button>
                        </div>

                        {mode === "single" ? (
                            <>
                                <div className="flex flex-col sm:flex-row shadow-lg justify-center items-center sm:items-start sm:justify-start py-4 px-4 space-x-1 sm:space-x-3 space-y-3 sm:space-y-0">
                                    <NavLink
                                        active={
                                            router.pathname === "vehicle/report"
                                        }
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
                                            options={yearOptions}
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
                            </>
                        ) : (
                            <div className="py-2">
                                <div className="mb-4 flex flex-col lg:flex-row gap-4 lg:items-start">
                                    <div className="flex-1">
                                        <Label
                                            value="Select years"
                                            className="font-semibold text-gray-700 mb-2"
                                        />
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 border rounded-lg p-3">
                                            {yearOptions.map((o) => (
                                                <label
                                                    key={o.value}
                                                    className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedYears.includes(
                                                            o.value
                                                        )}
                                                        onChange={() =>
                                                            setSelectedYears(
                                                                (prev) => {
                                                                    if (
                                                                        prev.includes(
                                                                            o.value
                                                                        )
                                                                    ) {
                                                                        if (
                                                                            prev.length ===
                                                                            1
                                                                        )
                                                                            return prev;
                                                                        return prev.filter(
                                                                            (
                                                                                x
                                                                            ) =>
                                                                                x !==
                                                                                o.value
                                                                        );
                                                                    }
                                                                    return [
                                                                        ...prev,
                                                                        o.value,
                                                                    ];
                                                                }
                                                            )
                                                        }
                                                    />
                                                    {o.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={handleShowComparison}
                                            isProcessing={isLoadingCompare}
                                        >
                                            Show Comparison
                                        </Button>
                                    </div>
                                </div>

                                <FuelComparisonReport
                                    title="Yearly Fuel Comparison"
                                    periods={periods}
                                    results={results}
                                    metricConfig={YEARLY_METRICS}
                                    defaultMetrics={[
                                        "quantity",
                                        "millage",
                                        "cost",
                                        "average_rate",
                                        "average_monthly_cost",
                                    ]}
                                    isLoading={isLoadingCompare}
                                />
                            </div>
                        )}
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
