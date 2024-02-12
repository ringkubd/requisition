'use client'
import { forwardRef, useEffect, useState } from "react";
import moment from "moment";
import './Print.module.css';
import Loading from "@/components/loading";

const IssueReport = forwardRef(({data, isLoading, columns}, ref) => {
    const {issues} = data ?? {};
    if (isLoading){
        return <Loading />
    }
    return (
        <div
            className={`flex flex-col m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            <table
                className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                <thead
                    className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                <tr>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                        SL#
                    </th>
                    {
                        columns.category ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                                Category
                            </th>
                        ) : null
                    }
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                        Item
                    </th>

                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                        Variant
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                        Issue Date
                    </th>
                    {
                        columns.issuer  ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                                Issuer
                            </th>
                        ) : null
                    }
                    {
                        columns.department === true ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                                Dep.
                            </th>
                        ) : null
                    }
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} colSpan={3}>
                        Balance
                    </th>
                    {
                        columns.avg ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}  rowSpan={2}>
                                Avg. Rate
                            </th>
                        ) : null
                    }
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                        Sum
                    </th>
                </tr>
                <tr>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Before
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Issued
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        After
                    </th>
                </tr>
                </thead>
                <tbody className={`shadow-none text-gray-800`}>
                {issues &&
                    Object.keys(issues)?.map((d, i) => (
                        <>
                            {issues[d].map((item, j) => (
                                <tr
                                    className={`border text-center bg-white`}
                                    key={j * 9999}>
                                    {j === 0 ? (
                                        <>
                                            <td
                                                className={`border p-0`}
                                                rowSpan={issues[d].length}>
                                                {i + 1}
                                            </td>
                                            {
                                                columns.category ? (
                                                    <td
                                                        className={`border p-0 px-1 break-words align-middle text-left`}
                                                        rowSpan={issues[d].length}>
                                                        {d}
                                                    </td>) : null }
                                        </>
                                    ) : null}

                                    <td className={`border px-1 text-left`}>
                                        {item.product?.title}
                                    </td>
                                    <td className={`text-left px-1`}>{item.variant?.option_value}</td>
                                    <td className={`border p-0`}>
                                        {moment(
                                            item.use_date,
                                        ).format('DD MMM Y')}
                                    </td>
                                    {
                                        columns.issuer ? (
                                            <td
                                                className={`border px-1 break-words text-left`}>
                                                {item.product_issue?.issuer?.name}
                                            </td>
                                        ) : null
                                    }
                                    {
                                        columns.department ? (
                                            <td className={`border p-0`}>
                                                {
                                                    item.product_issue
                                                        ?.issuer_department?.name
                                                }
                                            </td>
                                        ) : null}
                                    <td className={`border p-0`}>
                                        {item.balance_before_issue}
                                        {item.product?.unit}
                                    </td>
                                    <td className={`border p-0`}>
                                        {item.quantity}
                                        {item.product?.unit}
                                    </td>
                                    <td className={`border p-0`}>
                                        {item.balance_after_issue}
                                        {item.product?.unit}
                                    </td>
                                    {
                                        columns.avg ? (
                                            <td className={`border p-0`}>
                                                {parseFloat(item.average_rate).toFixed(2)}
                                            </td>
                                        ) : null
                                    }
                                    <td className={`border p-0`}>
                                        {item.total_price}
                                    </td>
                                </tr>
                            ))}
                        </>
                    ))}
                <tr>
                    <th colSpan={7+Object.keys(Object.filter(columns, ([name, status]) => status === true)).length} className={`text-right border`}>
                        Total
                    </th>
                    <th className={`text-center border`}>
                        {issues &&
                            parseFloat(
                                Object.values(issues).reduce((prev, nw) => {
                                    return nw.reduce((p, n) => {
                                        return p + n.total_price
                                    }, prev)
                                }, 0),
                            ).toLocaleString()}
                    </th>
                </tr>
                </tbody>
            </table>
        </div>
    )
});

export default IssueReport;
