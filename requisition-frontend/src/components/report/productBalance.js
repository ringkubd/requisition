import { forwardRef } from "react";
import './Print.module.css';
import Loading from "@/components/loading";

const ProductBalance = forwardRef(({data,isLoading, columns}, ref) => {
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
                        Stock
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Current Stock
                    </th>
                </tr>
                </thead>
                <tbody className={`shadow-none text-gray-800 text-center`}>
                {
                    data?.balance?.map((b,i) => (
                        <tr key={b.id} className={`border bg-white`}>
                            <td className={`border`}>{i + 1}</td>
                            {columns.category ? (
                                <td className={`border text-left p-1`}>
                                    {b.category?.title}
                                </td>
                            ) : null}
                            <td className={`border text-left  p-1`}>
                                {b?.title}
                            </td>
                            <td className={`border`}>
                                {b?.product_current_balance} {b?.unit}
                            </td>
                            <td className={`border`}>{b?.total_stock} {b?.unit}</td>
                        </tr>
                    ))
                }

                </tbody>
            </table>
        </div>
    )
});

export default ProductBalance;
