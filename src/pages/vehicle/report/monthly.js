import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { wrapper } from "@/store";
import { Button, Card, Checkbox, Label } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import React, { useMemo, useRef, useState } from "react";
import {
    getVehicleHistory,
    useGetVehicleMonthlyReportQuery,
    useLazyGetVehicleMonthlyReportQuery,
    getRunningQueriesThunk,
} from "@/store/service/vehicle/VehicleHistoryAPI";
import moment from "moment";
import Select from "react-select";
import FuelMonthlyReportPrint from "@/components/fuel/FuelMonthlyReportPrint";
import FuelComparisonReport from "@/components/fuel/FuelComparisonReport";
import { useReactToPrint } from "react-to-print";

const MONTHLY_METRICS = [
    { key: "quantity", label: "Quantity (ltr)", type: "sum" },
    { key: "cost", label: "Cost", type: "sum" },
    { key: "millage", label: "Mileage", type: "sum" },
];

const Monthly = () => {
    const router = useRouter();
    const printPageRef = useRef();
    const [mode, setMode] = useState("single"); // single | compare
    const [page, setPage] = useState(1);
    const [month, setMonth] = useState(moment().format("MM-y"));

    const monthOptions = useMemo(
        () =>
            Array.from({ length: 24 }, (_, i) => {
                const m = moment().subtract(i, "month");
                return { label: m.format("MMM y"), value: m.format("MM-y") };
            }),
        []
    );

    const defaultMonths = useMemo(
        () =>
            Array.from({ length: 3 }, (_, i) =>
                moment().subtract(i, "month").format("MM-y")
            ),
        []
    );
    const [selectedMonths, setSelectedMonths] = useState(defaultMonths);
    const [periods, setPeriods] = useState([]);
    const [results, setResults] = useState([]);
    const { data } = useGetVehicleMonthlyReportQuery({ page, month });
    const [
        fetchMonthly,
        { isLoading: isLoadingCompare },
    ] = useLazyGetVehicleMonthlyReportQuery();

    const handleShowComparison = async () => {
        const list = monthOptions
            .filter((o) => selectedMonths.includes(o.value))
            .map((o) => ({ key: o.value, label: o.label, param: o.value }))
            .sort((a, b) => moment(a.key, "MM-y") - moment(b.key, "MM-y"));
        if (!list.length) {
            alert("Please select at least one month.");
            return;
        }
        setPeriods(list);
        try {
            const res = await Promise.all(
                list.map((p) =>
                    fetchMonthly({ page: 1, month: p.param }).unwrap()
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
                        <div className="flex gap-2 border-b border-gray-200 mb-4">
                            <button
                                onClick={() => setMode("single")}
                                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                    mode === "single"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Single Month
                            </button>
                            <button
                                onClick={() => setMode("compare")}
                                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                    mode === "compare"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Compare Months
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
                                        <Label>Month</Label>
                                        <Select
                                            options={monthOptions}
                                            defaultValue={{
                                                value: moment().format("MM-y"),
                                                label: moment().format("MMM y"),
                                            }}
                                            onChange={(value) => {
                                                setMonth(value.value);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`flex flex-col justify-center items-center`}
                                >
                                    <FuelMonthlyReportPrint
                                        reports={data?.data ?? []}
                                        month={month}
                                        ref={printPageRef}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="py-2">
                                <div className="mb-4 flex flex-col lg:flex-row gap-4 lg:items-start">
                                    <div className="flex-1">
                                        <Label
                                            value={`Select months (${selectedMonths.length}/12)`}
                                            className="font-semibold text-gray-700 mb-2"
                                        />
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                                            {monthOptions.map((o) => (
                                                <label
                                                    key={o.value}
                                                    className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedMonths.includes(
                                                            o.value
                                                        )}
                                                        onChange={() =>
                                                            setSelectedMonths(
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
                                                                    if (
                                                                        prev.length >=
                                                                        12
                                                                    )
                                                                        return prev;
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
                                    title="Monthly Fuel Comparison"
                                    periods={periods}
                                    results={results}
                                    metricConfig={MONTHLY_METRICS}
                                    defaultMetrics={[
                                        "quantity",
                                        "cost",
                                        "millage",
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

export default Monthly;
