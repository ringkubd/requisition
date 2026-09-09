import AppLayout from "@/components/Layouts/AppLayout";
import { loadCategory } from "@/lib/initial_requisition";
import {
    useSummaryDepartmentCategoryMutation,
    useSummaryCashMutation,
} from "@/store/service/report";
import { useGetDepartmentByOrganizationBranchQuery } from "@/store/service/deparment";
import Head from "next/head";
import { useMemo, useRef, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";
import { AsyncPaginate } from "react-select-async-paginate";
import { useReactToPrint } from "react-to-print";
import { Button, Card, Label, Select } from "flowbite-react";

const fmt = v =>
    Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function SummaryReport() {
    const printRef = useRef();
    const [tab, setTab] = useState("product"); // product | cash
    const [dateFrom, setDateFrom] = useState(
        moment()
            .subtract(1, "month")
            .startOf("month")
            .format("YYYY-MM-DD")
    );
    const [dateTo, setDateTo] = useState(
        moment()
            .subtract(1, "month")
            .endOf("month")
            .format("YYYY-MM-DD")
    );
    const [department, setDepartment] = useState("");
    const [selectedDepartmentName, setSelectedDepartmentName] = useState("");
    const [category, setCategory] = useState("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [period, setPeriod] = useState("none");
    const [groupBy, setGroupBy] = useState("department");
    const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [activeRange, setActiveRange] = useState(null);
    const [rows, setRows] = useState([]);

    const years = useMemo(() => {
        const list = [];
        for (let y = 2023; y <= moment().year(); y++) list.push(y);
        return list;
    }, []);
    const monthNames = moment.months();

    const { data: departments } = useGetDepartmentByOrganizationBranchQuery();
    const [fetchProductSummary, { isLoading: isLoadingProduct }] =
        useSummaryDepartmentCategoryMutation();
    const [fetchCashSummary, { isLoading: isLoadingCash }] =
        useSummaryCashMutation();

    const isLoading = isLoadingProduct || isLoadingCash;
    const reportTitle =
        tab === "cash"
            ? "Cash Requisition Summary Report"
            : "Department & Category Wise Summary Report";

    const resolveRange = () => {
        if (period === "year" || period === "year_month") {
            return {
                start: `${selectedYear}-01-01`,
                end: `${selectedYear}-12-31`,
                label: `Year ${selectedYear}`,
            };
        }
        if (period === "month") {
            const m = moment({ year: selectedYear, month: selectedMonth - 1, day: 1 });
            return {
                start: m.startOf("month").format("YYYY-MM-DD"),
                end: m.endOf("month").format("YYYY-MM-DD"),
                label: m.format("MMMM YYYY"),
            };
        }
        return { start: dateFrom, end: dateTo, label: null };
    };

    const handleShow = async () => {
        const range = resolveRange();
        setActiveRange(range);
        const params = {
            start_date: range.start,
            end_date: range.end,
            period: period === "year_month" ? "month" : period,
        };
        if (department) params.department_id = department;
        let result;
        if (tab === "cash") {
            result = await fetchCashSummary(params).unwrap();
        } else {
            if (category) params.category_id = category;
            result = await fetchProductSummary(params).unwrap();
        }
        setRows(result?.rows ?? []);
    };

    const handleTabChange = value => {
        setTab(value);
        setRows([]);
    };

    const groups = useMemo(() => {
        const list = [];
        const index = new Map();
        rows.forEach(r => {
            const isCash = tab === "cash";
            const gId = isCash || groupBy === "department" ? r.department_id : r.category_id;
            const gName = isCash || groupBy === "department" ? r.department_name : r.category_title;
            const sName = isCash
                ? ""
                : groupBy === "department"
                ? r.category_title
                : r.department_name;
            const gKey = String(gId ?? "0");
            if (!index.has(gKey)) {
                const group = {
                    name: gName || "N/A",
                    subs: [],
                    subIndex: new Map(),
                    totals: {
                        requisition_amount: 0,
                        purchase_amount: 0,
                        used_amount: 0,
                        requisition_count: 0,
                        amount: 0,
                    },
                };
                list.push(group);
                index.set(gKey, group);
            }
            const group = index.get(gKey);
            if (isCash) {
                group.totals.requisition_count += Number(r.requisition_count || 0);
                group.totals.amount += Number(r.amount || 0);
                const sKey = r.period || "all";
                if (!group.subIndex.has(sKey)) {
                    group.subIndex.set(sKey, {
                        label: r.period || "All",
                        requisition_count: 0,
                        amount: 0,
                    });
                }
                const sub = group.subIndex.get(sKey);
                sub.requisition_count += Number(r.requisition_count || 0);
                sub.amount += Number(r.amount || 0);
            } else {
                group.totals.requisition_amount += Number(r.requisition_amount || 0);
                group.totals.purchase_amount += Number(r.purchase_amount || 0);
                group.totals.used_amount += Number(r.used_amount || 0);
                const baseLabel = sName || "N/A";
                const sKey = `${sName}|${r.period || ""}`;
                if (!group.subIndex.has(sKey)) {
                    group.subIndex.set(sKey, {
                        label: r.period ? `${baseLabel} (${r.period})` : baseLabel,
                        requisition_amount: 0,
                        purchase_amount: 0,
                        used_amount: 0,
                    });
                }
                const sub = group.subIndex.get(sKey);
                sub.requisition_amount += Number(r.requisition_amount || 0);
                sub.purchase_amount += Number(r.purchase_amount || 0);
                sub.used_amount += Number(r.used_amount || 0);
            }
            group.subs = Array.from(group.subIndex.values());
        });
        return list;
    }, [rows, groupBy, tab]);

    const grandTotals = useMemo(() => {
        return groups.reduce(
            (acc, g) => ({
                requisition_amount: acc.requisition_amount + g.totals.requisition_amount,
                purchase_amount: acc.purchase_amount + g.totals.purchase_amount,
                used_amount: acc.used_amount + g.totals.used_amount,
                requisition_count: acc.requisition_count + g.totals.requisition_count,
                amount: acc.amount + g.totals.amount,
            }),
            {
                requisition_amount: 0,
                purchase_amount: 0,
                used_amount: 0,
                requisition_count: 0,
                amount: 0,
            }
        );
    }, [groups]);

    const hasData = rows.length > 0;

    const handleExportCsv = () => {
        if (!hasData) return;
        const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
        let csv = "\ufeff";
        if (tab === "cash") {
            csv += "Department,Period,Requisitions,Approved Amount\n";
            groups.forEach(g => {
                if (period === "none") {
                    csv += [esc(g.name), "", g.totals.requisition_count, g.totals.amount]
                        .map(esc)
                        .join(",");
                    csv += "\n";
                } else {
                    g.subs.forEach(s => {
                        csv += [esc(g.name), esc(s.label), s.requisition_count, s.amount]
                            .map(esc)
                            .join(",");
                        csv += "\n";
                    });
                }
            });
            csv += [
                esc("Grand Total"),
                "",
                grandTotals.requisition_count,
                grandTotals.amount,
            ]
                .map(esc)
                .join(",");
            csv += "\n";
        } else {
            csv += `Group,Category/Department,Requisition Approved,Actual Purchase,Actual Used\n`;
            groups.forEach(g => {
                g.subs.forEach(s => {
                    csv += [
                        esc(g.name),
                        esc(s.label),
                        s.requisition_amount,
                        s.purchase_amount,
                        s.used_amount,
                    ]
                        .map(esc)
                        .join(",");
                    csv += "\n";
                });
                csv += [
                    esc(g.name),
                    esc("Subtotal"),
                    g.totals.requisition_amount,
                    g.totals.purchase_amount,
                    g.totals.used_amount,
                ]
                    .map(esc)
                    .join(",");
                csv += "\n";
            });
            csv += [
                esc("Grand Total"),
                "",
                grandTotals.requisition_amount,
                grandTotals.purchase_amount,
                grandTotals.used_amount,
            ]
                .map(esc)
                .join(",");
            csv += "\n";
        }
        const range = activeRange ?? resolveRange();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${tab}_summary_report_${range.start}_to_${range.end}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const periodLabel =
        period === "month"
            ? "Monthly"
            : period === "year"
            ? "Yearly"
            : period === "year_month"
            ? "Yearly (Month wise)"
            : "Summary";

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
                    <div className="flex gap-2 mb-6 border-b border-gray-200">
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
                            {/* Period */}
                            <div className="flex flex-col">
                                <Label
                                    htmlFor="period"
                                    value="Period"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <Select
                                    id="period"
                                    value={period}
                                    onChange={e => setPeriod(e.target.value)}
                                >
                                    <option value="none">Date Range</option>
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                    <option value="year_month">Yearly (Month wise)</option>
                                </Select>
                            </div>

                            {period === "none" && (
                                <div className="flex flex-col sm:col-span-2">
                                    <Label
                                        htmlFor="date_range"
                                        value="Date Range"
                                        className="font-semibold text-gray-700 mb-1"
                                    />
                                    <Datepicker
                                        inputId="date_range"
                                        inputName="date_range"
                                        onChange={d => {
                                            setDateFrom(
                                                d.startDate
                                                    ? moment(d.startDate).format("YYYY-MM-DD")
                                                    : ""
                                            );
                                            setDateTo(
                                                d.endDate
                                                    ? moment(d.endDate).format("YYYY-MM-DD")
                                                    : ""
                                            );
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholderText="Select date range"
                                        maxDate={new Date()}
                                        value={{ startDate: dateFrom, endDate: dateTo }}
                                    />
                                </div>
                            )}

                            {(period === "year" || period === "year_month") && (
                                <div className="flex flex-col">
                                    <Label
                                        htmlFor="select_year"
                                        value="Year"
                                        className="font-semibold text-gray-700 mb-1"
                                    />
                                    <Select
                                        id="select_year"
                                        value={selectedYear}
                                        onChange={e =>
                                            setSelectedYear(Number(e.target.value))
                                        }
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {period === "month" && (
                                <>
                                    <div className="flex flex-col">
                                        <Label
                                            htmlFor="select_month"
                                            value="Month"
                                            className="font-semibold text-gray-700 mb-1"
                                        />
                                        <Select
                                            id="select_month"
                                            value={selectedMonth}
                                            onChange={e =>
                                                setSelectedMonth(Number(e.target.value))
                                            }
                                        >
                                            {monthNames.map((m, i) => (
                                                <option key={m} value={i + 1}>
                                                    {m}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="flex flex-col">
                                        <Label
                                            htmlFor="select_year"
                                            value="Year"
                                            className="font-semibold text-gray-700 mb-1"
                                        />
                                        <Select
                                            id="select_year"
                                            value={selectedYear}
                                            onChange={e =>
                                                setSelectedYear(Number(e.target.value))
                                            }
                                        >
                                            {years.map(y => (
                                                <option key={y} value={y}>
                                                    {y}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </>
                            )}

                            {/* Group By */}
                            {tab === "product" && (
                                <div className="flex flex-col">
                                    <Label
                                        htmlFor="group_by"
                                        value="Group By"
                                        className="font-semibold text-gray-700 mb-1"
                                    />
                                    <Select
                                        id="group_by"
                                        value={groupBy}
                                        onChange={e => setGroupBy(e.target.value)}
                                    >
                                        <option value="department">Department wise</option>
                                        <option value="category">Category wise</option>
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
                                    onChange={e => {
                                        setDepartment(e.target.value);
                                        setSelectedDepartmentName(
                                            e.target.selectedOptions[0]?.text || ""
                                        );
                                    }}
                                >
                                    <option value="">All Departments</option>
                                    {departments?.data?.map(o => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Category */}
                            {tab === "product" && (
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
                                            control: state => "select",
                                        }}
                                        onChange={newValue => {
                                            setCategory(newValue?.value ?? "");
                                            setSelectedCategoryName(newValue?.label || "");
                                        }}
                                        additional={{ page: 1 }}
                                        loadOptions={loadCategory}
                                        placeholder="Select category..."
                                    />
                                </div>
                            )}
                        </div>

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
                        <div className="text-center mb-6 p-4">
                            <div className="mb-3">
                                <img
                                    src="/logo.svg"
                                    alt="Organization Logo"
                                    className="h-14 mx-auto print:h-10"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">
                                IsDB-Bangladesh Islamic Solidarity Educational Wakf
                            </h2>
                            <div className="text-sm text-gray-600 mb-1">
                                IDB Bhaban (4th Floor), Rokeya Sharanee, Dhaka
                            </div>
                            <div className="text-lg font-semibold mt-3 mb-1">
                                {reportTitle}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                                {periodLabel}
                                {selectedDepartmentName && department
                                    ? ` • Department: ${selectedDepartmentName}`
                                    : ""}
                                {tab === "product" && selectedCategoryName && category
                                    ? ` • Category: ${selectedCategoryName}`
                                    : ""}
                            </div>
                            <div className="text-sm text-gray-500">
                                {activeRange
                                    ? `Period: ${
                                          activeRange.label ??
                                          `${moment(activeRange.start).format("DD MMM YYYY")} - ${moment(activeRange.end).format("DD MMM YYYY")}`
                                      }`
                                    : ""}
                            </div>
                        </div>

                        {hasData ? (
                            <div className="overflow-x-auto">
                                {tab === "cash" ? (
                                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                                                    Department
                                                </th>
                                                <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                                    Requisitions
                                                </th>
                                                <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                                    Approved Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groups.map((g, i) => (
                                                <GroupRows
                                                    key={i}
                                                    group={g}
                                                    tab="cash"
                                                    period={period}
                                                />
                                            ))}
                                            <tr className="bg-gray-200 font-bold">
                                                <td className="border border-gray-300 px-3 py-2">
                                                    Grand Total
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-right">
                                                    {grandTotals.requisition_count}
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-right">
                                                    {fmt(grandTotals.amount)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : (
                                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                                                    {groupBy === "department"
                                                        ? "Category"
                                                        : "Department"}
                                                </th>
                                                <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                                    Requisition Approved
                                                </th>
                                                <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                                    Actual Purchase
                                                </th>
                                                <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                                                    Actual Used
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groups.map((g, i) => (
                                                <GroupRows
                                                    key={i}
                                                    group={g}
                                                    tab="product"
                                                    period={period}
                                                />
                                            ))}
                                            <tr className="bg-gray-200 font-bold">
                                                <td className="border border-gray-300 px-3 py-2">
                                                    Grand Total
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-right">
                                                    {fmt(grandTotals.requisition_amount)}
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-right">
                                                    {fmt(grandTotals.purchase_amount)}
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-right">
                                                    {fmt(grandTotals.used_amount)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                {isLoading
                                    ? "Loading report..."
                                    : "No data found. Select filters and press Show Report."}
                            </div>
                        )}
                    </div>
                </Card>

                <style jsx global>{`
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
                        .print-content table {
                            width: 100% !important;
                        }
                        @page {
                            margin: 0.5in;
                            size: A4 landscape;
                        }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}

function GroupRows({ group, tab, period }) {
    if (tab === "cash") {
        return (
            <>
                <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 px-3 py-2">
                        {group.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                        {group.totals.requisition_count}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                        {fmt(group.totals.amount)}
                    </td>
                </tr>
                {period !== "none" &&
                    group.subs.map((s, i) => (
                        <tr key={i} className="text-gray-700">
                            <td className="border border-gray-300 px-3 py-1.5 pl-8">
                                • {s.label}
                            </td>
                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                {s.requisition_count}
                            </td>
                            <td className="border border-gray-300 px-3 py-1.5 text-right">
                                {fmt(s.amount)}
                            </td>
                        </tr>
                    ))}
            </>
        );
    }
    return (
        <>
            <tr className="bg-gray-100 font-semibold">
                <td className="border border-gray-300 px-3 py-2">{group.name}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                    {fmt(group.totals.requisition_amount)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                    {fmt(group.totals.purchase_amount)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                    {fmt(group.totals.used_amount)}
                </td>
            </tr>
            {group.subs.map((s, i) => (
                <tr key={i} className="text-gray-700">
                    <td className="border border-gray-300 px-3 py-1.5 pl-8">
                        • {s.label}
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right">
                        {fmt(s.requisition_amount)}
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right">
                        {fmt(s.purchase_amount)}
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right">
                        {fmt(s.used_amount)}
                    </td>
                </tr>
            ))}
        </>
    );
}
