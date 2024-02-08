import React, { forwardRef, useEffect, useRef, useState } from "react";
import moment from "moment";
import Image from "next/image";

const InitialPrint = forwardRef(({mainData, requisition_products}, ref) => {
    const accountsCopy = useRef();
    const requisitorCopy = useRef();
    const hrRef = useRef();
    const [rejected, setRejected] = useState(false);

    useEffect(() => {
        const accountsCopyHeight = accountsCopy.current.offsetHeight;
        const requisitorCopyHeight = requisitorCopy.current.offsetHeight;
        const totalHeight = accountsCopyHeight + requisitorCopyHeight;

        if (totalHeight > 1000){
            accountsCopy.current.classList.add('break-after-page')
            requisitorCopy.current.classList.add('mt-4')
            if(hrRef.current){
                hrRef.current.style.display = 'none';
            }
        }else {
            accountsCopy.current.classList.remove('break-after-page')
        }
    })

    useEffect(() => {
        if (mainData?.purchase_current_status?.status === "Rejected"){
            setRejected(true)
        }
        if (mainData?.current_status?.status === "Rejected"){
            setRejected(true)
        }
    }, [mainData])

    return (
        <div
            className={`flex flex-col w-[21cm] m-2 justify-center justify-items-center p-4 shadow-none print:m-5`}
            ref={ref}>
            {/*Header*/}
            {
                rejected ? (
                    <Image
                        src={require('../../../public/rejected.png')}
                        alt={`rejected`}
                        className={`absolute opacity-5 top-[50%] left-[35%]`}
                    />
                ) : ""
            }
            <div
                className={`flex flex-col shadow-none min-h-[450px]`}
                ref={accountsCopy}>
                <div className={`flex flex-row`}>
                    <div className={`w-full text-left font-bold`}>
                        <div
                            className={`border-2 text-center border-black w-60`}>
                            <h2 className={`font-extrabold italic text-xl`}>
                                IsDB-BISEW
                            </h2>
                        </div>
                    </div>
                    <div className={`text-right w-full text-xs`}>
                        <i>Form: IsDB-BISEW/Forms/ED/IR-05</i>
                    </div>
                </div>
                <div>
                    <div
                        className={`flex justify-center items-center justify-items-center text-center`}>
                        <p
                            className={`px-4 underline w-fit italic font-extralight`}>
                            Initial Requisition Form
                        </p>
                    </div>
                    <div
                        className={`flex justify-center items-center justify-items-center text-center`}>
                        <i className={`px-4 w-fit font-extralight font-serif`}>
                            (Store Copy)
                        </i>
                    </div>
                </div>
                <div
                    className={`flex flex-row items-stretch justify-between mt-2 w-full`}>
                    <div className={`flex flex-row w-full justify-start`}>
                        <i className={`pr-4`}>Date: </i>
                        <p className={`underline`}>
                            {moment(mainData?.created_at).format('DD-MMM-Y')}
                        </p>
                    </div>
                    <div className={`flex flex-row w-full justify-end`}>
                        <i className={`pr-2`}>I.R. NO. </i>
                        <p className={`underline`}>{mainData?.irf_no}</p>
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
                                        className={`border bg-white leading-3 py-4 px-2 w-6 normal-case text-xs`}>
                                        Sl.#
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Name of the Item
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-0 w-24 normal-case`}>
                                        Last Purchase Date
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-0 w-24 normal-case`}>
                                        Unit
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>
                                        Available Quantity
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>
                                        Required Quantity
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>
                                        Qty to be Purchase
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Purpose
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`shadow-none text-gray-800`}>
                                {requisition_products?.map((rp, index) => (
                                    <tr
                                        className={`border text-center bg-white`}
                                        key={index}>
                                        <td className={`border p-0`}>
                                            {index + 1}
                                        </td>
                                        <td className={`border p-0 text-left`}>
                                            {rp.title}{' '}
                                            {rp?.product_option?.option_name?.includes(
                                                'N/A',
                                            ) || rp?.product_option?.option_value?.includes(
                                                'NA',
                                            )
                                                ? null :  `- ${rp?.product_option?.option_value}`}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.last_purchase_date
                                                ? moment(
                                                      rp.last_purchase_date,
                                                  ).format('DD MMM YYYY')
                                                : ''}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp?.product?.unit}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.available_quantity}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.required_quantity}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.quantity_to_be_purchase}
                                        </td>
                                        <td className={`border p-1 text-justify text-xs leading-none`}>
                                            {rp.purpose}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={`my-1`}></div>
                    <div
                        className={`flex flex-row justify-between text-center mt-16`}>
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            <span>{mainData.user?.name}</span>
                            <small>
                                <i>{mainData.created_at}</i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                Requisitor
                            </h2>
                        </div>
                        {/*<div>*/}
                        {/*    <h2 className={`border-t border-black px-4`}>Store</h2>*/}
                        {/*</div>*/}
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            <span>
                                {
                                    mainData.approval_status
                                        ?.departmentApprovedBy?.name
                                }
                            </span>
                            <small>
                                <i>
                                    {mainData.approval_status
                                        ?.department_approved_at
                                        ? moment(
                                              mainData.approval_status
                                                  ?.department_approved_at,
                                          ).format('hh:mm A - DD MMM Y')
                                        : ''}
                                </i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                {mainData?.department?.name} Department
                            </h2>
                        </div>
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            <span>
                                {
                                    mainData.approval_status?.accountsApprovedBy
                                        ?.name
                                }
                            </span>
                            <small>
                                <i>
                                    {mainData.approval_status
                                        ?.accounts_approved_at
                                        ? moment(
                                              mainData.approval_status
                                                  ?.accounts_approved_at,
                                          ).format('hh:mm A - DD MMM Y')
                                        : ''}
                                </i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                Accounts Department
                            </h2>
                        </div>
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            {mainData.approval_status?.ceo_approved_at
                                ? <span>Neaz Khan</span> : null }
                            <small>
                                <i>
                                    {mainData.approval_status?.ceo_approved_at
                                        ? moment(
                                              mainData.approval_status
                                                  ?.ceo_approved_at,
                                          ).format('hh:mm A - DD MMM Y')
                                        : ''}
                                </i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                Chief Executive Officer
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
            {/*  End Header  */}
            <hr
                ref={hrRef}
                className={`mt-16 mb-8 h-px bg-gray-400 border-2 border-dashed`}
            />
            <div className={`flex flex-col shadow-none`} ref={requisitorCopy}>
                <div className={`flex flex-row`}>
                    <div className={`w-full text-left font-bold`}>
                        <div
                            className={`border-2 text-center border-black w-60`}>
                            <h2 className={`font-extrabold italic text-xl`}>
                                IsDB-BISEW
                            </h2>
                        </div>
                    </div>
                    <div className={`text-right w-full text-xs`}>
                        <i>Form: IsDB-BISEW/Forms/ED/IR-05</i>
                    </div>
                </div>
                <div>
                    <div
                        className={`flex justify-center items-center justify-items-center text-center`}>
                        <p
                            className={`px-4 underline w-fit italic font-extralight`}>
                            Initial Requisition Form
                        </p>
                    </div>
                    <div
                        className={`flex justify-center items-center justify-items-center text-center`}>
                        <i className={`px-4 w-fit font-extralight font-serif`}>
                            (Requisitor's copy)
                        </i>
                    </div>
                </div>
                <div
                    className={`flex flex-row items-stretch justify-between mt-2 w-full`}>
                    <div
                        className={`flex flex-row items-stretch justify-between w-full`}>
                        <div className={`flex flex-row w-full justify-start`}>
                            <i className={`pr-4`}>Date: </i>
                            <p className={`underline`}>
                                {moment(mainData?.created_at).format(
                                    'DD-MMM-Y',
                                )}
                            </p>
                        </div>
                        <div className={`flex flex-row w-full justify-end`}>
                            <i className={`pr-2`}>I.R. NO. </i>
                            <p className={`underline`}>{mainData?.irf_no}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex flex-col text-sm shadow-none`}>
                    <div className="relative overflow-x-auto">
                        <table
                            className={`mb-2 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                            <thead
                                className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                                <tr>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-4 px-2 w-6 normal-case`}>
                                        Sl.#
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Name of the Item
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 w-24 normal-case`}>
                                        Last Purchase Date
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-0 w-24 normal-case`}>
                                        Unit
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>
                                        Available Quantity
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>
                                        Required Quantity
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>
                                        Qty to be Purchase
                                    </th>
                                    <th
                                        scope="col"
                                        className={`border bg-white leading-3 py-0 px-2 normal-case`}>
                                        Purpose
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`shadow-none text-gray-800`}>
                                {requisition_products?.map((rp, index) => (
                                    <tr
                                        className={`border text-center bg-white`}
                                        key={index}>
                                        <td className={`border p-0`}>
                                            {index + 1}
                                        </td>
                                        <td className={`border p-0 text-left`}>
                                            {rp.title}{' '}
                                            {rp?.product_option?.option_name?.includes(
                                                'N/A',
                                            ) || rp?.product_option?.option_value?.includes(
                                                'NA',
                                            )
                                                ? null :  `- ${rp?.product_option?.option_value}`}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.last_purchase_date
                                                ? moment(
                                                      rp.last_purchase_date,
                                                  ).format('DD MMM Y')
                                                : ''}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp?.product?.unit}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.available_quantity}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.required_quantity}
                                        </td>
                                        <td className={`border p-0`}>
                                            {rp.quantity_to_be_purchase}
                                        </td>
                                        <td className={`border p-0 text-justify text-xs leading-none`}>
                                            {rp.purpose}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div
                        className={`flex flex-row justify-between text-center mt-20`}>
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            <span>{mainData.user?.name}</span>
                            <small>
                                <i>{mainData.created_at}</i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                Requisitor
                            </h2>
                        </div>
                        {/*<div>*/}
                        {/*    <h2 className={`border-t border-black px-10`}>Store</h2>*/}
                        {/*</div>*/}
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            <span>
                                {
                                    mainData.approval_status
                                        ?.departmentApprovedBy?.name
                                }
                            </span>
                            <small>
                                <i>
                                    {mainData.approval_status
                                        ?.department_approved_at
                                        ? moment(
                                              mainData.approval_status
                                                  ?.department_approved_at,
                                          ).format('hh:mm A - DD MMM Y')
                                        : ''}
                                </i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                {mainData?.department?.name} Department
                            </h2>
                        </div>
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            <span>
                                {
                                    mainData.approval_status?.accountsApprovedBy
                                        ?.name
                                }
                            </span>
                            <small>
                                <i>
                                    {mainData.approval_status
                                        ?.accounts_approved_at
                                        ? moment(
                                              mainData.approval_status
                                                  ?.accounts_approved_at,
                                          ).format('hh:mm A - DD MMM Y')
                                        : ''}
                                </i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                Accounts
                            </h2>
                        </div>
                        <div
                            className={`flex flex-col min-h-[20px] justify-end`}>
                            {mainData.approval_status?.ceo_approved_at
                                ? <span>Neaz Khan</span> : null }
                            <small>
                                <i>
                                    {mainData.approval_status?.ceo_approved_at
                                        ? moment(
                                              mainData.approval_status
                                                  ?.ceo_approved_at,
                                          ).format('hh:mm A - DD MMM Y')
                                        : ''}
                                </i>
                            </small>
                            <h2 className={`border-t border-black px-4`}>
                                Chief Executive Officer
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default InitialPrint;
