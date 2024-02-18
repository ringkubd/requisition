import { forwardRef } from "react";
import './Print.module.css';
import Loading from "@/components/loading";

const BothReport = forwardRef(({data,isLoading, columns}, ref) => {
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
                        {columns.category ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                Category
                            </th>
                        ) : null}
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                            Item
                        </th>
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                            Prev. Balance
                        </th>
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                            Purchase Qty.
                        </th>
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                            Issue Qty.
                        </th>
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                            Current Stock
                        </th>
                    </tr>
                </thead>
                <tbody className={`shadow-none text-gray-800`}>
                    {data &&
                        Object.keys(data?.both)?.map((p, index) => (
                            <tr key={p.id} className={`border bg-white`}>
                                <td className={`border`}>{index + 1}</td>
                                {columns.category ? (
                                    <td className={`border text-left p-1`}>
                                        {data?.both[p][0].category?.title}
                                    </td>
                                ) : null}
                                <td className={`border text-left p-1`}>
                                    {data?.both[p][0].title}
                                </td>
                                <td className={`border text-center p-1`}>
                                    {data?.both[p]
                                        .reduce((o, n) => {
                                            return n.product_options.reduce(
                                                (o, p) => {
                                                    return (
                                                        o + p.issue_qty - p.purchase_history_qty + p.stock
                                                    )
                                                },
                                                o,
                                            )
                                        }, 0)
                                        .toFixed(2)} {data?.both[p][0]?.unit}
                                </td>
                                <td className={`border text-center`}>
                                    {data?.both[p]
                                        .reduce((o, n) => {
                                            return n.product_options.reduce(
                                                (o, p) => {
                                                    return (
                                                        o +
                                                        p.purchase_history_qty
                                                    )
                                                },
                                                o,
                                            )
                                        }, 0)
                                        .toFixed(2)}
                                    {data?.both[p][0]?.unit}
                                </td>
                                <td className={`border text-center`}>
                                    {data?.both[p]
                                        .reduce((o, n) => {
                                            return n.product_options.reduce(
                                                (o, p) => {
                                                    return o + p.issue_qty
                                                },
                                                o,
                                            )
                                        }, 0)
                                        .toFixed(2)}
                                    {data?.both[p][0]?.unit}
                                </td>
                                <td className={`border text-center`}>
                                    {data?.both[p]
                                        .reduce((o, n) => {
                                            return o + n.total_stock
                                        }, 0)
                                        .toFixed(2)}
                                    {data?.both[p][0]?.unit}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
});

export default BothReport;
