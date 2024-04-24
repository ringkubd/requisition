import React, { forwardRef, useRef } from "react";
import moment from "moment/moment";
import row from "@/components/ReactPDF/table/Row";

const FuelMonthlyReportPrint = forwardRef(({reports, month}, ref) => {
    const accountsCopy = useRef();
    console.log(reports)
    return (
        <div
            className={`flex flex-col w-[21cm] m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            {/*Header*/}
            <div className={`flex flex-col shadow-none`} ref={accountsCopy}>
                <div className={`text-center font-bold`}>
                    <div className={`flex flex-row justify-center`}>
                        <div className={`w-5/6 justify-center`}>
                            <h2 className={`p-1`}>
                                IsDB-Bangladesh Islamic Solidarity Educational
                                Wakf (IsDB-BISEW)
                            </h2>
                            <h4>Monthly Fuel Report</h4>
                        </div>
                    </div>
                </div>
                <div
                    className={`flex flex-row items-stretch justify-between my-2 w-full`}>
                    <div className={`flex flex-row w-full justify-start`}>
                        <i className={`pr-4`}>Month: </i>
                        <p className={`underline`}>
                            {moment('01-' + month, 'DD-MM-y').format('MMM Y')}
                        </p>
                    </div>
                </div>
                <div className={`flex flex-col text-sm shadow-none`}>
                    <div className="relative overflow-x-auto">
                        <table
                            className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                            <thead
                                className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                                <tr>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                        Sl.#
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Vehicle
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Fuel
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Start Mileage
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                        Last Mileage
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Mileage
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Quantity (ltr)
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                className={`shadow-none text-gray-800 text-center p-2`}>
                                {reports?.map((row, i) => (
                                    <tr key={i}>
                                        <td className={`border p-1`}>
                                            {i + 1}
                                        </td>
                                        <td className={`border text-left p-1`}>
                                            {row?.vehicle}
                                        </td>
                                        <td className={`border p-1`}>
                                            {row.fuel}
                                        </td>
                                        <td className={`border p-1`}>
                                            {parseFloat(row?.first_refuel_millage).toLocaleString()}
                                        </td>
                                        <td className={`border p-1`}>
                                            {parseFloat(row?.last_refuel_millage).toLocaleString()}
                                        </td>
                                        <td className={`border p-1`}>
                                            {parseFloat(row.millage) .toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                        </td>
                                        <td className={`border p-1`}>
                                            {parseFloat(row.quantity)
                                                .toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                        </td>
                                        <td className={`border p-1`}>
                                            {parseFloat(
                                                row.cost,
                                            ) .toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td
                                        colSpan={5}
                                        className={`border p-1 text-right`}>
                                        Total
                                    </td>
                                    <td className={`border p-1`}>
                                        {reports
                                            .reduce((o, n) => {
                                                return o + parseFloat(n.millage)
                                            }, 0)
                                            .toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                    </td>
                                    <td className={`border p-1`}>
                                        {reports
                                            .reduce((o, n) => {
                                                return (
                                                    o + parseFloat(n.quantity)
                                                )
                                            }, 0)
                                            .toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                    </td>
                                    <td className={`border p-1`}>
                                        {reports
                                            .reduce((o, n) => {
                                                return o + parseFloat(n.cost)
                                            }, 0)
                                            .toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
});
export default FuelMonthlyReportPrint;
