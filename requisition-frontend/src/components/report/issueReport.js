import { forwardRef } from "react";
import moment from "moment";
import './Print.module.css';
import Loading from "@/components/loading";

const IssueReport = forwardRef(({data, isLoading}, ref) => {
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
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                            Category
                        </th>
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
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                            Issuer
                        </th>
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} rowSpan={2}>
                            Dep.
                        </th>
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`} colSpan={3}>
                            Balance
                        </th>
                        <th
                            scope="col"
                            className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}  rowSpan={2}>
                            Avg. Rate
                        </th>
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
                                        key={j * 999}>
                                        {j === 0 ? (
                                            <>
                                                <td
                                                    className={`border p-0`}
                                                    rowSpan={issues[d].length}>
                                                    {i + 1}
                                                </td>
                                                <td
                                                    className={`border p-0 break-words`}
                                                    rowSpan={issues[d].length}>
                                                    {d}
                                                </td>
                                            </>
                                        ) : null}
                                        <td className={`border p-0`}>
                                            {item.product?.title}
                                        </td>
                                        <td>{item.variant?.option_value}</td>
                                        <td className={`border p-0`}>
                                            {moment(
                                                item.product_issue.issue_time,
                                            ).format('DD MMM Y')}
                                        </td>
                                        <td
                                            className={`border p-0 break-words`}>
                                            {item.product_issue?.issuer?.name}
                                        </td>
                                        <td className={`border p-0`}>
                                            {
                                                item.product_issue
                                                    ?.issuer_department?.name
                                            }
                                        </td>
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
                                        <td className={`border p-0`}>
                                            {item.average_rate}
                                        </td>
                                        <td className={`border p-0`}>
                                            {item.total_price}
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ))}
                    <tr>
                        <th colSpan={11} className={`text-right border`}>
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
