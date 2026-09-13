import AppLayout from "@/components/Layouts/AppLayout";
import { loadCategory } from "@/lib/initial_requisition";
import {
    useSummaryDepartmentCategoryMutation,
    useSummaryCashMutation,
    useSummaryCategoryItemsMutation,
    useLazySummaryCashCategoryProposeQuery,
    useLazySummaryCashCategoryStatusQuery,
    useSummaryCashCategoryApproveMutation,
    useSummaryCashCategoryClassifyMutation,
    useSummaryCashCategoryReportMutation,
    useSummaryCashCategoryItemsMutation,
    useSummaryCashCategoryFuelMutation,
    useSummaryCashCategoryFuelItemsMutation,
} from "@/store/service/report";
import { useGetDepartmentByOrganizationBranchQuery } from "@/store/service/deparment";
import Head from "next/head";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";
import { AsyncPaginate } from "react-select-async-paginate";
import { useReactToPrint } from "react-to-print";
import { Button, Card, Checkbox, Label, Modal, Select } from "flowbite-react";
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
    const [detail, setDetail] = useState(null);
    const printChartRef = useRef(true);

    const { data: departments } = useGetDepartmentByOrganizationBranchQuery();
    const [
        fetchProductSummary,
        { isLoading: isLoadingProduct },
    ] = useSummaryDepartmentCategoryMutation();
    const [
        fetchCashSummary,
        { isLoading: isLoadingCash },
    ] = useSummaryCashMutation();
    const [fetchCategoryItems] = useSummaryCategoryItemsMutation();

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

    const openCategoryDetail = async ({
        categoryId,
        categoryName,
        departmentId,
        departmentName,
    }) => {
        if (!categoryId || categoryId === "0") return;
        const list = periods.length ? periods : buildPeriods();
        setDetail({
            categoryId,
            categoryName,
            departmentId: departmentId || department || null,
            departmentName: departmentName || selectedDepartmentName || null,
            loading: true,
            periods: list,
            rows: [],
        });
        const base = { category_id: categoryId };
        const dept = departmentId || department;
        if (dept) base.department_id = dept;
        try {
            const res = await Promise.all(
                list.map((p) =>
                    fetchCategoryItems({
                        ...base,
                        start_date: p.start,
                        end_date: p.end,
                        period: p.periodParam,
                    }).unwrap()
                )
            );
            setDetail((d) =>
                d
                    ? {
                          ...d,
                          loading: false,
                          rows: res.map((r) => r?.rows ?? []),
                      }
                    : d
            );
        } catch (e) {
            setDetail((d) =>
                d ? { ...d, loading: false, rows: list.map(() => []) } : d
            );
        }
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
        onBeforeGetContent: () => {
            if (printRef.current) {
                if (printChartRef.current) {
                    printRef.current.classList.remove("hide-chart");
                } else {
                    printRef.current.classList.add("hide-chart");
                }
            }
        },
        onAfterPrint: () => {
            printRef.current?.classList.remove("hide-chart");
        },
    });

    const printWithChart = () => {
        printChartRef.current = true;
        handlePrint();
    };

    const printWithoutChart = () => {
        printChartRef.current = false;
        handlePrint();
    };

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
                        <button
                            onClick={() => handleTabChange("cash_category")}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                tab === "cash_category"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Cash Categories (AI)
                        </button>
                    </div>

                    {tab === "cash_category" ? (
                        <CashCategoryTab />
                    ) : (
                        <>
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
                                            <option value="none">
                                                Date Range
                                            </option>
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
                                                              ).format(
                                                                  "YYYY-MM-DD"
                                                              )
                                                            : ""
                                                    );
                                                    setDateTo(
                                                        d.endDate
                                                            ? moment(
                                                                  d.endDate
                                                              ).format(
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
                                                    setScopeYear(
                                                        Number(e.target.value)
                                                    )
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
                                                    e.target.selectedOptions[0]
                                                        ?.text || ""
                                                );
                                            }}
                                        >
                                            <option value="">
                                                All Departments
                                            </option>
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
                                                    setCategory(
                                                        newValue?.value ?? ""
                                                    );
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
                                                        onChange={() =>
                                                            toggleYear(y)
                                                        }
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
                                                            [m.key]: !prev[
                                                                m.key
                                                            ],
                                                        }))
                                                    }
                                                />
                                                {m.label}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {!isCash && hasData && (
                                    <div className="text-xs text-gray-500">
                                        Tip: category name-এ click করলে
                                        item-wise (approved / purchase / used)
                                        detail দেখা যাবে।
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
                                        onClick={printWithChart}
                                        disabled={!hasData}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md"
                                    >
                                        Print (with chart)
                                    </Button>
                                    <Button
                                        onClick={printWithoutChart}
                                        disabled={!hasData}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md"
                                    >
                                        Print (no chart)
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
                                        IsDB-Bangladesh Islamic Solidarity
                                        Educational Wakf
                                    </h2>
                                    <div className="text-sm text-gray-600 mb-1">
                                        IDB Bhaban (4th Floor), Rokeya Sharanee,
                                        Dhaka
                                    </div>
                                    <div className="text-lg font-semibold mt-3 mb-1">
                                        {reportTitle}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        {selectedDepartmentName && department
                                            ? `Department: ${selectedDepartmentName}`
                                            : "All Departments"}
                                        {!isCash &&
                                        selectedCategoryName &&
                                        category
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
                                                        comparison.grandAll
                                                            .amount
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
                                                        comparison.grandAll[
                                                            m.key
                                                        ]
                                                    )}`}
                                                    color={m.color}
                                                />
                                            ))
                                        )}
                                    </div>
                                )}

                                {hasData && chart.data.length > 0 && (
                                    <div className="chart-section print-no-break mb-6 border border-gray-200 rounded-lg p-4 bg-white">
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
                                            style={{
                                                width: "100%",
                                                height: 440,
                                            }}
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
                                                            chart.data.length >
                                                            6
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
                                                            chart.data.length >
                                                            6
                                                                ? -30
                                                                : 0
                                                        }
                                                        textAnchor={
                                                            chart.data.length >
                                                            6
                                                                ? "end"
                                                                : "middle"
                                                        }
                                                        tickMargin={
                                                            chart.data.length >
                                                            6
                                                                ? 48
                                                                : 42
                                                        }
                                                        height={
                                                            chart.data.length >
                                                            6
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
                                                        formatter={(v) =>
                                                            `৳ ${fmt(v)}`
                                                        }
                                                        contentStyle={{
                                                            fontSize: 12,
                                                            borderRadius: 8,
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{
                                                            fontSize: 12,
                                                        }}
                                                    />
                                                    {chart.series.map((s) => (
                                                        <Bar
                                                            key={s.key}
                                                            dataKey={s.key}
                                                            name={s.label}
                                                            fill={s.color}
                                                            radius={[
                                                                3,
                                                                3,
                                                                0,
                                                                0,
                                                            ]}
                                                            maxBarSize={64}
                                                        >
                                                            <LabelList
                                                                dataKey={s.key}
                                                                content={
                                                                    BarValueLabel
                                                                }
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
                                                            : groupBy ===
                                                              "department"
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
                                                            <Fragment
                                                                key={p.key}
                                                            >
                                                                <th className="border border-gray-300 px-2 py-1 text-right text-xs font-medium">
                                                                    Requisitions
                                                                </th>
                                                                <th className="border border-gray-300 px-2 py-1 text-right text-xs font-medium">
                                                                    Approved Amt
                                                                </th>
                                                            </Fragment>
                                                        ) : (
                                                            enabledMetrics.map(
                                                                (m) => (
                                                                    <th
                                                                        key={`${p.key}-${m.key}`}
                                                                        className="border border-gray-300 px-2 py-1 text-right text-xs font-medium"
                                                                    >
                                                                        {
                                                                            m.label
                                                                        }
                                                                    </th>
                                                                )
                                                            )
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
                                                        enabledMetrics={
                                                            enabledMetrics
                                                        }
                                                        groupBy={groupBy}
                                                        onCategoryClick={
                                                            openCategoryDetail
                                                        }
                                                    />
                                                ))}
                                                <tr className="bg-gray-200 font-bold">
                                                    <td className="border border-gray-300 px-3 py-2">
                                                        Grand Total
                                                    </td>
                                                    {periods.map((p, pi) =>
                                                        isCash ? (
                                                            <Fragment
                                                                key={p.key}
                                                            >
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
                                                            enabledMetrics.map(
                                                                (m) => (
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
                                                                                m
                                                                                    .key
                                                                            ]
                                                                        )}
                                                                    </td>
                                                                )
                                                            )
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
                                        {moment().format(
                                            "DD MMM YYYY, hh:mm A"
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>

                {detail && (
                    <ItemDetailModal
                        detail={detail}
                        enabledMetrics={enabledMetrics}
                        onClose={() => setDetail(null)}
                    />
                )}

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
                        .print-content.hide-chart .chart-section {
                            display: none !important;
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

function GroupBlock({
    group,
    periods,
    isCash,
    enabledMetrics,
    groupBy,
    onCategoryClick,
}) {
    const groupClickable =
        !isCash && groupBy === "category" && group.key !== "0";
    const subClickable = !isCash && groupBy === "department";
    return (
        <>
            <tr className="bg-gray-100 font-semibold">
                <td className="border border-gray-300 px-3 py-2">
                    {groupClickable ? (
                        <button
                            type="button"
                            onClick={() =>
                                onCategoryClick({
                                    categoryId: group.key,
                                    categoryName: group.name,
                                })
                            }
                            className="text-blue-700 hover:underline print:text-gray-800 print:no-underline"
                            title="Click to see item details"
                        >
                            {group.name}
                        </button>
                    ) : (
                        group.name
                    )}
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
                            <span className="text-gray-400">•</span>{" "}
                            {subClickable && s.key !== "0" ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onCategoryClick({
                                            categoryId: s.key,
                                            categoryName: s.name,
                                            departmentId: group.key,
                                            departmentName: group.name,
                                        })
                                    }
                                    className="text-blue-700 hover:underline print:text-gray-700 print:no-underline"
                                    title="Click to see item details"
                                >
                                    {s.name}
                                </button>
                            ) : (
                                s.name
                            )}
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

function ItemDetailModal({ detail, enabledMetrics, onClose }) {
    const printRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });
    const cols = enabledMetrics.length ? enabledMetrics : PRODUCT_METRICS;

    const combined = useMemo(() => {
        const periods = detail.periods || [];
        const map = new Map();
        (detail.rows || []).forEach((rows, pi) => {
            (rows || []).forEach((r) => {
                const key = String(r.product_id ?? "0");
                if (!map.has(key)) {
                    map.set(key, {
                        product_id: r.product_id,
                        product_title: r.product_title || "N/A",
                        values: periods.map(() => ({
                            requisition_amount: 0,
                            purchase_amount: 0,
                            used_amount: 0,
                        })),
                    });
                }
                const cell = map.get(key).values[pi];
                if (cell) {
                    cell.requisition_amount += Number(
                        r.requisition_amount || 0
                    );
                    cell.purchase_amount += Number(r.purchase_amount || 0);
                    cell.used_amount += Number(r.used_amount || 0);
                }
            });
        });
        const rows = Array.from(map.values()).sort((a, b) =>
            a.product_title.localeCompare(b.product_title)
        );
        const totals = periods.map((_, pi) => {
            const t = {
                requisition_amount: 0,
                purchase_amount: 0,
                used_amount: 0,
            };
            rows.forEach((r) => {
                const c = r.values[pi];
                if (c) {
                    t.requisition_amount += c.requisition_amount;
                    t.purchase_amount += c.purchase_amount;
                    t.used_amount += c.used_amount;
                }
            });
            return t;
        });
        return { rows, totals };
    }, [detail]);

    const periodDescription = (detail.periods || [])
        .map((p) => p.label)
        .join(", ");

    return (
        <Modal show onClose={onClose} size="5xl">
            <Modal.Header>
                <span className="text-base font-semibold">
                    {detail.categoryName}
                    {detail.departmentName ? ` · ${detail.departmentName}` : ""}
                </span>
            </Modal.Header>
            <Modal.Body>
                <div ref={printRef} className="print-content p-2">
                    <div className="print-header text-center mb-4 p-2">
                        <img
                            src="/logo.svg"
                            alt="Organization Logo"
                            className="h-12 mx-auto mb-2"
                        />
                        <h2 className="text-lg font-bold text-gray-800">
                            IsDB-Bangladesh Islamic Solidarity Educational Wakf
                        </h2>
                        <div className="text-sm text-gray-600">
                            IDB Bhaban (4th Floor), Rokeya Sharanee, Dhaka
                        </div>
                        <div className="text-base font-semibold mt-2">
                            Category Item Detail
                        </div>
                        <div className="text-sm text-gray-600">
                            Category: {detail.categoryName}
                            {detail.departmentName
                                ? ` • Department: ${detail.departmentName}`
                                : ""}
                        </div>
                        <div className="text-sm text-gray-500">
                            {periodDescription
                                ? `Period: ${periodDescription}`
                                : ""}
                        </div>
                    </div>

                    {detail.loading ? (
                        <div className="text-center text-gray-500 py-8">
                            Loading items...
                        </div>
                    ) : combined.rows.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th
                                            className="border border-gray-300 px-3 py-2 text-left font-semibold align-bottom"
                                            rowSpan={2}
                                        >
                                            Item
                                        </th>
                                        {(detail.periods || []).map((p) => (
                                            <th
                                                key={p.key}
                                                colSpan={cols.length}
                                                className="border border-gray-300 px-3 py-2 text-center font-semibold"
                                            >
                                                {p.label}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="bg-gray-100">
                                        {(detail.periods || []).map((p) =>
                                            cols.map((m) => (
                                                <th
                                                    key={`${p.key}-${m.key}`}
                                                    className="border border-gray-300 px-2 py-1 text-right text-xs font-medium"
                                                >
                                                    {m.label}
                                                </th>
                                            ))
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {combined.rows.map((r) => (
                                        <tr
                                            key={
                                                r.product_id ?? r.product_title
                                            }
                                        >
                                            <td className="border border-gray-300 px-3 py-1.5">
                                                {r.product_title}
                                            </td>
                                            {(detail.periods || []).map(
                                                (p, pi) =>
                                                    cols.map((m) => (
                                                        <td
                                                            key={`${p.key}-${m.key}`}
                                                            className="border border-gray-300 px-3 py-1.5 text-right"
                                                        >
                                                            {fmt(
                                                                r.values[pi]?.[
                                                                    m.key
                                                                ]
                                                            )}
                                                        </td>
                                                    ))
                                            )}
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-200 font-bold">
                                        <td className="border border-gray-300 px-3 py-2">
                                            Total
                                        </td>
                                        {(detail.periods || []).map((p, pi) =>
                                            cols.map((m) => (
                                                <td
                                                    key={`${p.key}-${m.key}`}
                                                    className="border border-gray-300 px-3 py-2 text-right"
                                                >
                                                    {fmt(
                                                        combined.totals[pi]?.[
                                                            m.key
                                                        ]
                                                    )}
                                                </td>
                                            ))
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            No items found.
                        </div>
                    )}

                    <div className="mt-4 pt-2 border-t border-gray-300 text-center text-xs text-gray-500">
                        Generated on {moment().format("DD MMM YYYY, hh:mm A")}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={handlePrint}
                    disabled={detail.loading || !combined.rows.length}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                    Print
                </Button>
                <Button color="gray" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function CashCategoryTab() {
    const printRef = useRef();
    const [status, setStatus] = useState({
        categories: [],
        pending: 0,
        total_items: 0,
        total_purposes: 0,
        classified: 0,
    });
    const [proposal, setProposal] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [busy, setBusy] = useState("");
    const [report, setReport] = useState(null);
    const [fuel, setFuel] = useState(null);
    const [drill, setDrill] = useState(null);
    const [fuelDrill, setFuelDrill] = useState(null);

    const [periodMode, setPeriodMode] = useState("none");
    const [dateFrom, setDateFrom] = useState(
        moment().subtract(11, "month").startOf("month").format("YYYY-MM-DD")
    );
    const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
    const [year, setYear] = useState(moment().year());
    const [month, setMonth] = useState(moment().month() + 1);
    const [department, setDepartment] = useState("");

    const { data: departments } = useGetDepartmentByOrganizationBranchQuery();
    const [triggerPropose] = useLazySummaryCashCategoryProposeQuery();
    const [triggerStatus] = useLazySummaryCashCategoryStatusQuery();
    const [approve] = useSummaryCashCategoryApproveMutation();
    const [classify] = useSummaryCashCategoryClassifyMutation();
    const [fetchReport] = useSummaryCashCategoryReportMutation();
    const [fetchItems] = useSummaryCashCategoryItemsMutation();
    const [fetchFuel] = useSummaryCashCategoryFuelMutation();
    const [fetchFuelItems] = useSummaryCashCategoryFuelItemsMutation();

    const months = moment.months();
    const years = useMemo(() => {
        const list = [];
        for (let y = 2023; y <= moment().year(); y++) list.push(y);
        return list;
    }, []);

    const loadStatus = async () => {
        try {
            const s = await triggerStatus().unwrap();
            setStatus(s);
        } catch (e) {
            // ignore
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const autoLoadedRef = useRef(false);
    useEffect(() => {
        if (
            !autoLoadedRef.current &&
            !busy &&
            status.pending === 0 &&
            (status.categories || []).length > 0 &&
            !report
        ) {
            autoLoadedRef.current = true;
            handleShow();
        }
    }, [busy, status, report]);

    // Poll while classifying
    useEffect(() => {
        if (busy !== "classify") return;
        const t = setInterval(async () => {
            try {
                const s = await triggerStatus().unwrap();
                setStatus(s);
                if (s.pending === 0) setBusy("");
            } catch (e) {
                // keep polling
            }
        }, 4000);
        return () => clearInterval(t);
    }, [busy]);

    const resolveRange = () => {
        if (periodMode === "year") {
            return { start: `${year}-01-01`, end: `${year}-12-31` };
        }
        if (periodMode === "month") {
            const m = moment({ year, month: month - 1, day: 1 });
            return {
                start: m.clone().startOf("month").format("YYYY-MM-DD"),
                end: m.clone().endOf("month").format("YYYY-MM-DD"),
            };
        }
        return { start: dateFrom, end: dateTo };
    };

    const handleGenerate = async () => {
        setBusy("propose");
        try {
            const res = await triggerPropose({ max: 14 }).unwrap();
            setProposal(res.categories || []);
        } catch (e) {
            alert("Could not generate categories. Please try again.");
        } finally {
            setBusy("");
        }
    };

    const handleApprove = async () => {
        const cats = (proposal || []).map((c) => c.trim()).filter(Boolean);
        if (!cats.length) {
            alert("Please keep at least one category.");
            return;
        }
        setBusy("approve");
        try {
            await approve({ categories: cats }).unwrap();
            setProposal(null);
            await loadStatus();
            setBusy("classify");
            await classify({}).unwrap();
        } catch (e) {
            alert("Could not approve categories.");
            setBusy("");
        }
    };

    const handleClassify = async (force = false) => {
        setBusy("classify");
        try {
            await classify({ force }).unwrap();
        } catch (e) {
            alert("Could not start classification.");
            setBusy("");
        }
    };

    const handleShow = async () => {
        setBusy("report");
        const range = resolveRange();
        const params = {
            start_date: range.start,
            end_date: range.end,
            period: periodMode,
        };
        if (department) params.department_id = department;
        try {
            const [r, f] = await Promise.all([
                fetchReport(params).unwrap(),
                fetchFuel(params)
                    .unwrap()
                    .catch(() => null),
            ]);
            setReport({ ...r, range });
            setFuel(f);
        } catch (e) {
            alert("Could not load the report.");
        } finally {
            setBusy("");
        }
    };

    const openDrill = async (category) => {
        const range = resolveRange();
        const params = {
            category,
            start_date: range.start,
            end_date: range.end,
            period: periodMode,
        };
        if (department) params.department_id = department;
        setDrill({ category, loading: true, rows: [] });
        try {
            const r = await fetchItems(params).unwrap();
            setDrill({ category, loading: false, rows: r.rows || [] });
        } catch (e) {
            setDrill({ category, loading: false, rows: [] });
        }
    };

    const openFuelDrill = async () => {
        const range = resolveRange();
        const params = {
            start_date: range.start,
            end_date: range.end,
        };
        if (department) params.department_id = department;
        setFuelDrill({ loading: true, rows: [] });
        try {
            const r = await fetchFuelItems(params).unwrap();
            setFuelDrill({ loading: false, rows: r.rows || [] });
        } catch (e) {
            setFuelDrill({ loading: false, rows: [] });
        }
    };

    const rows = useMemo(() => {
        if (!report?.rows) return [];
        const list = report.rows
            .filter((r) => r.amount > 0)
            .map((r) => ({ ...r }))
            .sort((a, b) => b.amount - a.amount);
        return list;
    }, [report]);

    const totalAmount = report?.total_amount ?? 0;

    const chartData = useMemo(() => {
        const top = rows.slice(0, 11);
        const rest = rows.slice(11);
        const data = top.map((r) => ({ name: r.category, amount: r.amount }));
        if (rest.length) {
            data.push({
                name: "Others",
                amount: rest.reduce((s, r) => s + r.amount, 0),
            });
        }
        return data;
    }, [rows]);

    const handlePrint = useReactToPrint({ content: () => printRef.current });

    const handleExportCsv = () => {
        if (!rows.length) return;
        const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        let csv = "\ufeffCategory,Requisitions,Amount,% of Total\n";
        rows.forEach((r) => {
            const pct = totalAmount
                ? ((r.amount / totalAmount) * 100).toFixed(1)
                : "0.0";
            csv +=
                [esc(r.category), r.requisition_count, r.amount, pct].join(
                    ","
                ) + "\n";
        });
        csv += [esc("Total"), "", totalAmount, "100.0"].join(",") + "\n";

        if (fuel && fuel.rows && fuel.rows.length) {
            csv += "\n";
            csv +=
                [
                    "Vehicle Fuel (Actual)",
                    "Entries",
                    "Quantity (ltr)",
                    "Avg Rate",
                    "Cost",
                    "Mileage (km)",
                ]
                    .map(esc)
                    .join(",") + "\n";
            fuel.rows.forEach((v) => {
                csv +=
                    [
                        esc(v.vehicle),
                        v.entries,
                        v.quantity,
                        v.average_rate,
                        v.cost,
                        v.mileage,
                    ].join(",") + "\n";
            });
            csv +=
                [
                    esc("Total"),
                    fuel.totals.entries,
                    fuel.totals.quantity,
                    fuel.totals.average_rate,
                    fuel.totals.cost,
                    fuel.totals.mileage,
                ].join(",") + "\n";
            csv +=
                [esc("Cash estimate"), "", "", "", fuel.cash_estimate, ""].join(
                    ","
                ) + "\n";
            csv +=
                [
                    esc("Variance (estimate - actual)"),
                    "",
                    "",
                    "",
                    fuel.variance,
                    "",
                ].join(",") + "\n";
        }

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `cash_category_report_${report?.range?.start}_to_${report?.range?.end}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasCategories = (status.categories || []).length > 0;

    return (
        <div className="p-6">
            {/* Status / setup */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-700">
                        {loadingStatus ? (
                            "Loading..."
                        ) : (
                            <>
                                Approved categories:{" "}
                                <b>{status.categories.length}</b> &nbsp;•&nbsp;
                                Items:{" "}
                                <b>
                                    {status.total_items ??
                                        status.total_purposes}
                                </b>{" "}
                                &nbsp;•&nbsp; Classified:{" "}
                                <b>{status.classified}</b> &nbsp;•&nbsp;
                                Pending:{" "}
                                <b
                                    className={
                                        status.pending
                                            ? "text-red-600"
                                            : "text-green-600"
                                    }
                                >
                                    {status.pending}
                                </b>
                            </>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            color="light"
                            size="sm"
                            onClick={handleGenerate}
                            isProcessing={busy === "propose"}
                        >
                            {hasCategories
                                ? "Regenerate Categories (AI)"
                                : "Generate Categories (AI)"}
                        </Button>
                        {hasCategories && status.pending > 0 && (
                            <Button
                                color="warning"
                                size="sm"
                                onClick={() => handleClassify(false)}
                                isProcessing={busy === "classify"}
                            >
                                Classify {status.pending} pairs
                            </Button>
                        )}
                        {hasCategories &&
                            status.pending === 0 &&
                            rows.length > 0 && (
                                <Button
                                    color="light"
                                    size="sm"
                                    onClick={() => handleClassify(true)}
                                    isProcessing={busy === "classify"}
                                >
                                    Re-classify
                                </Button>
                            )}
                    </div>
                </div>

                {hasCategories && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {status.categories.map((c) => (
                            <span
                                key={c}
                                className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Proposal editor */}
            {proposal !== null && (
                <div className="mb-6 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
                    <div className="mb-2 font-semibold text-blue-900">
                        Proposed categories — edit if needed, then approve
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {proposal.map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    value={c}
                                    onChange={(e) => {
                                        const next = [...proposal];
                                        next[i] = e.target.value;
                                        setProposal(next);
                                    }}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                />
                                <button
                                    type="button"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() =>
                                        setProposal(
                                            proposal.filter((_, j) => j !== i)
                                        )
                                    }
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleApprove}
                            isProcessing={busy === "approve"}
                        >
                            Approve & Classify
                        </Button>
                        <Button
                            size="sm"
                            color="light"
                            onClick={() => setProposal([...proposal, ""])}
                        >
                            + Add category
                        </Button>
                        <Button
                            size="sm"
                            color="gray"
                            onClick={() => setProposal(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Report controls */}
            {hasCategories && status.pending === 0 && !proposal && (
                <>
                    <div className="mb-4 flex flex-wrap items-end gap-3">
                        <div className="flex flex-col">
                            <Label
                                value="Period"
                                className="font-semibold text-gray-700 mb-1"
                            />
                            <Select
                                value={periodMode}
                                onChange={(e) => setPeriodMode(e.target.value)}
                                sizing="sm"
                            >
                                <option value="none">Date Range</option>
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                            </Select>
                        </div>
                        {periodMode === "none" && (
                            <div className="flex flex-col">
                                <Label
                                    value="Date Range"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <Datepicker
                                    onChange={(d) => {
                                        setDateFrom(
                                            d.startDate
                                                ? moment(d.startDate).format(
                                                      "YYYY-MM-DD"
                                                  )
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
                                    className="border rounded-lg px-3 py-2"
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
                                    value="Month"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <Select
                                    value={month}
                                    onChange={(e) =>
                                        setMonth(Number(e.target.value))
                                    }
                                    sizing="sm"
                                >
                                    {months.map((m, i) => (
                                        <option key={m} value={i + 1}>
                                            {m}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                        {(periodMode === "month" || periodMode === "year") && (
                            <div className="flex flex-col">
                                <Label
                                    value="Year"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <Select
                                    value={year}
                                    onChange={(e) =>
                                        setYear(Number(e.target.value))
                                    }
                                    sizing="sm"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                        <div className="flex flex-col min-w-[180px]">
                            <Label
                                value="Department"
                                className="font-semibold text-gray-700 mb-1"
                            />
                            <Select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                sizing="sm"
                            >
                                <option value="">All Departments</option>
                                {departments?.data?.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleShow}
                            isProcessing={busy === "report"}
                        >
                            Show Report
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!rows.length}
                            onClick={handlePrint}
                        >
                            Print
                        </Button>
                        <Button
                            size="sm"
                            color="gray"
                            disabled={!rows.length}
                            onClick={handleExportCsv}
                        >
                            Export CSV
                        </Button>
                    </div>
                </>
            )}

            {/* Results */}
            {report && (
                <div ref={printRef} className="print-content p-2">
                    <div className="print-header text-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            IsDB-Bangladesh Islamic Solidarity Educational Wakf
                        </h2>
                        <div className="text-base font-semibold mt-1">
                            Cash Requisition — Expense Category Report
                        </div>
                        <div className="text-sm text-gray-500">
                            Period:{" "}
                            {moment(report.range.start).format("DD MMM YYYY")} -{" "}
                            {moment(report.range.end).format("DD MMM YYYY")}
                        </div>
                    </div>

                    <div className="print-no-break mb-6 border border-gray-200 rounded-lg p-4">
                        <div style={{ width: "100%", height: 340 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        right: 16,
                                        left: 20,
                                        bottom: 90,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e5e7eb"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        interval={0}
                                        angle={-40}
                                        textAnchor="end"
                                        height={90}
                                    />
                                    <YAxis
                                        tickFormatter={fmtInt}
                                        tick={{ fontSize: 11 }}
                                        width={110}
                                    />
                                    <Tooltip formatter={(v) => `৳ ${fmt(v)}`} />
                                    <Bar
                                        dataKey="amount"
                                        name="Amount"
                                        fill="#10b981"
                                        radius={[3, 3, 0, 0]}
                                    >
                                        <LabelList
                                            dataKey="amount"
                                            content={BarValueLabel}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                                        Category
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                        Requisitions
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                        Amount
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                        % of Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.category}>
                                        <td className="border border-gray-300 px-3 py-1.5">
                                            {r.category === "Uncategorized" ? (
                                                r.category
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        r.category === "Fuel"
                                                            ? openFuelDrill()
                                                            : openDrill(
                                                                  r.category
                                                              )
                                                    }
                                                    className="text-blue-700 hover:underline print:text-gray-800 print:no-underline"
                                                >
                                                    {r.category}
                                                </button>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1.5 text-right">
                                            {r.requisition_count}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1.5 text-right">
                                            {fmt(r.amount)}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1.5 text-right">
                                            {totalAmount
                                                ? (
                                                      (r.amount / totalAmount) *
                                                      100
                                                  ).toFixed(1)
                                                : "0.0"}
                                            %
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-200 font-bold">
                                    <td className="border border-gray-300 px-3 py-2">
                                        Total
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2" />
                                    <td className="border border-gray-300 px-3 py-2 text-right">
                                        {fmt(totalAmount)}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-right">
                                        100.0%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {fuel && fuel.rows && fuel.rows.length > 0 && (
                        <div className="mt-6 print-no-break">
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                                Vehicle Fuel (Actual) — from refuel records
                                (vehicle_histories)
                            </div>
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                                            Vehicle
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                            Entries
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                            Quantity (ltr)
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                            Avg Rate
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                            Cost
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                            Mileage (km)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fuel.rows.map((v) => (
                                        <tr key={v.vehicle_id ?? v.vehicle}>
                                            <td className="border border-gray-300 px-3 py-1.5">
                                                {v.vehicle}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {v.entries}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(v.quantity)}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(v.average_rate)}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(v.cost)}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(v.mileage)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-200 font-bold">
                                        <td className="border border-gray-300 px-3 py-2">
                                            Total
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fuel.totals.entries}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fmt(fuel.totals.quantity)}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fmt(fuel.totals.average_rate)}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fmt(fuel.totals.cost)}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fmt(fuel.totals.mileage)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="mt-2 text-xs text-gray-600">
                                Cash estimate: ৳ {fmt(fuel.cash_estimate)} |
                                Actual fuel cost: ৳ {fmt(fuel.totals.cost)} |
                                Variance: ৳ {fmt(fuel.variance)}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-2 border-t border-gray-300 text-center text-xs text-gray-500">
                        Generated on {moment().format("DD MMM YYYY, hh:mm A")}
                    </div>
                </div>
            )}

            {/* Drill-down modal */}
            <Modal show={!!drill} onClose={() => setDrill(null)} size="4xl">
                <Modal.Header>{drill?.category}</Modal.Header>
                <Modal.Body>
                    {drill?.loading ? (
                        <div className="py-8 text-center text-gray-500">
                            Loading...
                        </div>
                    ) : (
                        <table className="min-w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-3 py-2 text-left">
                                        Item
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left">
                                        Unit
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left">
                                        Purpose
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-right">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(drill?.rows || []).map((r, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 px-3 py-1.5">
                                            {r.item}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1.5">
                                            {r.unit || "-"}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1.5">
                                            {r.purpose}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1.5 text-right">
                                            {fmt(r.amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-200 font-bold">
                                    <td
                                        className="border border-gray-300 px-3 py-2"
                                        colSpan={3}
                                    >
                                        Total
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-right">
                                        {fmt(
                                            (drill?.rows || []).reduce(
                                                (s, r) => s + r.amount,
                                                0
                                            )
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={() => setDrill(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Vehicle fuel (actual) drill-down modal */}
            <Modal
                show={!!fuelDrill}
                onClose={() => setFuelDrill(null)}
                size="5xl"
            >
                <Modal.Header>Vehicle Fuel (Actual)</Modal.Header>
                <Modal.Body>
                    {fuelDrill?.loading ? (
                        <div className="py-8 text-center text-gray-500">
                            Loading...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-3 py-2 text-left">
                                            Vehicle
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-left">
                                            Date
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-left">
                                            Cash Item
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right">
                                            Quantity (ltr)
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right">
                                            Rate
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right">
                                            Cost
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-right">
                                            Mileage (km)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fuelDrill?.rows || []).map((r, i) => (
                                        <tr key={i}>
                                            <td className="border border-gray-300 px-3 py-1.5">
                                                {r.vehicle}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5">
                                                {r.refuel_date}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5">
                                                {r.item}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(r.quantity)}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(r.rate)}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(r.cost)}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                                {fmt(r.mileage)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-200 font-bold">
                                        <td
                                            className="border border-gray-300 px-3 py-2"
                                            colSpan={3}
                                        >
                                            Total
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fmt(
                                                (fuelDrill?.rows || []).reduce(
                                                    (s, r) =>
                                                        s +
                                                        Number(r.quantity || 0),
                                                    0
                                                )
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2" />
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fmt(
                                                (fuelDrill?.rows || []).reduce(
                                                    (s, r) =>
                                                        s + Number(r.cost || 0),
                                                    0
                                                )
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-right">
                                            {fmt(
                                                (fuelDrill?.rows || []).reduce(
                                                    (s, r) =>
                                                        s +
                                                        Number(r.mileage || 0),
                                                    0
                                                )
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={() => setFuelDrill(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
