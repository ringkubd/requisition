import { forwardRef } from "react";
import './Print.module.css';
import moment from "moment/moment";
import Loading from "@/components/loading";

const PurchaseReport = forwardRef(({data,isLoading, columns}, ref) => {
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
                        Item
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Variant
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Purchase Date
                    </th>
                    {
                        columns.supplier ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                Supplier
                            </th>
                        ) : null
                    }
                    {
                        columns.department ? (
                            <th
                                scope="col"
                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                Dep.
                            </th>
                        ) : null
                    }
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Qty.
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Rate
                    </th>
                    <th
                        scope="col"
                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                        Sum
                    </th>
                </tr>
                </thead>
                <tbody className={`shadow-none text-gray-800`}>
                {
                    data && data?.purchase?.map((p, index) => (
                        <tr key={p.id} className={`border bg-white`}>
                            <td className={`border`}>{index + 1}</td>
                            {
                                columns.category ? (
                                    <td className={`border text-left p-1`}>{p.product_category}</td>
                                ) : null
                            }
                            <td className={`border text-left p-1`}>{p.product_title}</td>
                            <td className={`border`}>{p?.productOption?.title}</td>
                            <td className={`border`}>{moment(p?.purchase_date).format("DD MMM Y")}</td>
                            {
                                columns.supplier ? (
                                    <td className={`border text-left p-1`}>{p?.supplier?.name}</td>
                                ) : null
                            }
                            {
                                columns.department ? (
                                    <td className={`border`}>{p?.requisite_department}</td>
                                ) : null
                            }
                            <td className={`border`}>{p.qty}{p.product?.unit}</td>
                            <td className={`border`}>{parseFloat(p.unit_price).toLocaleString()}</td>
                            <td className={`border`}>{parseFloat(p?.total_price).toLocaleString()}</td>
                        </tr>
                    ))
                }
                <tr>
                    <td className={`border text-right p-2 font-bold`} colSpan={6+Object.keys(Object.filter(columns, ([name, status]) => status === true)).length}>Total Amount</td>
                    <td className={`border p-1 font-bold`}>{
                        parseFloat(data?.purchase?.reduce((p,c) =>{
                            return c.total_price + p;
                        } ,0)).toLocaleString()
                    }</td>
                </tr>
                </tbody>
            </table>
        </div>
    )
});

export default PurchaseReport;
