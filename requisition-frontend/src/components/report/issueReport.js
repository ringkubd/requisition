import { forwardRef } from "react";
import { Table } from "flowbite-react";
import moment from "moment";
import './Print.module.css';

const IssueReport = forwardRef(({data}, ref) => {

    return (
        <div
            className={`flex flex-col m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            <table className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                <thead className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                <tr>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>SL#</th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Category
                    </th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>Item</th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>Variant</th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>Unit</th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Issue Date
                    </th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Issuer
                    </th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Department
                    </th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>Qty.</th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Avg. Rate
                    </th>
                    <th scope="col" className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>Sum</th>
                </tr>
                </thead>
                <tbody className={`shadow-none text-gray-800`}>
                    {data &&
                        Object.keys(data)?.map((d, i) => (
                            <>
                                {data[d].map((item, j) => (
                                    <tr
                                        className={`border text-center bg-white`}
                                        key={j}>
                                        {
                                            j === 0 ? (
                                                <>
                                                    <td
                                                        className={`border p-0`}
                                                        rowSpan={data[d].length}>
                                                        {i + 1}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                        rowSpan={data[d].length}>
                                                        {d}
                                                    </td>
                                                </>
                                            ) : null
                                        }
                                        <td className={`border p-0`}>
                                            {item.product.title}
                                        </td>
                                        <td>{item.variant.option_value}</td>
                                        <td>{item.product.unit}</td>
                                        <td
                                            className={`border p-0`}>{moment(item.issue_time).format('DD MMM Y')}</td>
                                        <td
                                            className={`border p-0`}>{item.issuer.name}</td>
                                        <td
                                            className={`border p-0`}>{item.issuer_department?.name}</td>
                                        <td
                                            className={`border p-0`}>{item.quantity}</td>
                                        <td
                                            className={`border p-0`}>{item.average_rate}</td>
                                        <td
                                            className={`border p-0`}>{item.total_price}</td>
                                    </tr>
                                ))}
                            </>
                        ))}
                <tr>
                    <th colSpan={10} className={`text-right border`}>Total</th>
                    <th className={`text-center border`}>
                        {
                            data && Object.values(data).reduce((prev, nw) => {
                                return nw.reduce((p, n) => {
                                    return p + n.total_price
                                },prev)
                            }, 0)
                        }
                    </th>
                </tr>
                </tbody>
            </table>
        </div>
    )
});

export default IssueReport;
