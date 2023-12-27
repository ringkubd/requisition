import React, { forwardRef, useEffect, useRef } from "react";
import moment from "moment/moment";
import number2wordEnglish from "number2english_word";

const IssuePrint = forwardRef(({products}, ref) => {
    const accountsCopy = useRef();
    const requisitorCopy = useRef();
    const hrRef = useRef();

    return (
        <div
            className={`flex flex-col w-[21cm] m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            {/*Header*/}
            <div className={`flex flex-col shadow-none`} ref={accountsCopy}>
                <div className={`text-center font-bold`}>
                    <h2>
                        IsDB-Bangladesh Islamic Solidarity Educational Wakf
                        (IsDB-BISEW)
                    </h2>
                </div>
                <div
                    className={`flex flex-col justify-center items-center justify-items-center text-center`}>
                    <p className={`py-1 px-4 underline bg-gray-300 w-fit`}>
                         Issue Form
                    </p>
                </div>
                {/*<div*/}
                {/*    className={`flex justify-center items-center justify-items-center text-center`}>*/}
                {/*    <i className={`px-4 w-fit font-extralight font-serif`}>*/}
                {/*        (Receiver copy)*/}
                {/*    </i>*/}
                {/*</div>*/}
                <div
                    className={`flex flex-row items-stretch justify-between my-2 w-full`}>
                    <div className={`flex flex-row w-full justify-start`}>
                        <i className={`pr-4`}>Date: </i>
                        <p className={`underline`}>
                            {moment(products[0]?.issue_time).format("DD MMM Y @ hh:mm")}
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
                                    Name of the Item
                                </th>
                                <th
                                    scope="col"
                                    className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                    Avg. Rate
                                </th>
                                <th
                                    scope="col"
                                    className={`border bg-white leading-3 py-0 px-0 normal-case`}>
                                    Unit
                                </th>
                                <th
                                    scope="col"
                                    className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                    Qty.
                                </th>
                                <th
                                    scope="col"
                                    className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                    Purpose
                                </th>
                                <th
                                    scope="col"
                                    className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                    Uses Area
                                </th>
                                <th
                                    scope="col"
                                    className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                    Note
                                </th>
                            </tr>
                            </thead>
                            <tbody className={`shadow-none text-gray-800 text-center p-2`}>
                            {
                                products?.map((p, i) => (
                                    <tr>
                                        <td className={`border p-1`}>{i + 1}</td>
                                        <td className={`border text-left p-1`}>{p?.product?.title} {!p?.variant?.option_value.includes('N/A') ? '- ' + p?.variant?.option_value : ''}</td>
                                        <td className={`border p-1`}>{parseFloat(p?.average_rate).toLocaleString()}</td>
                                        <td className={`border p-1`}>{p?.product?.unit}</td>
                                        <td className={`border p-1`}>{p?.quantity}</td>
                                        <td className={`border p-1`}>{p?.purpose}</td>
                                        <td className={`border p-1`}>{p?.uses_area}</td>
                                        <td className={`border p-1`}>{p?.note}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                        <div className={`my-4`}></div>
                        <div
                            className={`flex flex-row justify-between text-center mt-24`}>
                            <div
                                className={`flex flex-col min-h-[20px] justify-end`}>
                                <span></span>
                                <small>

                                </small>
                                <h2 className={`border-t border-black px-16`}>
                                    Requisitor
                                </h2>
                            </div>
                            <div
                                className={`flex flex-col min-h-[20px] justify-end`}>
                                <small>
                                    <i>

                                    </i>
                                </small>
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
});
export default IssuePrint;
