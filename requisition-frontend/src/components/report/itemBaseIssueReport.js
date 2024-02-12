'use client'
import { forwardRef, useEffect, useState } from "react";
import moment from "moment";
import './Print.module.css';
import Loading from "@/components/loading";

const ItemBaseIssueReport = forwardRef(({data, isLoading, columns}, ref) => {
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
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        SL#
                    </th>

                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Item
                    </th>
                    {
                        columns.category ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                Category
                            </th>
                        ) : null
                    }
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Variant
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Issued
                    </th>
                    {
                        columns.avg ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                Avg. Rate
                            </th>
                        ) : null
                    }
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Sum
                    </th>
                </tr>
                </thead>
                <tbody className={`shadow-none text-gray-800`}>
                {issues &&
                    Object.keys(issues)?.map((d, i) => (
                        <>
                            <tr
                                className={`border text-center bg-white`}
                                key={i}>
                                <td className={`border p-0`}>
                                    {i + 1}
                                </td>
                                <td className={`border p-0 break-words text-left`}>
                                    {d}
                                </td>
                                {
                                    columns.category ? (
                                        <td className={`border p-0 text-left`}>
                                            {issues[d][0].category.title}
                                        </td>
                                    ) : null}
                                <td>{issues[d][0].variant?.option_value}</td>
                                <td className={`border p-0`}>
                                    { issues[d].reduce((o, n) => {
                                        return o +  n?.quantity
                                    },0).toFixed(2)}
                                    {issues[d][0].product?.unit}
                                </td>
                                {
                                    columns.avg ? (
                                        <td className={`border p-0`}>
                                            {parseFloat(issues[d][0].average_rate).toFixed(2)}
                                        </td>
                                    ) : null
                                }
                                <td className={`border p-0`}>
                                    { issues[d].reduce((o, n) => {
                                        return o +  n?.total_price
                                    },0).toFixed(2)}
                                </td>
                            </tr>
                        </>
                    ))}
                <tr>
                    <th colSpan={4 + Object.keys(Object.filter(columns, ([name, status]) => status === true)).length}
                        className={`text-right border`}>
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

export default ItemBaseIssueReport;
