import React, { forwardRef, useRef } from 'react'
import moment from 'moment/moment'

const IssuePrint = forwardRef(({ products }, ref) => {
    const accountsCopy = useRef()
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
                        </div>
                        <div>
                            <div className={`border-2 p-1 font-normal text-xs`}>
                                {products.receiver_department?.name}/
                                {products.id}
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`flex flex-col justify-center items-center justify-items-center text-center`}>
                    <p className={`py-1 px-4 underline bg-gray-300 w-fit`}>
                        Issue Form
                    </p>
                </div>
                <div
                    className={`flex flex-row items-stretch justify-between my-2 w-full`}>
                    <div className={`flex flex-row w-full justify-start`}>
                        <i className={`pr-4`}>Date: </i>
                        <p className={`underline`}>
                            {moment(products?.created_at).format('DD MMM Y')}
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
                                        rowSpan={2}
                                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                        Sl.#
                                    </th>
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Name of the Item
                                    </th>
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Use Date
                                    </th>
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Purpose
                                    </th>
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Uses Area
                                    </th>
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Note
                                    </th>
                                    <th
                                        scope="col"
                                        colSpan={3}
                                        className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}>
                                        Stock Status
                                    </th>
                                </tr>
                                <tr>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-2 px-2 normal-case`}>
                                        Stock
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-2 px-2 normal-case`}>
                                        Issued
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-2 px-2 normal-case`}>
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                className={`shadow-none text-gray-800 text-center p-2`}>
                                {products.products?.map((p, i) => (
                                    <tr>
                                        <td className={`border p-1`}>
                                            {i + 1}
                                        </td>
                                        <td className={`border text-left p-1`}>
                                            {p?.product?.title}{' '}
                                            {!p?.variant?.option_value.includes(
                                                'N/A',
                                            ) &&
                                            !p?.variant?.option_value?.includes(
                                                'NA',
                                            )
                                                ? '- ' +
                                                  p?.variant?.option_value
                                                : ''}
                                        </td>
                                        <td className={`border p-1`}>
                                            {moment(p?.use_date).format(
                                                'DD MMM Y',
                                            )}
                                        </td>
                                        <td className={`border p-1`}>
                                            {p?.purpose}
                                        </td>
                                        <td className={`border p-1`}>
                                            {p?.uses_area}
                                        </td>
                                        <td className={`border p-1`}>
                                            {p?.note}
                                        </td>
                                        <td className={`border p-1`}>
                                            {p?.balance_before_issue}
                                            {p?.balance_before_issue
                                                ? p?.product?.unit
                                                : ''}
                                        </td>
                                        <td className={`border p-1`}>
                                            {p?.quantity}
                                            {p?.product?.unit}
                                        </td>
                                        <td className={`border p-1`}>
                                            {p?.balance_after_issue}
                                            {p?.balance_after_issue
                                                ? p?.product?.unit
                                                : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className={`my-4`}></div>
                        <div
                            className={`flex flex-row justify-between text-center mt-24`}>
                            <div
                                className={`flex flex-col min-h-[20px] justify-end`}>
                                <span>{products?.issuer?.name}</span>
                                <small>
                                    {products?.created_at
                                        ? moment(products?.created_at).format(
                                              'hh:mm A - DD MMM Y',
                                          )
                                        : ''}
                                </small>
                                <h2 className={`border-t border-black px-16`}>
                                    Requisitor
                                </h2>
                            </div>
                            <div
                                className={`flex flex-col min-h-[20px] justify-end`}>
                                {products?.department_status === 1 ? (
                                    <div
                                        className={`flex flex-col min-h-[20px] justify-end`}>
                                        <span>
                                            {
                                                products?.departmentApprovedBY
                                                    ?.name
                                            }
                                        </span>
                                        <small>
                                            {products?.department_approved_at
                                                ? moment(
                                                      products?.department_approved_at,
                                                  ).format('hh:mm A - DD MMM Y')
                                                : ''}
                                        </small>
                                    </div>
                                ) : !products?.department_status ? (
                                    'Pending'
                                ) : (
                                    'Rejected'
                                )}

                                <h2 className={`border-t border-black px-16`}>
                                    {products?.receiver_department?.name}{' '}
                                    Department
                                </h2>
                            </div>
                            <div
                                className={`flex flex-col min-h-[20px] justify-end`}>
                                {products?.store_status === 1 ? (
                                    <div
                                        className={`flex flex-col min-h-[20px] justify-end`}>
                                        <span>
                                            {products?.storeApprovedBY?.name}
                                        </span>
                                        <small>
                                            {products?.store_approved_at
                                                ? moment(
                                                      products?.store_approved_at,
                                                  ).format('hh:mm A - DD MMM Y')
                                                : ''}
                                        </small>
                                    </div>
                                ) : !products?.store_status ? (
                                    'Pending'
                                ) : (
                                    'Rejected'
                                )}

                                <h2 className={`border-t border-black px-16`}>
                                    Store
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
export default IssuePrint
