import React, { forwardRef, useEffect, useRef, useState } from 'react'
import moment from 'moment/moment'
import number2wordEnglish from 'number2english_word'
import './RequisitionPrint.module.css'
import './RequisitionPrintResponsive.css'
import Image from 'next/image'

const RequisitionPrintWhatsApp = forwardRef(
    ({ mainData, requisition_products }, ref) => {
        const accountsCopy = useRef()
        const requisitorCopy = useRef()
        const hrRef = useRef()
        const [rejected, setRejected] = useState(false)

        useEffect(() => {
            const accountsCopyHeight = accountsCopy.current.offsetHeight
            const requisitorCopyHeight = requisitorCopy.current.offsetHeight
            const totalHeight = accountsCopyHeight + requisitorCopyHeight

            if (totalHeight > 1000) {
                accountsCopy.current.classList.add('break-after-page')
                requisitorCopy.current.classList.add('mt-4')
                hrRef.current?.classList?.add('hidden')
            } else {
                accountsCopy.current.classList.remove('break-after-page')
                hrRef.current?.classList?.remove('hidden')
            }
        })
        useEffect(() => {
            if (mainData?.purchase_current_status?.status === 'Rejected') {
                setRejected(true)
            }
            if (mainData?.current_status?.status === 'Rejected') {
                setRejected(true)
            }
        }, [mainData])

        return (
            <div
                className={`flex flex-col w-full m-2 sm:m-4 justify-center justify-items-center p-2 sm:p-4 shadow-none dark:bg-white print:m-0 print:p-4`}
                ref={ref}>
                {rejected ? (
                    <Image
                        src={require('../../../public/rejected.png')}
                        alt={`rejected`}
                        className={`absolute opacity-5 top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 print:opacity-5 print:top-[50%] print:left-[35%]`}
                    />
                ) : (
                    ''
                )}
                <div
                    className={`flex flex-col w-full justify-center justify-items-center shadow-none printBody`}>
                    {/*Header*/}
                    <div
                        className={`flex flex-col shadow-none`}
                        ref={accountsCopy}>
                        <div className={`text-center font-bold`}>
                            <h2>
                                IsDB-Bangladesh Islamic Solidarity Educational
                                Wakf (IsDB-BISEW)
                            </h2>
                        </div>
                        <div
                            className={`flex justify-center items-center justify-items-center text-center`}>
                            <p
                                className={`py-1 px-4 underline bg-gray-300 w-fit`}>
                                Purchase Requisition Form
                            </p>
                        </div>
                        <div
                            className={`flex justify-center items-center justify-items-center text-center`}>
                            <i
                                className={`px-4 w-fit font-extralight font-serif`}>
                                (Account's Copy)
                            </i>
                        </div>
                        <div
                            className={`flex flex-col sm:flex-row items-stretch justify-between my-2 w-full gap-2 sm:gap-0`}>
                            <div
                                className={`flex flex-row w-full justify-start text-sm sm:text-base`}>
                                <i className={`pr-2 sm:pr-4`}>Date: </i>
                                <p className={`underline`}>
                                    {moment(mainData?.created_at).format(
                                        'DD-MMM-Y',
                                    )}
                                </p>
                            </div>
                            <div
                                className={`flex flex-row w-full justify-center text-sm sm:text-base`}>
                                <i className={`pr-1 sm:pr-2`}>I.R. NO. </i>
                                <p className={`underline`}>
                                    {mainData?.irf_no}
                                </p>
                            </div>
                            <div className={`flex flex-row w-full justify-end text-sm sm:text-base`}>
                                <i className={`pr-1 sm:pr-2`}>P.R. NO. </i>
                                <p className={`underline`}>
                                    {mainData?.prf_no}
                                </p>
                            </div>
                        </div>
                        <div className={`flex flex-col text-sm shadow-none`}>
                            <div>
                                Please arrange estimated Tk.{' '}
                                <strong
                                    className={`underline font-bold italic`}>
                                    {Math.round(
                                        mainData?.estimated_total_amount,
                                    ).toLocaleString()}
                                    /-
                                </strong>{' '}
                                (In Words){' '}
                                <strong
                                    className={`underline font-bold italic`}>
                                    {mainData?.estimated_total_amount === 0
                                        ? 'Zero'
                                        : number2wordEnglish(
                                            Math.round(
                                                mainData?.estimated_total_amount,
                                            ).toString() ?? 0,
                                        )}

                                </strong>{' '}
                                for purchase of the following:
                            </div>
                            <div className="relative overflow-x-auto">
                                <table
                                    className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                                    <thead
                                        className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                                        <tr>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-6 normal-case`}>
                                                Sl.#
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 normal-case min-w-[120px]`}>
                                                Name of the Item
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-20 sm:w-24 normal-case`}>
                                                Last Purchase Date
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-12 normal-case`}>
                                                Unit
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Available Quantity
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Required Quantity
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Qty to be Purchase
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Unit Price
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 normal-case min-w-[100px]`}>
                                                Purpose
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Estimated Cost
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody
                                        className={`shadow-none text-gray-800 text-xs sm:text-sm`}>
                                        {requisition_products?.map(
                                            (rp, index) => (
                                                <tr
                                                    className={`border text-center bg-white`}
                                                    key={index}>
                                                    <td
                                                        className={`border p-1 sm:p-2`}>
                                                        {index + 1}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-left text-xs sm:text-sm`}>
                                                        {rp.title}{' '}
                                                        {rp?.product_option?.option_name?.includes(
                                                            'N/A',
                                                        ) ||
                                                        rp?.product_option?.option_value?.includes(
                                                            'NA',
                                                        )
                                                            ? null
                                                            : `- ${rp?.product_option?.option_value}`}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.last_purchase_date
                                                            ? moment(
                                                                  rp.last_purchase_date,
                                                              ).format(
                                                                  'DD-MMM-YY',
                                                              )
                                                            : ''}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.product?.unit}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.available_quantity}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.required_quantity}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {
                                                            rp.quantity_to_be_purchase
                                                        }
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.unit_price.toLocaleString()}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm text-left`}>
                                                        {rp.purpose}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-right text-xs sm:text-sm`}>
                                                        {Math.round(
                                                            parseFloat(
                                                                rp.unit_price *
                                                                    rp.quantity_to_be_purchase,
                                                            ),
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        <tr>
                                            <th
                                                colSpan={9}
                                                className={`border py-0 px-2 text-right bg-white`}>
                                                Total:{' '}
                                            </th>
                                            <td
                                                className={`border py-0 text-right font-bold`}>
                                                {Math.round(
                                                    mainData?.estimated_total_amount,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className={`my-1`}></div>
                            {/*Table Two*/}
                            <div className="relative overflow-x-auto print:overflow-visible">
                                <table
                                    className={`w-full text-left text-xs shadow-none min-w-[600px] print:min-w-0 print:text-xs`}>
                                    <tbody className={`shadow-none`}>
                                        <tr className="flex flex-col lg:table-row">
                                            <td className={`border px-2 py-2 w-full lg:w-auto lg:table-cell`}>
                                                <div
                                                    className={`flex flex-col w-full`}>
                                                    <div
                                                        className={`flex flex-row items-center w-full text-sm sm:text-base`}>
                                                        Requisitioned by{' '}
                                                        <div className={'ml-1'}>
                                                            <div>
                                                                {
                                                                    mainData
                                                                        ?.user
                                                                        ?.name
                                                                }
                                                            </div>
                                                            <div
                                                                className={`underline w-full text-xs sm:text-sm`}>
                                                                {mainData?.created_at
                                                                    ? moment(
                                                                          mainData?.created_at,
                                                                      ).format(
                                                                          'hh:mm A - DD MMM Y',
                                                                      )
                                                                    : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/*<div*/}
                                                    {/*    className={`flex flex-row my-4`}>*/}
                                                    {/*    <div>Signature</div>*/}
                                                    {/*    <div*/}
                                                    {/*        className={`min-w-max border-b border-black w-full`}></div>*/}
                                                    {/*</div>*/}
                                                    <div
                                                        className={`flex flex-row my-4 items-center text-sm sm:text-base`}>
                                                        <div
                                                            className={`min-w-fit`}>
                                                            Section Head
                                                        </div>
                                                        <div
                                                            className={`border-b border-black w-full flex flex-col ml-2`}>
                                                            <span
                                                                className={`text-xs sm:text-sm`}>
                                                                {mainData
                                                                    ?.approval_status
                                                                    ?.department_approved_at
                                                                    ? mainData
                                                                          ?.approval_status
                                                                          ?.departmentApprovedBy
                                                                          ?.name
                                                                    : ''}
                                                            </span>
                                                            <span
                                                                className={`text-xs sm:text-sm`}>
                                                                {mainData
                                                                    ?.approval_status
                                                                    ?.department_approved_at
                                                                    ? moment(
                                                                          mainData
                                                                              ?.approval_status
                                                                              ?.department_approved_at,
                                                                      ).format(
                                                                          'hh:mm A - DD MMM Y',
                                                                      )
                                                                    : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`mt-4`}>
                                                        <input
                                                            type="checkbox"
                                                            className={'mx-4 w-4 h-4 sm:w-5 sm:h-5'}
                                                        />
                                                        <label className="text-sm sm:text-base">
                                                            Urgent Nature
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                className={`border text-xs px-2 w-full lg:w-auto lg:table-cell`}>
                                                <div
                                                    className={`flex flex-col`}>
                                                    <div
                                                        className={`flex flex-wrap justify-between gap-2 sm:gap-4 mb-4`}>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className={`form-checkbox mr-2 w-4 h-4 sm:w-5 sm:h-5`}
                                                                checked={
                                                                    mainData?.payment_type ===
                                                                    1
                                                                }
                                                                disabled
                                                            />
                                                            <label htmlFor="" className="text-sm sm:text-base">
                                                                Cash
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className={`form-checkbox mr-2 w-4 h-4 sm:w-5 sm:h-5`}
                                                                checked={
                                                                    mainData?.payment_type ===
                                                                    2
                                                                }
                                                                disabled
                                                            />
                                                            <label htmlFor="" className="text-sm sm:text-base">
                                                                Cheque
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className={`form-checkbox mr-2 w-4 h-4 sm:w-5 sm:h-5`}
                                                                checked={
                                                                    mainData?.payment_type ===
                                                                    3
                                                                }
                                                                disabled
                                                            />
                                                            <label htmlFor="" className="text-sm sm:text-base">
                                                                LPO
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`flex flex-col sm:flex-row my-4 gap-2 sm:gap-0`}>
                                                        <div
                                                            className={`w-full sm:w-5/12 mr-0 pr-0 flex items-center`}>
                                                            <input
                                                                type="checkbox"
                                                                className={`form-checkbox mr-2 w-4 h-4 sm:w-5 sm:h-5`}
                                                                checked={
                                                                    mainData?.payment_type ===
                                                                    4
                                                                }
                                                                disabled
                                                            />
                                                            <label htmlFor="" className="text-sm sm:text-base">
                                                                Fund available
                                                            </label>
                                                        </div>
                                                        <div
                                                            className={`flex flex-row ml-0 pl-0 w-full sm:w-auto`}>
                                                            <div className={`flex items-center mr-2`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className={`form-checkbox mr-2 w-4 h-4 sm:w-5 sm:h-5`}
                                                                    checked={
                                                                        mainData?.payment_type ===
                                                                        5
                                                                    }
                                                                    disabled
                                                                />
                                                            </div>
                                                            <div className={`text-sm sm:text-base mr-2`}>
                                                                Maybe arranged
                                                                on
                                                            </div>
                                                            <div
                                                                className={`border-b border-black w-20 sm:w-24`}></div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`flex flex-col`}>
                                                        <div
                                                            className={`flex flex-row my-4 items-center text-sm sm:text-base`}>
                                                            <div>
                                                                Accounts Officer
                                                            </div>

                                                            <div
                                                                className={`w-1/2 border-b border-black flex flex-col ml-2`}>
                                                                <span
                                                                    className={`text-xs sm:text-sm`}>
                                                                    {mainData
                                                                        ?.approval_status
                                                                        ?.accounts_approved_at
                                                                        ? mainData
                                                                              ?.approval_status
                                                                              ?.accountsApprovedBy
                                                                              ?.name
                                                                        : ''}
                                                                </span>
                                                                <span
                                                                    className={`text-xs sm:text-sm`}>
                                                                    {mainData
                                                                        ?.approval_status
                                                                        ?.accounts_approved_at
                                                                        ? moment(
                                                                              mainData
                                                                                  ?.approval_status
                                                                                  ?.accounts_approved_at,
                                                                          ).format(
                                                                              'hh:mm A - DD MMM Y',
                                                                          )
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={`text-center text-xs sm:text-sm`}>
                                                            [Requisitor to
                                                            initiate follow-up
                                                            action]
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`border px-2 w-full lg:w-auto lg:table-cell`}>
                                                <div
                                                    className={`flex flex-col justify-items-between items-baseline justify-between min-h-full h-36 sm:h-40`}>
                                                    <div
                                                        className={`text-center w-full text-sm sm:text-base`}>
                                                        Approved for payment
                                                    </div>
                                                    <div
                                                        className={`w-full flex flex-col`}>
                                                        <span
                                                            className={`ml-2 text-xs sm:text-sm`}>
                                                            {mainData
                                                                ?.approval_status
                                                                ?.ceo_approved_at
                                                                ? 'Neaz Khan'
                                                                : ''}
                                                        </span>
                                                        <span
                                                            className={`ml-2 text-xs sm:text-sm`}>
                                                            {mainData
                                                                ?.approval_status
                                                                ?.ceo_approved_at
                                                                ? moment(
                                                                      mainData
                                                                          ?.approval_status
                                                                          ?.ceo_approved_at,
                                                                  ).format(
                                                                      'hh:mm A - DD MMM Y',
                                                                  )
                                                                : ''}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`text-center border-t border-black w-full text-xs sm:text-sm pt-1`}>
                                                        Chief Executive Officer
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className={`flex flex-col sm:flex-row my-6 gap-4 sm:gap-0`}>
                                <div className={`flex flex-row w-full sm:w-1/4 text-sm`}>
                                    <div>Received Tk.</div>
                                    <div
                                        className={`border-b border-black w-24 ml-2`}></div>
                                </div>
                                <div className={`flex flex-row w-full sm:w-2/4 text-sm`}>
                                    <div>Name</div>
                                    <div
                                        className={`border-b border-black w-full sm:w-80 ml-2`}></div>
                                </div>
                                <div className={`flex flex-row w-full sm:w-1/4 text-sm`}>
                                    <div>Signature</div>
                                    <div
                                        className={`border-b border-black w-32 ml-2`}></div>
                                </div>
                            </div>
                            <div className={`flex flex-col sm:flex-row gap-4 sm:gap-0`}>
                                <div className={`flex flex-row w-full sm:w-3/4 text-sm`}>
                                    <div>
                                        Authorized Signature (Accounts Dept.)
                                    </div>
                                    <div
                                        className={`border-b border-black w-full sm:w-80 ml-2`}></div>
                                </div>
                                <div className={`flex flex-row w-full sm:w-1/4 text-sm mt-4 sm:mt-0`}>
                                    <div>Date</div>
                                    <div
                                        className={`border-b border-black w-40 ml-2`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*  End Header  */}
                    <hr
                        ref={hrRef}
                        className={`my-16 h-px bg-gray-400 border-2 border-dashed`}
                    />
                    <div
                        className={`flex flex-col shadow-none`}
                        ref={requisitorCopy}>
                        <div
                            className={`flex justify-center items-center justify-items-center text-center`}>
                            <h2
                                className={`py-1 px-4 underline bg-gray-300 w-fit`}>
                                Purchase Requisition Form
                            </h2>
                        </div>
                        <div
                            className={`flex justify-center items-center justify-items-center text-center`}>
                            <i
                                className={`py-1 px-4 w-fit font-extralight font-serif`}>
                                (Requisitor's Copy)
                            </i>
                        </div>
                        <div
                            className={`flex flex-col sm:flex-row items-stretch justify-between mt-2 w-full gap-2 sm:gap-0`}>
                            <div
                                className={`flex flex-row w-full justify-start text-sm sm:text-base`}>
                                <i className={`pr-2 sm:pr-4`}>Date: </i>
                                <p className={`underline`}>
                                    {moment(mainData?.created_at).format(
                                        'DD-MMM-Y',
                                    )}
                                </p>
                            </div>
                            <div className={`flex flex-row w-full text-sm sm:text-base`}>
                                <i className={`pr-0`}>Recieved Tk. </i>
                                <p className={`border-b border-black w-20`}></p>
                            </div>
                            <div
                                className={`flex flex-row w-full justify-center text-sm sm:text-base`}>
                                <i className={`pr-1 sm:pr-2`}>I.R. NO. </i>
                                <p className={`underline`}>
                                    {mainData?.irf_no}
                                </p>
                            </div>
                            <div className={`flex flex-row w-full justify-end text-sm sm:text-base`}>
                                <i className={`pr-1 sm:pr-2`}>P.R. NO. </i>
                                <p className={`underline`}>
                                    {mainData?.prf_no}
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
                                                className={`border bg-white leading-3 p-1 w-6 normal-case`}>
                                                Sl.#
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 normal-case min-w-[120px]`}>
                                                Name of the Item
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-20 sm:w-24 normal-case`}>
                                                Last Purchase Date
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-12 normal-case`}>
                                                Unit
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Available Quantity
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Required Quantity
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Qty to be Purchase
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Unit Price
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 normal-case min-w-[100px]`}>
                                                Purpose
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 p-1 w-16 sm:w-20 normal-case`}>
                                                Estimated Cost
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody
                                        className={`shadow-none text-gray-800 text-xs sm:text-sm`}>
                                        {requisition_products?.map(
                                            (rp, index) => (
                                                <tr
                                                    className={`border text-center bg-white`}
                                                    key={index}>
                                                    <td
                                                        className={`border p-1 sm:p-2`}>
                                                        {index + 1}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-left text-xs sm:text-sm`}>
                                                        {rp.title}{' '}
                                                        {rp?.product_option?.option_name?.includes(
                                                            'N/A',
                                                        ) ||
                                                        rp?.product_option?.option_value?.includes(
                                                            'NA',
                                                        )
                                                            ? null
                                                            : `- ${rp?.product_option?.option_value}`}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.last_purchase_date
                                                            ? moment(
                                                                  rp.last_purchase_date,
                                                              ).format(
                                                                  'DD-MMM-YY',
                                                              )
                                                            : ''}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.product?.unit}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.available_quantity}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.required_quantity}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {
                                                            rp.quantity_to_be_purchase
                                                        }
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm`}>
                                                        {rp.unit_price.toLocaleString()}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-xs sm:text-sm text-left`}>
                                                        {rp.purpose}
                                                    </td>
                                                    <td
                                                        className={`border p-1 sm:p-2 text-right text-xs sm:text-sm`}>
                                                        {parseFloat(
                                                            rp.unit_price *
                                                                rp.quantity_to_be_purchase,
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        <tr>
                                            <th
                                                colSpan={9}
                                                className={`border py-0 px-2 text-right bg-white`}>
                                                Total:{' '}
                                            </th>
                                            <td
                                                className={`border py-0 text-right font-bold`}>
                                                {Math.round(
                                                    mainData?.estimated_total_amount,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
)
export default RequisitionPrintWhatsApp
