import AppLayout from "@/components/Layouts/AppLayout";
import { loadCategory } from "@/lib/initial_requisition";
import {
    useSummaryDepartmentCategoryMutation,
    useSummaryCashMutation,
} from "@/store/service/report";
import { useGetDepartmentByOrganizationBranchQuery } from "@/store/service/deparment";
import Head from "next/head";
import { Fragment, useMemo, useRef, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";
import { AsyncPaginate } from "react-select-async-paginate";
import { useReactToPrint } from "react-to-print";
import { Button, Card, Checkbox, Label, Select } from "flowbite-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const fmt = (v) =>
    Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

const fmtInt = (v) =>
    Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const PRODUCT_METRICS = [
    {
        key: "requisition_amount",
        label: "Requisition Approved",
        color: "#3b82f6",
    },
    { key: "purchase_amount", label: "Actual Purchase", color: "#10b981" },
    { key: "used_amount", label: "Actual Used", color: "#f59e0b" },
];

const emptyCell = () => ({
    requisition_amount: 0,
    purchase_amount: 0,
    used_amount: 0,
    requisition_count: 0,
    amount: 0,
});

const addInto = (target, row) => {
    target.requisition_amount += Number(row.requisition_amount || 0);
    target.purchase_amount += Number(row.purchase_amount || 0);
    target.used_amount += Number(row.used_amount || 0);
    target.requisition_count += Number(row.requisition_count || 0);
    target.amount += Number(row.amount || 0);
};

export default function SummaryReport() {
    const printRef = useRef();
    const [tab, setTab] = useState("product"); // product | cash
    const [periodMode, setPeriodMode] = useState("none"); // none | month | year
    const [dateFrom, setDateFrom] = useState(
        moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD")
    );
    const [dateTo, setDateTo] = useState(
        moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD")
    );
    const [scopeYear, setScopeYear] = useState(moment().year());
    const [selectedMonths, setSelectedMonths] = useState([
        moment().month() + 1,
    ]);
    const [selectedYears, setSelectedYears] = useState([moment().year()]);
    const [department, setDepartment] = useState("");
    const [selectedDepartmentName, setSelectedDepartmentName] = useState("");
    const [category, setCategory] = useState("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [groupBy, setGroupBy] = useState("department");
    const [metrics, setMetrics] = useState({
        requisition_amount: true,
        purchase_amount: true,
        used_amount: true,
    });
    const [periods, setPeriods] = useState([]);
    const [results, setResults] = useState([]);

    const { data: departments } = useGetDepartmentByOrganizationBranchQuery();
    const [
        fetchProductSummary,
        { isLoading: isLoadingProduct },
    ] = useSummaryDepartmentCategoryMutation();
    const [
        fetchCashSummary,
        { isLoading: isLoadingCash },
    ] = useSummaryCashMutation();

    const isLoading = isLoadingProduct || isLoadingCash;
    const isCash = tab === "cash";

    const years = useMemo(() => {
        const list = [];
        for (let y = 2023; y <= moment().year(); y++) list.push(y);
        return list;
    }, []);
    const monthNames = moment.months();

    const enabledMetrics = useMemo(
        () => PRODUCT_METRICS.filter((m) => metrics[m.key]),
        [metrics]
    );

    const reportTitle = isCash
        ? "Cash Requisition Summary Report"
        : "Department & Category Wise Summary Report";

    const buildPeriods = () => {
        if (periodMode === "month") {
            return [...selectedMonths]
                .sort((a, b) => a - b)
                .map((m) => {
                    const start = moment({
                        year: scopeYear,
                        month: m - 1,
                        day: 1,
                    });
                    return {
                        key: `${scopeYear}-${String(m).padStart(2, "0")}`,
                        label: start.format("MMM YYYY"),
                        start: start
                            .clone()
                            .startOf("month")
                            .format("YYYY-MM-DD"),
                        end: start.clone().endOf("month").format("YYYY-MM-DD"),
                        periodParam: "month",
                    };
                });
        }
        if (periodMode === "year") {
            return [...selectedYears]
                .sort((a, b) => a - b)
                .map((y) => ({
                    key: String(y),
                    label: String(y),
                    start: `${y}-01-01`,
                    end: `${y}-12-31`,
                    periodParam: "year",
                }));
        }
        return [
            {
                key: "range",
                label:
                    dateFrom && dateTo
                        ? `${moment(dateFrom).format("DD MMM YY")} - ${moment(
                              dateTo
                          ).format("DD MMM YY")}`
                        : "Date Range",
                start: dateFrom,
                end: dateTo,
                periodParam: "none",
            },
        ];
    };

    const handleShow = async () => {
        const list = buildPeriods();
        if (!list.length) {
            alert("Please select at least one month/year.");
            return;
        }
        if (!isCash && !enabledMetrics.length) {
            alert("Please enable at least one column.");
            return;
        }
        const base = {};
        if (department) base.department_id = department;
        if (!isCash && category) base.category_id = category;
        const fetcher = isCash ? fetchCashSummary : fetchProductSummary;
        try {
            const res = await Promise.all(
                list.map((p) =>
                    fetcher({
                        ...base,
                        start_date: p.start,
                        end_date: p.end,
                        period: p.periodParam,
                    }).unwrap()
                )
            );
            setPeriods(list);
            setResults(res.map((r) => r?.rows ?? []));
        } catch (e) {
            setPeriods(list);
            setResults(list.map(() => []));
        }
    };

    const handleTabChange = (value) => {
        setTab(value);
        setPeriods([]);
        setResults([]);
    };

    const toggleMonth = (m) => {
        setSelectedMonths((prev) => {
            if (prev.includes(m)) {
                if (prev.length === 1) return prev;
                return prev.filter((x) => x !== m);
            }
            if (prev.length >= 12) return prev;
            return [...prev, m];
        });
    };

    const toggleYear = (y) => {
        setSelectedYears((prev) => {
            if (prev.includes(y)) {
                if (prev.length === 1) return prev;
                return prev.filter((x) => x !== y);
            }
            return [...prev, y];
        });
    };

    // Build grouped comparison structure
    const comparison = useMemo(() => {
        const groupIndex = new Map();
        const groups = [];
        results.forEach((rows, pi) => {
            (rows || []).forEach((r) => {
                const gId =
                    isCash || groupBy === "department"
                        ? r.department_id
                        : r.category_id;
                const gName =
                    isCash || groupBy === "department"
                        ? r.department_name
                        : r.category_title;
                const sId = isCash
                    ? null
                    : groupBy === "department"
                    ? r.category_id
                    : r.department_id;
                const sName = isCash
                    ? null
                    : groupBy === "department"
                    ? r.category_title
                    : r.department_name;

                const gKey = String(gId ?? "0");
                if (!groupIndex.has(gKey)) {
                    const g = {
                        key: gKey,
                        name: gName || "N/A",
                        totals: results.map(() => emptyCell()),
                        subs: [],
                        subIndex: new Map(),
                    };
                    groups.push(g);
                    groupIndex.set(gKey, g);
                }
                const g = groupIndex.get(gKey);
                addInto(g.totals[pi], r);

                const sKey = String(sId ?? "0");
                if (!g.subIndex.has(sKey)) {
                    const s = {
                        key: sKey,
                        name: sName || "N/A",
                        values: results.map(() => emptyCell()),
                    };
                    g.subs.push(s);
                    g.subIndex.set(sKey, s);
                }
                addInto(g.subIndex.get(sKey).values[pi], r);
            });
        });

        const grand = results.map(() => emptyCell());
        groups.forEach((g) =>
            g.totals.forEach((t, pi) => addInto(grand[pi], t))
        );

        const grandAll = emptyCell();
        grand.forEach((c) => addInto(grandAll, c));

        return { groups, grand, grandAll };
    }, [results, groupBy, isCash]);

    const hasData = comparison.groups.length > 0;

    const chart = useMemo(() => {
        const byPeriod = periods.length >= 2;
        if (isCash) {
            const data = byPeriod
                ? periods.map((p, pi) => ({
                      name: p.label,
                      amount: comparison.grand[pi]?.amount ?? 0,
                  }))
                : comparison.groups.map((g) => ({
                      name: g.name,
                      amount: g.totals[0]?.amount ?? 0,
                  }));
            return {
                data,
                series: [
                    {
                        key: "amount",
                        label: "Approved Amount",
                        color: "#0ea5e9",
                    },
                ],
                xLabel: byPeriod ? "Period" : "Department",
            };
        }
        const data = byPeriod
            ? periods.map((p, pi) => {
                  const row = { name: p.label };
                  enabledMetrics.forEach((m) => {
                      row[m.key] = comparison.grand[pi]?.[m.key] ?? 0;
                  });
                  return row;
              })
            : comparison.groups.map((g) => {
                  const row = { name: g.name };
                  enabledMetrics.forEach((m) => {
                      row[m.key] = g.totals[0]?.[m.key] ?? 0;
                  });
                  return row;
              });
        return {
            data,
            series: enabledMetrics.map((m) => ({
                key: m.key,
                label: m.label,
                color: m.color,
            })),
            xLabel:
                periods.length >= 2
                    ? "Period"
                    : groupBy === "department"
                    ? "Department"
                    : "Category",
        };
    }, [periods, comparison, enabledMetrics, isCash, groupBy]);

    const handleExportCsv = () => {
        if (!hasData) return;
        const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const header = [
            "Group",
            isCash
                ? "Department"
                : groupBy === "department"
                ? "Category"
                : "Department",
        ];
        periods.forEach((p) => {
            if (isCash) {
                header.push(
                    `${p.label} Requisitions`,
                    `${p.label} Approved Amount`
                );
            } else {
                enabledMetrics.forEach((m) =>
                    header.push(`${p.label} ${m.label}`)
                );
            }
        });
        const rowValues = (cells) =>
            cells.flatMap((v) =>
                isCash
                    ? [v.requisition_count, v.amount]
                    : enabledMetrics.map((m) => v[m.key])
            );

        let csv = "\ufeff" + header.map(esc).join(",") + "\n";
        comparison.groups.forEach((g) => {
            g.subs.forEach((s) => {
                csv +=
                    [g.name, s.name, ...rowValues(s.values)]
                        .map(esc)
                        .join(",") + "\n";
            });
            csv +=
                [g.name, "Subtotal", ...rowValues(g.totals)]
                    .map(esc)
                    .join(",") + "\n";
        });
        csv +=
            ["Grand Total", "", ...rowValues(comparison.grand)]
                .map(esc)
                .join(",") + "\n";

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const suffix =
            periodMode === "none"
                ? `${dateFrom}_to_${dateTo}`
                : periods.map((p) => p.key).join("_");
        link.download = `${tab}_summary_report_${suffix}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const periodDescription = periods.length
        ? periods.map((p) => p.label).join(", ")
        : "";

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Summary Report
                </h2>
            }
        >
            <Head>
                <title>Summary Report</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="shadow-lg">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange("product")}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                tab === "product"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Product Summary
                        </button>
                        <button
                            onClick={() => handleTabChange("cash")}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                tab === "cash"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Cash Summary
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="p-6 border-b border-gray-200 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                            {/* Period mode */}
                            <div className="flex flex-col">
                                <Label
                                    htmlFor="period_mode"
                                    value="Period"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <Select
                                    id="period_mode"
                                    value={periodMode}
                                    onChange={(e) =>
                                        setPeriodMode(e.target.value)
                                    }
                                >
                                    <option value="none">Date Range</option>
                                    <option value="month">
                                        Monthly (compare)
                                    </option>
                                    <option value="year">
                                        Yearly (compare)
                                    </option>
                                </Select>
                            </div>

                            {periodMode === "none" && (
                                <div className="flex flex-col sm:col-span-2">
                                    <Label
                                        htmlFor="date_range"
                                        value="Date Range"
                                        className="font-semibold text-gray-700 mb-1"
                                    />
                                    <Datepicker
                                        inputId="date_range"
                                        inputName="date_range"
                                        onChange={(d) => {
                                            setDateFrom(
                                                d.startDate
                                                    ? moment(
                                                          d.startDate
                                                      ).format("YYYY-MM-DD")
                                                    : ""
                                            );
                                            setDateTo(
                                                d.endDate
                                                    ? moment(d.endDate).format(
                                                          "YYYY-MM-DD"
                                                      )
                                                    : ""
                                            );
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholderText="Select date range"
                                        maxDate={new Date()}
                                        value={{
                                            startDate: dateFrom,
                                            endDate: dateTo,
                                        }}
                                    />
                                </div>
                            )}

                            {periodMode === "month" && (
                                <div className="flex flex-col">
                                    <Label
                                        htmlFor="scope_year"
                                        value="Year"
                                        className="font-semibold text-gray-700 mb-1"
                                    />
                                    <Select
                                        id="scope_year"
                                        value={scopeYear}
                                        onChange={(e) =>
                                            setScopeYear(Number(e.target.value))
                                        }
                                    >
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {/* Group By */}
                            {!isCash && (
                                <div className="flex flex-col">
                                    <Label
                                        htmlFor="group_by"
                                        value="Group By"
                                        className="font-semibold text-gray-700 mb-1"
                                    />
                                    <Select
                                        id="group_by"
                                        value={groupBy}
                                        onChange={(e) =>
                                            setGroupBy(e.target.value)
                                        }
                                    >
                                        <option value="department">
                                            Department wise
                                        </option>
                                        <option value="category">
                                            Category wise
                                        </option>
                                    </Select>
                                </div>
                            )}

                            {/* Department */}
                            <div className="flex flex-col">
                                <Label
                                    htmlFor="department_id"
                                    value="Department"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <Select
                                    id="department_id"
                                    value={department}
                                    onChange={(e) => {
                                        setDepartment(e.target.value);
                                        setSelectedDepartmentName(
                                            e.target.selectedOptions[0]?.text ||
                                                ""
                                        );
                                    }}
                                >
                                    <option value="">All Departments</option>
                                    {departments?.data?.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Category */}
                            {!isCash && (
                                <div className="flex flex-col">
                                    <Label
                                        htmlFor="category_id"
                                        value="Category"
                                        className="font-semibold text-gray-700 mb-1"
                                    />
                                    <AsyncPaginate
                                        defaultOptions
                                        name="category_id"
                                        id="category_id"
                                        className="select"
                                        classNames={{
                                            control: () => "select",
                                        }}
                                        onChange={(newValue) => {
                                            setCategory(newValue?.value ?? "");
                                            setSelectedCategoryName(
                                                newValue?.label || ""
                                            );
                                        }}
                                        additional={{ page: 1 }}
                                        loadOptions={loadCategory}
                                        placeholder="Select category..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Month multi-select */}
                        {periodMode === "month" && (
                            <div className="flex flex-col">
                                <Label
                                    value={`Select Months (${selectedMonths.length}/12)`}
                                    className="font-semibold text-gray-700 mb-2"
                                />
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {monthNames.map((m, i) => (
                                        <label
                                            key={m}
                                            className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedMonths.includes(
                                                    i + 1
                                                )}
                                                onChange={() =>
                                                    toggleMonth(i + 1)
                                                }
                                            />
                                            {m.slice(0, 3)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Year multi-select */}
                        {periodMode === "year" && (
                            <div className="flex flex-col">
                                <Label
                                    value="Select Years"
                                    className="font-semibold text-gray-700 mb-2"
                                />
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {years.map((y) => (
                                        <label
                                            key={y}
                                            className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedYears.includes(
                                                    y
                                                )}
                                                onChange={() => toggleYear(y)}
                                            />
                                            {y}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metric toggles */}
                        {!isCash && (
                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <Label
                                    value="Show Columns:"
                                    className="font-semibold text-gray-700"
                                />
                                {PRODUCT_METRICS.map((m) => (
                                    <label
                                        key={m.key}
                                        className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={metrics[m.key]}
                                            onChange={() =>
                                                setMetrics((prev) => ({
                                                    ...prev,
                                                    [m.key]: !prev[m.key],
                                                }))
                                            }
                                        />
                                        {m.label}
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                                onClick={handleShow}
                                isProcessing={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
                            >
                                Show Report
                            </Button>
                            <Button
                                onClick={handlePrint}
                                disabled={!hasData}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
                            >
                                Print
                            </Button>
                            <Button
                                onClick={handleExportCsv}
                                disabled={!hasData}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
                            >
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Printable Area */}
                    <div ref={printRef} className="print-content p-6">
                        <div className="print-header text-center mb-6 p-4">
                            <div className="mb-3">
                                <img
                                    src="/logo.svg"
                                    alt="Organization Logo"
                                    className="h-14 mx-auto print:h-10"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">
                                IsDB-Bangladesh Islamic Solidarity Educational
                                Wakf
                            </h2>
                            <div className="text-sm text-gray-600 mb-1">
                                IDB Bhaban (4th Floor), Rokeya Sharanee, Dhaka
                            </div>
                            <div className="text-lg font-semibold mt-3 mb-1">
                                {reportTitle}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                                {selectedDepartmentName && department
                                    ? `Department: ${selectedDepartmentName}`
                                    : "All Departments"}
                                {!isCash && selectedCategoryName && category
                                    ? ` • Category: ${selectedCategoryName}`
                                    : ""}
                            </div>
                            <div className="text-sm text-gray-500">
                                {periodDescription
                                    ? `Period: ${periodDescription}`
                                    : ""}
                            </div>
                        </div>

                        {hasData && (
                            <div className="print-no-break grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                {isCash ? (
                                    <>
                                        <KpiCard
                                            label="Total Requisitions"
                                            value={
                                                comparison.grandAll
                                                    .requisition_count
                                            }
                                            color="#0ea5e9"
                                        />
                                        <KpiCard
                                            label="Total Approved Amount"
                                            value={`৳ ${fmt(
                                                comparison.grandAll.amount
                                            )}`}
                                            color="#10b981"
                                        />
                                    </>
                                ) : (
                                    enabledMetrics.map((m) => (
                                        <KpiCard
                                            key={m.key}
                                            label={`Total ${m.label}`}
                                            value={`৳ ${fmt(
                                                comparison.grandAll[m.key]
                                            )}`}
                                            color={m.color}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {hasData && chart.data.length > 0 && (
                            <div className="print-no-break mb-6 border border-gray-200 rounded-lg p-4 bg-white">
                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                    {isCash
                                        ? "Approved Amount"
                                        : enabledMetrics
                                              .map((m) => m.label)
                                              .join(" vs ")}{" "}
                                    — by {chart.xLabel}
                                </div>
                                <div
                                    className="chart-box"
                                    style={{ width: "100%", height: 440 }}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={chart.data}
                                            margin={{
                                                top: 16,
                                                right: 16,
                                                left: 8,
                                                bottom:
                                                    chart.data.length > 6
                                                        ? 70
                                                        : 60,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12 }}
                                                interval={0}
                                                angle={
                                                    chart.data.length > 6
                                                        ? -30
                                                        : 0
                                                }
                                                textAnchor={
                                                    chart.data.length > 6
                                                        ? "end"
                                                        : "middle"
                                                }
                                                tickMargin={
                                                    chart.data.length > 6
                                                        ? 48
                                                        : 42
                                                }
                                                height={
                                                    chart.data.length > 6
                                                        ? 70
                                                        : 50
                                                }
                                            />
                                            <YAxis
                                                tickFormatter={fmtInt}
                                                tick={{ fontSize: 11 }}
                                                width={110}
                                            />
                                            <Tooltip
                                                formatter={(v) => `৳ ${fmt(v)}`}
                                                contentStyle={{
                                                    fontSize: 12,
                                                    borderRadius: 8,
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{ fontSize: 12 }}
                                            />
                                            {chart.series.map((s) => (
                                                <Bar
                                                    key={s.key}
                                                    dataKey={s.key}
                                                    name={s.label}
                                                    fill={s.color}
                                                    radius={[3, 3, 0, 0]}
                                                    maxBarSize={64}
                                                >
                                                    <LabelList
                                                        dataKey={s.key}
                                                        content={BarValueLabel}
                                                    />
                                                </Bar>
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {hasData ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th
                                                className="border border-gray-300 px-3 py-2 text-left font-semibold align-bottom"
                                                rowSpan={2}
                                            >
                                                {isCash
                                                    ? "Department"
                                                    : groupBy === "department"
                                                    ? "Category"
                                                    : "Department"}
                                            </th>
                                            {periods.map((p) => (
                                                <th
                                                    key={p.key}
                                                    colSpan={
                                                        isCash
                                                            ? 2
                                                            : enabledMetrics.length
                                                    }
                                                    className="border border-gray-300 px-3 py-2 text-center font-semibold"
                                                >
                                                    {p.label}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr className="bg-gray-100">
                                            {periods.map((p) =>
                                                isCash ? (
                                                    <Fragment key={p.key}>
                                                        <th className="border border-gray-300 px-2 py-1 text-right text-xs font-medium">
                                                            Requisitions
                                                        </th>
                                                        <th className="border border-gray-300 px-2 py-1 text-right text-xs font-medium">
                                                            Approved Amt
                                                        </th>
                                                    </Fragment>
                                                ) : (
                                                    enabledMetrics.map((m) => (
                                                        <th
                                                            key={`${p.key}-${m.key}`}
                                                            className="border border-gray-300 px-2 py-1 text-right text-xs font-medium"
                                                        >
                                                            {m.label}
                                                        </th>
                                                    ))
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.groups.map((g) => (
                                            <GroupBlock
                                                key={g.key}
                                                group={g}
                                                periods={periods}
                                                isCash={isCash}
                                                enabledMetrics={enabledMetrics}
                                            />
                                        ))}
                                        <tr className="bg-gray-200 font-bold">
                                            <td className="border border-gray-300 px-3 py-2">
                                                Grand Total
                                            </td>
                                            {periods.map((p, pi) =>
                                                isCash ? (
                                                    <Fragment key={p.key}>
                                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                                            {
                                                                (
                                                                    comparison
                                                                        .grand[
                                                                        pi
                                                                    ] ??
                                                                    emptyCell()
                                                                )
                                                                    .requisition_count
                                                            }
                                                        </td>
                                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                                            {fmt(
                                                                (
                                                                    comparison
                                                                        .grand[
                                                                        pi
                                                                    ] ??
                                                                    emptyCell()
                                                                ).amount
                                                            )}
                                                        </td>
                                                    </Fragment>
                                                ) : (
                                                    enabledMetrics.map((m) => (
                                                        <td
                                                            key={`${p.key}-${m.key}`}
                                                            className="border border-gray-300 px-3 py-2 text-right"
                                                        >
                                                            {fmt(
                                                                (comparison
                                                                    .grand[
                                                                    pi
                                                                ] ??
                                                                    emptyCell())[
                                                                    m.key
                                                                ]
                                                            )}
                                                        </td>
                                                    ))
                                                )
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                {isLoading
                                    ? "Loading report..."
                                    : "No data. Select filters and press Show Report."}
                            </div>
                        )}

                        {hasData && (
                            <div className="mt-6 pt-3 border-t border-gray-300 text-center text-xs text-gray-500">
                                Generated on{" "}
                                {moment().format("DD MMM YYYY, hh:mm A")}
                            </div>
                        )}
                    </div>
                </Card>

                <style jsx global>{`
                    .print-content td,
                    .print-content th {
                        font-variant-numeric: tabular-nums;
                    }
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-content,
                        .print-content * {
                            visibility: visible;
                        }
                        .print-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            background: white !important;
                            -webkit-print-color-adjust: exact;
                            color-adjust: exact;
                        }
                        table {
                            page-break-inside: auto;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                        .print-header {
                            border-bottom: 2px solid #1f2937;
                            padding-bottom: 10px !important;
                            margin-bottom: 14px !important;
                        }
                        .print-no-break {
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .print-content .kpi-card {
                            box-shadow: none !important;
                        }
                        .print-content .chart-box {
                            height: 380px !important;
                        }
                        .print-content table {
                            font-size: 10px !important;
                            width: 100% !important;
                        }
                        .print-content th,
                        .print-content td {
                            padding: 2px 4px !important;
                        }
                        .print-content img {
                            max-height: 56px !important;
                        }
                        @page {
                            margin: 0.4in;
                            size: A4 landscape;
                        }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}

function GroupBlock({ group, periods, isCash, enabledMetrics }) {
    return (
        <>
            <tr className="bg-gray-100 font-semibold">
                <td className="border border-gray-300 px-3 py-2">
                    {group.name}
                </td>
                {periods.map((p, pi) =>
                    isCash ? (
                        <Fragment key={p.key}>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                                {
                                    (group.totals[pi] ?? emptyCell())
                                        .requisition_count
                                }
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                                {fmt((group.totals[pi] ?? emptyCell()).amount)}
                            </td>
                        </Fragment>
                    ) : (
                        enabledMetrics.map((m) => (
                            <td
                                key={`${p.key}-${m.key}`}
                                className="border border-gray-300 px-3 py-2 text-right"
                            >
                                {fmt((group.totals[pi] ?? emptyCell())[m.key])}
                            </td>
                        ))
                    )
                )}
            </tr>
            {!isCash &&
                group.subs.map((s) => (
                    <tr key={s.key} className="text-gray-700">
                        <td className="border border-gray-300 px-3 py-1.5 pl-8">
                            • {s.name}
                        </td>
                        {periods.map((p, pi) =>
                            enabledMetrics.map((m) => (
                                <td
                                    key={`${p.key}-${m.key}`}
                                    className="border border-gray-300 px-3 py-1.5 text-right"
                                >
                                    {fmt((s.values[pi] ?? emptyCell())[m.key])}
                                </td>
                            ))
                        )}
                    </tr>
                ))}
        </>
    );
}

function KpiCard({ label, value, color }) {
    return (
        <div
            className="kpi-card rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
            </div>
            <div
                className="text-lg font-bold text-gray-800 mt-1"
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {value}
            </div>
        </div>
    );
}

function BarValueLabel(props) {
    const { viewBox, value } = props;
    const x = props.x ?? viewBox?.x;
    const y = props.y ?? viewBox?.y;
    const width = props.width ?? viewBox?.width;
    const height = props.height ?? viewBox?.height;
    if (!value || Number(value) <= 0 || x == null || height == null)
        return null;
    const text = fmtInt(value);
    const fontSize = 12;
    const barH = Math.abs(height || 0);
    const needed = text.length * fontSize * 0.62 + 8;
    const cx = x + width / 2;
    const fitsInside = barH >= needed;
    const ty = fitsInside ? y + barH / 2 : y + barH + 10 + needed / 2;
    return (
        <text
            x={0}
            y={0}
            transform={`translate(${cx}, ${ty}) rotate(-90)`}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={fitsInside ? "#ffffff" : "#374151"}
            fontSize={fontSize}
            fontWeight={700}
        >
            {text}
        </text>
    );
}
