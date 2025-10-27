import AppLayout from "@/components/Layouts/AppLayout";
import { loadCategory } from "@/lib/initial_requisition";
import { useAuditReportQuery } from "@/store/service/report";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import moment from "moment";
import { AsyncPaginate } from "react-select-async-paginate";
import { useReactToPrint } from "react-to-print";
import { Button, Card, Checkbox, Label } from "flowbite-react";

export default function ProductInOutReport() {
    const printRef = useRef();
    const [data, setData] = useState([]);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [category, setCategory] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");

    // Section filters
    const [sections, setSections] = useState({
        opening: true,
        inwards: true,
        outwards: true,
        closing: true,
    });

    // Column filters
    const [columns, setColumns] = useState({
        qty: true,
        rate: true,
        value: true,
    });

    // Print orientation
    const [printOrientation, setPrintOrientation] = useState("landscape");

    // User-adjustable font size for printing
    const [printFontSize, setPrintFontSize] = useState(100); // percentage

    // Custom report title for printing
    const [reportTitle, setReportTitle] = useState("Product In/Out Statement"); // Individual positive values filters
    const [positiveFilters, setPositiveFilters] = useState({
        opening: false,
        inwards: false,
        outwards: false,
        closing: false,
    });

    const {
        data: auditData,
        isLoading: isLoadingAudit,
        error: auditError,
    } = useAuditReportQuery(
        {
            date_from: dateFrom,
            date_to: dateTo,
            category_id: selectedCategory,
        },
        {
            skip: !dateFrom || !dateTo || !selectedCategory, // Skip query if dates or category are not set
            refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
        }
    );

    // Calculate visible columns for dynamic font sizing
    const visibleColumnCount = Object.values(columns).filter(Boolean).length;
    const visibleSections = Object.values(sections).filter(Boolean).length;
    const totalVisibleColumns = 1 + visibleSections * visibleColumnCount; // 1 for product column

    // Adjust font size based on total visible columns (base calculation for print styles)
    const getBaseFontSize = (baseLandscape, basePortrait) => {
        let multiplier = 1;
        if (totalVisibleColumns > 10) multiplier = 0.8;
        else if (totalVisibleColumns > 7) multiplier = 0.9;
        return printOrientation === "portrait"
            ? `${Math.round(basePortrait * multiplier)}px`
            : `${Math.round(baseLandscape * multiplier)}px`;
    };

    // Adjust font size based on total visible columns and user preference
    const getFontSize = (baseLandscape, basePortrait) => {
        let multiplier = 1;
        if (totalVisibleColumns > 10) multiplier = 0.8;
        else if (totalVisibleColumns > 7) multiplier = 0.9;

        // Apply user font size adjustment
        multiplier *= printFontSize / 100;

        return printOrientation === "portrait"
            ? `${Math.round(basePortrait * multiplier)}px`
            : `${Math.round(baseLandscape * multiplier)}px`;
    };

    const tableFontSize = getFontSize(10, 8);
    const cellFontSize = getFontSize(9, 7);
    const headerFontSize = getFontSize(16, 14);
    const subHeaderFontSize = getFontSize(14, 12);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        onBeforePrint: () => console.log("Printing..."),
    });

    useEffect(() => {
        if (!auditError && auditData && !isLoadingAudit) {
            // Optionally handle audit data
            setData(auditData?.report ?? []);
        }
    }, [auditData, isLoadingAudit, auditError]);

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Product In/Out Report
                </h2>
            }
        >
            <Head>
                <title>{reportTitle}</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="shadow-lg">
                    {/* Filters and Print Button */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                            <div className="flex flex-col">
                                <Label
                                    htmlFor="date_range"
                                    value="Date Range"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <Datepicker
                                    inputId={`date_range`}
                                    inputName={`date_range`}
                                    selected={dateFrom}
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
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="Select date range"
                                    maxDate={new Date()}
                                    value={{
                                        startDate: dateFrom,
                                        endDate: dateTo,
                                    }}
                                    isClearable
                                />
                            </div>

                            <div className="flex flex-col min-w-[200px]">
                                <Label
                                    htmlFor="category_id"
                                    value="Category"
                                    className="font-semibold text-gray-700 mb-1"
                                />
                                <AsyncPaginate
                                    defaultOptions
                                    name="category_id"
                                    id="category_id"
                                    className={`select min-w-[200px]`}
                                    classNames={{
                                        control: (state) =>
                                            "border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                    }}
                                    onChange={(newValue) => {
                                        setSelectedCategory(newValue?.value);
                                        setSelectedCategoryName(
                                            newValue?.label || ""
                                        );
                                    }}
                                    additional={{
                                        page: 1,
                                    }}
                                    loadOptions={loadCategory}
                                    placeholder="Select category..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handlePrint}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors duration-200"
                                disabled={!data.length}
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                    />
                                </svg>
                                Print Report
                            </Button>
                        </div>
                    </div>

                    {/* Local Filters */}
                    <div className="px-6 pb-6 space-y-4 border-b border-gray-200">
                        {/* Section Filters */}
                        <div className="flex flex-col">
                            <Label
                                value="Show Sections"
                                className="font-semibold text-gray-700 mb-2"
                            />
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="opening"
                                        checked={sections.opening}
                                        onChange={(e) =>
                                            setSections({
                                                ...sections,
                                                opening: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="opening"
                                        value="Opening"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="inwards"
                                        checked={sections.inwards}
                                        onChange={(e) =>
                                            setSections({
                                                ...sections,
                                                inwards: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="inwards"
                                        value="Inwards (Purchase)"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="outwards"
                                        checked={sections.outwards}
                                        onChange={(e) =>
                                            setSections({
                                                ...sections,
                                                outwards: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="outwards"
                                        value="Outwards (Issue)"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="closing"
                                        checked={sections.closing}
                                        onChange={(e) =>
                                            setSections({
                                                ...sections,
                                                closing: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="closing"
                                        value="Closing"
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column Filters */}
                        <div className="flex flex-col">
                            <Label
                                value="Show Columns"
                                className="font-semibold text-gray-700 mb-2"
                            />
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="qty"
                                        checked={columns.qty}
                                        onChange={(e) =>
                                            setColumns({
                                                ...columns,
                                                qty: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="qty"
                                        value="Quantity"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="rate"
                                        checked={columns.rate}
                                        onChange={(e) =>
                                            setColumns({
                                                ...columns,
                                                rate: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="rate"
                                        value="Rate"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="value"
                                        checked={columns.value}
                                        onChange={(e) =>
                                            setColumns({
                                                ...columns,
                                                value: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="value"
                                        value="Value"
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Print Orientation */}
                        <div className="flex flex-col">
                            <Label
                                value="Print Orientation"
                                className="font-semibold text-gray-700 mb-2"
                            />
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="landscape"
                                        name="printOrientation"
                                        value="landscape"
                                        checked={
                                            printOrientation === "landscape"
                                        }
                                        onChange={(e) =>
                                            setPrintOrientation(e.target.value)
                                        }
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                    />
                                    <Label
                                        htmlFor="landscape"
                                        value="Landscape (Wide)"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="portrait"
                                        name="printOrientation"
                                        value="portrait"
                                        checked={
                                            printOrientation === "portrait"
                                        }
                                        onChange={(e) =>
                                            setPrintOrientation(e.target.value)
                                        }
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                    />
                                    <Label
                                        htmlFor="portrait"
                                        value="Portrait (Tall)"
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Print Font Size */}
                        <div className="flex flex-col">
                            <Label
                                value={`Print Font Size: ${printFontSize}%`}
                                className="font-semibold text-gray-700 mb-2"
                            />
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="50"
                                    max="200"
                                    value={printFontSize}
                                    onChange={(e) =>
                                        setPrintFontSize(Number(e.target.value))
                                    }
                                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm text-gray-600 min-w-[3rem]">
                                    {printFontSize}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Adjust font size for printing (50% - 200%)
                            </p>
                        </div>

                        {/* Report Title */}
                        <div className="flex flex-col">
                            <Label
                                htmlFor="reportTitle"
                                value="Report Title"
                                className="font-semibold text-gray-700 mb-2"
                            />
                            <input
                                type="text"
                                id="reportTitle"
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                                placeholder="Enter report title..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Customize the title that appears on the printed
                                report
                            </p>
                        </div>

                        {/* Positive Values Filter */}
                        <div className="flex flex-col">
                            <Label
                                value="Data Filters"
                                className="font-semibold text-gray-700 mb-2"
                            />
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="filterOpeningPositive"
                                        checked={positiveFilters.opening}
                                        onChange={(e) =>
                                            setPositiveFilters({
                                                ...positiveFilters,
                                                opening: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="filterOpeningPositive"
                                        value="Opening Balance > 0"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="filterInwardsPositive"
                                        checked={positiveFilters.inwards}
                                        onChange={(e) =>
                                            setPositiveFilters({
                                                ...positiveFilters,
                                                inwards: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="filterInwardsPositive"
                                        value="Inwards > 0"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="filterOutwardsPositive"
                                        checked={positiveFilters.outwards}
                                        onChange={(e) =>
                                            setPositiveFilters({
                                                ...positiveFilters,
                                                outwards: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="filterOutwardsPositive"
                                        value="Outwards > 0"
                                        className="text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="filterClosingPositive"
                                        checked={positiveFilters.closing}
                                        onChange={(e) =>
                                            setPositiveFilters({
                                                ...positiveFilters,
                                                closing: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="filterClosingPositive"
                                        value="Closing Balance > 0"
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoadingAudit && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                                Loading report...
                            </span>
                        </div>
                    )}

                    {/* Report Content - Printable Area */}
                    <div
                        ref={printRef}
                        className="print-content"
                        style={{
                            fontSize: `${printFontSize}%`,
                        }}
                    >
                        {/* Report Header */}
                        <div className="text-center mb-8 p-6">
                            {/* Logo */}
                            <div className="mb-4">
                                <img
                                    src="/logo.svg"
                                    alt="Organization Logo"
                                    className="h-16 mx-auto print:h-12"
                                    style={{
                                        maxHeight:
                                            printOrientation === "portrait"
                                                ? "50px"
                                                : "80px",
                                    }}
                                />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                IsDB-Bangladesh Islamic Solidarity Educational
                                Wakf
                            </h2>
                            <div className="text-sm text-gray-600 mb-1">
                                IDB Bhaban (4th Floor), Rokeya Sharanee, Dhaka
                            </div>
                            <div className="text-lg font-semibold mt-4 mb-2">
                                {reportTitle}
                            </div>
                            {selectedCategoryName && (
                                <div className="text-base font-medium text-blue-600 mb-2">
                                    {selectedCategoryName}
                                </div>
                            )}
                            <div className="text-sm text-gray-500">
                                {dateFrom && dateTo
                                    ? `Period: ${moment(dateFrom).format(
                                          "DD MMM YYYY"
                                      )} - ${moment(dateTo).format(
                                          "DD MMM YYYY"
                                      )}`
                                    : `As of ${new Date().toLocaleDateString()}`}
                            </div>
                        </div>

                        {/* Data Table */}
                        {data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th
                                                className="border border-gray-300 px-3 py-2 text-left font-semibold"
                                                rowSpan={2}
                                            >
                                                Product
                                            </th>
                                            {sections.opening && (
                                                <th
                                                    className="border border-gray-300 px-3 py-2 text-center font-semibold"
                                                    colSpan={
                                                        Object.values(
                                                            columns
                                                        ).filter(Boolean).length
                                                    }
                                                >
                                                    Opening
                                                </th>
                                            )}
                                            {sections.inwards && (
                                                <th
                                                    className="border border-gray-300 px-3 py-2 text-center font-semibold"
                                                    colSpan={
                                                        Object.values(
                                                            columns
                                                        ).filter(Boolean).length
                                                    }
                                                >
                                                    Inwards (Purchase)
                                                </th>
                                            )}
                                            {sections.outwards && (
                                                <th
                                                    className="border border-gray-300 px-3 py-2 text-center font-semibold"
                                                    colSpan={
                                                        Object.values(
                                                            columns
                                                        ).filter(Boolean).length
                                                    }
                                                >
                                                    Outwards (Issue)
                                                </th>
                                            )}
                                            {sections.closing && (
                                                <th
                                                    className="border border-gray-300 px-3 py-2 text-center font-semibold"
                                                    colSpan={
                                                        Object.values(
                                                            columns
                                                        ).filter(Boolean).length
                                                    }
                                                >
                                                    Closing
                                                </th>
                                            )}
                                        </tr>
                                        <tr className="bg-gray-50">
                                            {sections.opening && (
                                                <>
                                                    {columns.qty && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Qty
                                                        </th>
                                                    )}
                                                    {columns.rate && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Rate
                                                        </th>
                                                    )}
                                                    {columns.value && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Value
                                                        </th>
                                                    )}
                                                </>
                                            )}
                                            {sections.inwards && (
                                                <>
                                                    {columns.qty && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Qty
                                                        </th>
                                                    )}
                                                    {columns.rate && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Rate
                                                        </th>
                                                    )}
                                                    {columns.value && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Value
                                                        </th>
                                                    )}
                                                </>
                                            )}
                                            {sections.outwards && (
                                                <>
                                                    {columns.qty && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Qty
                                                        </th>
                                                    )}
                                                    {columns.rate && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Rate
                                                        </th>
                                                    )}
                                                    {columns.value && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Value
                                                        </th>
                                                    )}
                                                </>
                                            )}
                                            {sections.closing && (
                                                <>
                                                    {columns.qty && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Qty
                                                        </th>
                                                    )}
                                                    {columns.rate && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Rate
                                                        </th>
                                                    )}
                                                    {columns.value && (
                                                        <th className="border border-gray-300 px-2 py-1 text-xs font-medium">
                                                            Value
                                                        </th>
                                                    )}
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data
                                            .filter((row) => {
                                                // Apply individual positive values filters with OR condition
                                                // If no filters are selected, show all rows
                                                const hasAnyFilterActive =
                                                    positiveFilters.opening ||
                                                    positiveFilters.inwards ||
                                                    positiveFilters.outwards ||
                                                    positiveFilters.closing;

                                                if (!hasAnyFilterActive) {
                                                    return true; // Show all if no filters active
                                                }

                                                // Show row if ANY of the active filters match
                                                let shouldShow = false;

                                                if (positiveFilters.opening) {
                                                    shouldShow =
                                                        shouldShow ||
                                                        (Number(
                                                            row.openingBalance
                                                        ) || 0) > 0;
                                                }
                                                if (positiveFilters.inwards) {
                                                    shouldShow =
                                                        shouldShow ||
                                                        (Number(row.inwards) ||
                                                            0) > 0;
                                                }
                                                if (positiveFilters.outwards) {
                                                    shouldShow =
                                                        shouldShow ||
                                                        (Number(row.outwards) ||
                                                            0) > 0;
                                                }
                                                if (positiveFilters.closing) {
                                                    shouldShow =
                                                        shouldShow ||
                                                        (Number(
                                                            row.closingBalance
                                                        ) || 0) > 0;
                                                }

                                                return shouldShow;
                                            })
                                            .map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="border border-gray-300 px-3 py-2 font-medium">
                                                        {row.product}
                                                    </td>
                                                    {sections.opening && (
                                                        <>
                                                            {columns.qty && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.openingBalance
                                                                    }{" "}
                                                                    {row.unit}
                                                                </td>
                                                            )}
                                                            {columns.rate && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {row.rate}
                                                                </td>
                                                            )}
                                                            {columns.value && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.openingValue
                                                                    }
                                                                </td>
                                                            )}
                                                        </>
                                                    )}
                                                    {sections.inwards && (
                                                        <>
                                                            {columns.qty && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.inwards
                                                                    }{" "}
                                                                    {row.unit}
                                                                </td>
                                                            )}
                                                            {columns.rate && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.inwardsRate
                                                                    }
                                                                </td>
                                                            )}
                                                            {columns.value && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.inwardsValue
                                                                    }
                                                                </td>
                                                            )}
                                                        </>
                                                    )}
                                                    {sections.outwards && (
                                                        <>
                                                            {columns.qty && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.outwards
                                                                    }{" "}
                                                                    {row.unit}
                                                                </td>
                                                            )}
                                                            {columns.rate && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.outwardsRate
                                                                    }
                                                                </td>
                                                            )}
                                                            {columns.value && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.outwardsValue
                                                                    }
                                                                </td>
                                                            )}
                                                        </>
                                                    )}
                                                    {sections.closing && (
                                                        <>
                                                            {columns.qty && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.closingBalance
                                                                    }{" "}
                                                                    {row.unit}
                                                                </td>
                                                            )}
                                                            {columns.rate && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.closingRate
                                                                    }
                                                                </td>
                                                            )}
                                                            {columns.value && (
                                                                <td className="border border-gray-300 px-2 py-1 text-right">
                                                                    {
                                                                        row.closingValue
                                                                    }
                                                                </td>
                                                            )}
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        {/* Grand Total Row */}
                                        <tr className="font-bold bg-gray-100">
                                            <td className="border border-gray-300 px-3 py-2 text-right">
                                                Grand Total
                                            </td>
                                            {sections.opening && (
                                                <>
                                                    {columns.value && (
                                                        <td
                                                            className="border border-gray-300 px-2 py-1 text-right"
                                                            colSpan={
                                                                Object.values(
                                                                    columns
                                                                ).filter(
                                                                    Boolean
                                                                ).length
                                                            }
                                                        >
                                                            {data
                                                                .filter(
                                                                    (row) => {
                                                                        const hasAnyFilterActive =
                                                                            positiveFilters.opening ||
                                                                            positiveFilters.inwards ||
                                                                            positiveFilters.outwards ||
                                                                            positiveFilters.closing;

                                                                        if (
                                                                            !hasAnyFilterActive
                                                                        ) {
                                                                            return true;
                                                                        }

                                                                        let shouldShow = false;
                                                                        if (
                                                                            positiveFilters.opening
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.openingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.inwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.inwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.outwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.outwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.closing
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.closingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        return shouldShow;
                                                                    }
                                                                )
                                                                .reduce(
                                                                    (sum, r) =>
                                                                        sum +
                                                                        (Number(
                                                                            r.openingValue
                                                                        ) || 0),
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </td>
                                                    )}
                                                </>
                                            )}
                                            {sections.inwards && (
                                                <>
                                                    {columns.value && (
                                                        <td
                                                            className="border border-gray-300 px-2 py-1 text-right"
                                                            colSpan={
                                                                Object.values(
                                                                    columns
                                                                ).filter(
                                                                    Boolean
                                                                ).length
                                                            }
                                                        >
                                                            {data
                                                                .filter(
                                                                    (row) => {
                                                                        const hasAnyFilterActive =
                                                                            positiveFilters.opening ||
                                                                            positiveFilters.inwards ||
                                                                            positiveFilters.outwards ||
                                                                            positiveFilters.closing;

                                                                        if (
                                                                            !hasAnyFilterActive
                                                                        ) {
                                                                            return true;
                                                                        }

                                                                        let shouldShow = false;
                                                                        if (
                                                                            positiveFilters.opening
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.openingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.inwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.inwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.outwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.outwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.closing
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.closingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        return shouldShow;
                                                                    }
                                                                )
                                                                .reduce(
                                                                    (sum, r) =>
                                                                        sum +
                                                                        (Number(
                                                                            r.inwardsValue
                                                                        ) || 0),
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </td>
                                                    )}
                                                </>
                                            )}
                                            {sections.outwards && (
                                                <>
                                                    {columns.value && (
                                                        <td
                                                            className="border border-gray-300 px-2 py-1 text-right"
                                                            colSpan={
                                                                Object.values(
                                                                    columns
                                                                ).filter(
                                                                    Boolean
                                                                ).length
                                                            }
                                                        >
                                                            {data
                                                                .filter(
                                                                    (row) => {
                                                                        const hasAnyFilterActive =
                                                                            positiveFilters.opening ||
                                                                            positiveFilters.inwards ||
                                                                            positiveFilters.outwards ||
                                                                            positiveFilters.closing;

                                                                        if (
                                                                            !hasAnyFilterActive
                                                                        ) {
                                                                            return true;
                                                                        }

                                                                        let shouldShow = false;
                                                                        if (
                                                                            positiveFilters.opening
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.openingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.inwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.inwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.outwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.outwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.closing
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.closingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        return shouldShow;
                                                                    }
                                                                )
                                                                .reduce(
                                                                    (sum, r) =>
                                                                        sum +
                                                                        (Number(
                                                                            r.outwardsValue
                                                                        ) || 0),
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </td>
                                                    )}
                                                </>
                                            )}
                                            {sections.closing && (
                                                <>
                                                    {columns.value && (
                                                        <td
                                                            className="border border-gray-300 px-2 py-1 text-right"
                                                            colSpan={
                                                                Object.values(
                                                                    columns
                                                                ).filter(
                                                                    Boolean
                                                                ).length
                                                            }
                                                        >
                                                            {data
                                                                .filter(
                                                                    (row) => {
                                                                        const hasAnyFilterActive = 
                                                                            positiveFilters.opening ||
                                                                            positiveFilters.inwards ||
                                                                            positiveFilters.outwards ||
                                                                            positiveFilters.closing;

                                                                        if (!hasAnyFilterActive) {
                                                                            return true;
                                                                        }

                                                                        let shouldShow = false;
                                                                        if (
                                                                            positiveFilters.opening
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.openingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.inwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.inwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.outwards
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.outwards
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        if (
                                                                            positiveFilters.closing
                                                                        )
                                                                            shouldShow =
                                                                                shouldShow ||
                                                                                (Number(
                                                                                    row.closingBalance
                                                                                ) ||
                                                                                    0) >
                                                                                    0;
                                                                        return shouldShow;
                                                                    }
                                                                )
                                                                .reduce(
                                                                    (sum, r) =>
                                                                        sum +
                                                                        (Number(
                                                                            r.closingValue
                                                                        ) || 0),
                                                                    0
                                                                )
                                                                .toFixed(2)}
                                                        </td>
                                                    )}
                                                </>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : !isLoadingAudit ? (
                            <div className="text-center py-12">
                                <div className="text-gray-500 mb-2">
                                    <svg
                                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-lg text-gray-600 mb-2">
                                    No data available
                                </p>
                                <p className="text-sm text-gray-500">
                                    Please select date range and category to
                                    generate the report
                                </p>
                            </div>
                        ) : null}
                    </div>
                </Card>

                {/* Print Styles */}
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
                            font-size: ${tableFontSize} !important;
                            width: 100% !important;
                        }
                        .print-content th,
                        .print-content td {
                            padding: ${printOrientation === "portrait"
                                ? "1px 2px"
                                : "2px 4px"} !important;
                            font-size: ${cellFontSize} !important;
                        }
                        .print-content h2 {
                            font-size: ${headerFontSize} !important;
                            margin-bottom: 8px !important;
                        }
                        .print-content .text-lg {
                            font-size: ${subHeaderFontSize} !important;
                        }
                        .print-content img {
                            max-width: 100% !important;
                            height: auto !important;
                        }
                        @page {
                            margin: 0.5in;
                            size: A4 ${printOrientation};
                        }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
