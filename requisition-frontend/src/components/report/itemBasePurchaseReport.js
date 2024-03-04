import { forwardRef } from "react";
import './Print.module.css';
import Loading from "@/components/loading";

const ItemBasePurchaseReport = forwardRef(({data,isLoading, columns}, ref) => {
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
                    {columns.variant ? (
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                            Variant
                        </th>
                    ) : null}
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        No. of Time's
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Qty.
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Avg. Rate
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Sum
                    </th>
                </tr>
                </thead>
                <tbody className={`shadow-none text-gray-800`}>
                {data?.purchase &&
                    Object.keys(data?.purchase)?.map((p, index) => (
                        <tr key={p.id} className={`border bg-white`}>
                            <td className={`border`}>{index + 1}</td>
                            {columns.category ? (
                                <td className={`border text-left p-1`}>
                                    {data?.purchase[p][0]?.product_category}
                                </td>
                            ) : null}
                            <td className={`border text-left p-1`}>
                                {data?.purchase[p][0]?.product_title}
                            </td>
                            {columns.variant ? (
                                <td className={`border`}>
                                    {
                                        data?.purchase[p][0]?.productOption
                                            ?.title
                                    }
                                </td>
                            ) : null}
                            <td className={`border text-center`}>
                                {data?.purchase[p].length}
                            </td>
                            <td className={`border text-center`}>
                                {data?.purchase[p]?.reduce((o, n) => {
                                    return o + n.qty;
                                }, 0)}
                                {data?.purchase[p][0]?.product?.unit}
                            </td>
                            <td className={`border text-right px-2`}>
                                {parseFloat(
                                    data?.purchase[p]?.reduce((o, n) => {
                                        return o + n.unit_price;
                                    }, 0) / data?.purchase[p].length
                                ).toLocaleString()}
                            </td>
                            <td className={`border text-right px-2`}>
                                {data?.purchase[p]?.reduce((o, n) => {
                                    return o + n.total_price;
                                }, 0).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                <tr>
                    <td
                        className={`border text-right p-2 font-bold`}
                        colSpan={
                            5 +
                            Object.keys(
                                Object.filter(
                                    columns,
                                    ([name, status]) => status === true,
                                ),
                            ).length
                        }>
                        Total Amount
                    </td>
                    <td className={`border p-1 font-bold text-right px-2`}>
                        {Object.keys(data?.purchase ?? [])
                            ?.reduce((o, k) => {
                                return data?.purchase[k].reduce((o, i) => {
                                    return o + i.total_price
                                }, o)
                            }, 0)
                            .toLocaleString()}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    )
});

export default ItemBasePurchaseReport;
