import React, { useMemo, useRef, useState } from "react";
import { Button, Checkbox, Label } from "flowbite-react";
import { useReactToPrint } from "react-to-print";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
};

const fmt = (v) =>
    Number(v || 0).toLocaleString("en", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    });

const METRIC_COLORS = {
    quantity: "#0ea5e9",
    cost: "#10b981",
    millage: "#f59e0b",
    entries: "#6366f1",
};

export default function FuelComparisonReport({
    title,
    periods,
    results,
    metricConfig,
    defaultMetrics,
    isLoading,
}) {
    const printRef = useRef();
    const withChartRef = useRef(true);
    const [enabled, setEnabled] = useState(defaultMetrics);

    const metrics = useMemo(
        () => metricConfig.filter((m) => enabled.includes(m.key)),
        [metricConfig, enabled]
    );

    // Merge rows across periods, keyed by vehicle id
    const { vehicles, totals, grand } = useMemo(() => {
        const index = new Map();
        const list = [];
        (results || []).forEach((rows, pi) => {
            (rows || []).forEach((r) => {
                const key = String(r.id ?? r.vehicle);
                if (!index.has(key)) {
                    const v = {
                        id: r.id,
                        vehicle: r.vehicle,
                        values: (periods || []).map(() => null),
                    };
                    list.push(v);
                    index.set(key, v);
                }
                index.get(key).values[pi] = r;
            });
        });

        const periodTotals = (periods || []).map((_, pi) => {
            const sum = {
                quantity: 0,
                cost: 0,
                millage: 0,
                entries: 0,
            };
            list.forEach((v) => {
                const r = v.values[pi];
                if (r) {
                    sum.quantity += num(r.quantity);
                    sum.cost += num(r.cost);
                    sum.millage += num(r.millage);
                    sum.entries += num(r.entries);
                }
            });
            sum.average_rate = sum.quantity > 0 ? sum.cost / sum.quantity : 0;
            sum.average_monthly_cost = sum.cost / 12;
            return sum;
        });

        const grandSum = periodTotals.reduce(
            (acc, t) => {
                acc.quantity += t.quantity;
                acc.cost += t.cost;
                acc.millage += t.millage;
                acc.entries += t.entries;
                return acc;
            },
            { quantity: 0, cost: 0, millage: 0, entries: 0 }
        );
        grandSum.average_rate =
            grandSum.quantity > 0 ? grandSum.cost / grandSum.quantity : 0;
        grandSum.average_monthly_cost =
            grandSum.cost / Math.max((periods || []).length * 12, 1);

        return { vehicles: list, totals: periodTotals, grand: grandSum };
    }, [results, periods]);

    const chartMetrics = metrics.filter((m) => m.type !== "avg");
    const chartData = useMemo(
        () =>
            (periods || []).map((p, pi) => {
                const row = { name: p.label };
                chartMetrics.forEach((m) => {
                    row[m.key] = totals[pi]?.[m.key] ?? 0;
                });
                return row;
            }),
        [periods, totals, chartMetrics]
    );

    const hasData = vehicles.length > 0;

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        onBeforeGetContent: () => {
            if (printRef.current) {
                if (withChartRef.current) {
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
        withChartRef.current = true;
        handlePrint();
    };
    const printWithoutChart = () => {
        withChartRef.current = false;
        handlePrint();
    };

    const handleExportCsv = () => {
        if (!hasData) return;
        const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const header = ["Vehicle"];
        (periods || []).forEach((p) =>
            metrics.forEach((m) => header.push(`${p.label} ${m.label}`))
        );
        let csv = "\ufeff" + header.map(esc).join(",") + "\n";
        vehicles.forEach((v) => {
            const cells = [v.vehicle];
            (periods || []).forEach((p, pi) =>
                metrics.forEach((m) =>
                    cells.push(v.values[pi] ? num(v.values[pi][m.key]) : "")
                )
            );
            csv += cells.map(esc).join(",") + "\n";
        });
        const totalCells = ["Total"];
        (periods || []).forEach((p, pi) =>
            metrics.forEach((m) => totalCells.push(num(totals[pi]?.[m.key])))
        );
        csv += totalCells.map(esc).join(",") + "\n";

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `fuel_${title.toLowerCase().replace(/\s+/g, "_")}_${(
            periods || []
        )
            .map((p) => p.key)
            .join("_")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full">
            {/* Controls */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <Label
                    value="Show metrics:"
                    className="font-semibold text-gray-700"
                />
                {metricConfig.map((m) => (
                    <label
                        key={m.key}
                        className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                    >
                        <Checkbox
                            checked={enabled.includes(m.key)}
                            onChange={() =>
                                setEnabled((prev) =>
                                    prev.includes(m.key)
                                        ? prev.filter((x) => x !== m.key)
                                        : [...prev, m.key]
                                )
                            }
                        />
                        {m.label}
                    </label>
                ))}
                <div className="ml-auto flex gap-2">
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!hasData}
                        onClick={printWithChart}
                    >
                        Print (with chart)
                    </Button>
                    <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={!hasData}
                        onClick={printWithoutChart}
                    >
                        Print (no chart)
                    </Button>
                    <Button
                        size="sm"
                        color="gray"
                        disabled={!hasData}
                        onClick={handleExportCsv}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Printable area */}
            <div ref={printRef} className="print-content p-2">
                <div className="print-header text-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                        IsDB-Bangladesh Islamic Solidarity Educational Wakf
                    </h2>
                    <div className="text-base font-semibold mt-1">{title}</div>
                    <div className="text-sm text-gray-500">
                        {(periods || []).map((p) => p.label).join("  |  ")}
                    </div>
                </div>

                {hasData && chartMetrics.length > 0 && (
                    <div className="chart-box print-no-break mb-5 border border-gray-200 rounded-lg p-3">
                        <div style={{ width: "100%", height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 16,
                                        right: 16,
                                        left: 24,
                                        bottom: 40,
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
                                        angle={chartData.length > 6 ? -30 : 0}
                                        textAnchor={
                                            chartData.length > 6
                                                ? "end"
                                                : "middle"
                                        }
                                        height={chartData.length > 6 ? 60 : 30}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} width={80} />
                                    <Tooltip formatter={(v) => fmt(v)} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    {chartMetrics.map((m) => (
                                        <Bar
                                            key={m.key}
                                            dataKey={m.key}
                                            name={m.label}
                                            fill={
                                                METRIC_COLORS[m.key] ||
                                                "#64748b"
                                            }
                                            radius={[3, 3, 0, 0]}
                                            maxBarSize={60}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {hasData ? (
                    <div className="overflow-x-auto">
                        <table className="fuel-compare-table min-w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th
                                        className="border border-gray-300 px-3 py-2 text-left font-semibold align-bottom"
                                        rowSpan={2}
                                    >
                                        Vehicle
                                    </th>
                                    {(periods || []).map((p) => (
                                        <th
                                            key={p.key}
                                            colSpan={metrics.length || 1}
                                            className="border border-gray-300 px-3 py-2 text-center font-semibold"
                                        >
                                            {p.label}
                                        </th>
                                    ))}
                                </tr>
                                <tr className="bg-gray-100">
                                    {(periods || []).map((p) =>
                                        metrics.map((m) => (
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
                                {vehicles.map((v) => (
                                    <tr key={v.id ?? v.vehicle}>
                                        <td className="border border-gray-300 px-3 py-1.5">
                                            {v.vehicle}
                                        </td>
                                        {(periods || []).map((p, pi) =>
                                            metrics.map((m) => (
                                                <td
                                                    key={`${p.key}-${m.key}`}
                                                    className="border border-gray-300 px-3 py-1.5 text-right"
                                                >
                                                    {v.values[pi]
                                                        ? fmt(
                                                              v.values[pi][
                                                                  m.key
                                                              ]
                                                          )
                                                        : "-"}
                                                </td>
                                            ))
                                        )}
                                    </tr>
                                ))}
                                <tr className="bg-gray-200 font-bold">
                                    <td className="border border-gray-300 px-3 py-2">
                                        Total
                                    </td>
                                    {(periods || []).map((p, pi) =>
                                        metrics.map((m) => (
                                            <td
                                                key={`${p.key}-${m.key}`}
                                                className="border border-gray-300 px-3 py-2 text-right"
                                            >
                                                {fmt(totals[pi]?.[m.key])}
                                            </td>
                                        ))
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center text-gray-500">
                        {isLoading
                            ? "Loading report..."
                            : "No data. Select periods and press Show Comparison."}
                    </div>
                )}

                {hasData && (
                    <div className="mt-4 pt-2 border-t border-gray-300 text-center text-xs text-gray-500">
                        Grand total — Quantity: {fmt(grand.quantity)} | Cost:{" "}
                        {fmt(grand.cost)} | Mileage: {fmt(grand.millage)}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .fuel-compare-table td,
                .fuel-compare-table th {
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
                    .print-content table {
                        width: 100% !important;
                        font-size: 10px !important;
                    }
                    .print-content th,
                    .print-content td {
                        padding: 2px 4px !important;
                    }
                    .print-no-break {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .print-content.hide-chart .chart-box {
                        display: none !important;
                    }
                    @page {
                        margin: 0.4in;
                        size: A4 landscape;
                    }
                }
            `}</style>
        </div>
    );
}
