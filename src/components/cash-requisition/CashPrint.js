import React, { forwardRef, useEffect, useRef, useState } from "react";
import moment from "moment/moment";
import number2wordEnglish from "number2english_word";
import "./CashPrint.module.css";
import Image from "next/image";

const CashPrint = forwardRef(({ mainData, requisition_products }, ref) => {
    const accountsCopy = useRef();
    const requisitorCopy = useRef();
    const hrRef = useRef();
    const [rejected, setRejected] = useState(false);

    useEffect(() => {
        const accountsCopyHeight = accountsCopy.current.offsetHeight;
        const requisitorCopyHeight = requisitorCopy.current.offsetHeight;
        const totalHeight = accountsCopyHeight + requisitorCopyHeight;

        if (totalHeight > 1000) {
            accountsCopy.current.classList.add("break-after-page");
            requisitorCopy.current.classList.add("mt-4");
            hrRef.current?.classList?.add("hidden");
        } else {
            accountsCopy.current.classList.remove("break-after-page");
            hrRef.current?.classList?.remove("hidden");
        }
    });
    useEffect(() => {
        if (mainData?.purchase_current_status?.status === "Rejected") {
            setRejected(true);
        }
        if (mainData?.current_status?.status === "Rejected") {
            setRejected(true);
        }
    }, [mainData]);

    return (
        <div
            className={`flex flex-col w-full m-0 md:m-2 justify-center justify-items-center p-0 md:p-4 shadow-none print:m-2 print:p-4`}
            ref={ref}
        >
            {rejected ? (
                <Image
                    src={require("../../../public/rejected.png")}
                    alt={`rejected`}
                    className={`absolute opacity-5 top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 print:opacity-5 print:top-[50%] print:left-[35%]`}
                />
            ) : (
                ""
            )}
            <div
                className={`flex flex-col w-full justify-start md:justify-center justify-items-start md:justify-items-center shadow-none printBody print:justify-center print:justify-items-center`}
            >
                <div className={`w-full`}>
                    {/*Header*/}
                    <div
                        className={`flex flex-col shadow-none`}
                        ref={accountsCopy}
                    >
                        <div className={`text-center font-bold`}>
                            <h2>
                                IsDB-Bangladesh Islamic Solidarity Educational
                                Wakf (IsDB-BISEW)
                            </h2>
                        </div>
                        <div
                            className={`flex flex-col justify-center items-center justify-items-center text-center`}
                        >
                            <p
                                className={`py-1 px-4 underline bg-gray-300 w-fit`}
                            >
                                Purchase Requisition Form
                            </p>
                        </div>
                        <div
                            className={`flex justify-center items-center justify-items-center text-center`}
                        >
                            <i
                                className={`px-4 w-fit font-extralight font-serif`}
                            >
                                (Account's Copy)
                            </i>
                        </div>
                        <div
                            className={`flex flex-row items-stretch justify-between my-2 w-full`}
                        >
                            <div
                                className={`flex flex-row w-full justify-start`}
                            >
                                <i className={`pr-4`}>Date: </i>
                                <p className={`underline`}>
                                    {moment(mainData?.created_at).format(
                                        "DD-MMM-Y"
                                    )}
                                </p>
                            </div>
                            <div className={`flex flex-row w-full justify-end`}>
                                <i className={`pr-2`}>P.R. NO. </i>
                                <p className={`underline`}>
                                    {mainData?.prf_no}
                                </p>
                            </div>
                        </div>
                        <div className={`flex flex-col text-sm shadow-none`}>
                            <div>
                                Please arrange estimated Tk.{" "}
                                <strong
                                    className={`underline font-bold italic`}
                                >
                                    {mainData?.total_cost.toLocaleString()}/-
                                </strong>{" "}
                                (In Words){" "}
                                <strong
                                    className={`underline font-bold italic`}
                                >
                                    {mainData?.total_cost === 0
                                        ? "Zero"
                                        : number2wordEnglish(
                                              Math.round(
                                                  mainData?.total_cost ?? 0
                                              ).toString()
                                          )}
                                </strong>{" "}
                                for purchase of the following:
                            </div>
                            <div className="relative overflow-x-auto">
                                <table
                                    className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}
                                >
                                    <thead
                                        className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}
                                    >
                                        <tr>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}
                                            >
                                                Sl.#
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Name of the Item
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Last Purchase Date
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-0 normal-case`}
                                            >
                                                Unit
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Required Quantity
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Unit Price
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Purpose
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody
                                        className={`shadow-none text-gray-800`}
                                    >
                                        {requisition_products?.map(
                                            (rp, index) => (
                                                <tr
                                                    className={`border text-center bg-white`}
                                                    key={index}
                                                >
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {index + 1}
                                                    </td>
                                                    <td
                                                        className={`border p-0 text-left`}
                                                    >
                                                        {rp.item}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.last_purchase_date
                                                            ? moment(
                                                                  rp.last_purchase_date
                                                              ).format(
                                                                  "DD MMM Y"
                                                              )
                                                            : null}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp?.unit}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.required_unit}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.unit_price}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.purpose}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {(
                                                            parseFloat(
                                                                rp.unit_price
                                                            ) *
                                                            parseFloat(
                                                                rp.required_unit
                                                            )
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                        <tr>
                                            <th
                                                colSpan={7}
                                                className={`border py-0 px-2 text-right bg-white`}
                                            >
                                                Total:{" "}
                                            </th>
                                            <td
                                                className={`border py-0 px-2 text-center`}
                                            >
                                                {mainData?.total_cost.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className={`my-1`}></div>
                            {/*Table Two*/}
                            <div className="relative overflow-x-auto">
                                <table
                                    className={`w-full text-left text-gray-800 dark:text-gray-400 text-xs shadow-none`}
                                >
                                    <tbody className={`shadow-none`}>
                                        <tr>
                                            <td className={`border px-2 py-2`}>
                                                <div
                                                    className={`flex flex-col`}
                                                >
                                                    <div
                                                        className={`flex flex-row my-4 items-center`}
                                                    >
                                                        <div
                                                            className={`min-w-fit`}
                                                        >
                                                            Requisitioned by{" "}
                                                        </div>
                                                        <div
                                                            className={`border-b border-black w-full flex flex-col`}
                                                        >
                                                            <span
                                                                className={`ml-2`}
                                                            >
                                                                {
                                                                    mainData
                                                                        ?.user
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span
                                                                className={`ml-2`}
                                                            >
                                                                {moment(
                                                                    mainData?.created_at
                                                                ).format(
                                                                    "hh:mm A - DD MMM Y"
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/*<div*/}
                                                    {/*    className={`flex flex-row my-4`}>*/}
                                                    {/*    <div>Signature</div>*/}
                                                    {/*    <div*/}
                                                    {/*        className={`min-w-max border-b border-black w-full`}></div>*/}
                                                    {/*</div>*/}
                                                    <div
                                                        className={`flex flex-row my-4 items-center`}
                                                    >
                                                        <div
                                                            className={`min-w-fit`}
                                                        >
                                                            Section Head
                                                        </div>
                                                        <div
                                                            className={`border-b border-black w-full flex flex-col`}
                                                        >
                                                            <span
                                                                className={`ml-2`}
                                                            >
                                                                {mainData
                                                                    ?.approval_status
                                                                    ?.department_approved_at &&
                                                                mainData
                                                                    ?.approval_status
                                                                    ?.department_status ===
                                                                    2
                                                                    ? mainData
                                                                          ?.approval_status
                                                                          ?.departmentApprovedBy
                                                                          ?.name
                                                                    : ""}
                                                            </span>
                                                            <span
                                                                className={`ml-2`}
                                                            >
                                                                {mainData
                                                                    ?.approval_status
                                                                    ?.department_approved_at &&
                                                                mainData
                                                                    ?.approval_status
                                                                    ?.department_status ===
                                                                    2
                                                                    ? moment(
                                                                          mainData
                                                                              ?.approval_status
                                                                              ?.department_approved_at
                                                                      ).format(
                                                                          "hh:mm A - DD MMM Y"
                                                                      )
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`mt-4`}>
                                                        <input
                                                            type="checkbox"
                                                            className={"mx-4"}
                                                        />
                                                        <label>
                                                            Urgent Nature
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                className={`border text-xs px-2`}
                                            >
                                                <div
                                                    className={`flex flex-col`}
                                                >
                                                    <div
                                                        className={`flex flex-row justify-between`}
                                                    >
                                                        <div>
                                                            <input
                                                                type="checkbox"
                                                                checked={true}
                                                                className={`form-checkbox mr-2`}
                                                            />
                                                            <label htmlFor="">
                                                                Cash
                                                            </label>
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="checkbox"
                                                                className={`form-checkbox mr-2`}
                                                            />
                                                            <label htmlFor="">
                                                                Cheque
                                                            </label>
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="checkbox"
                                                                className={`form-checkbox mr-2`}
                                                            />
                                                            <label htmlFor="">
                                                                LPO
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`flex flex-row my-4`}
                                                    >
                                                        <div
                                                            className={`w-5/12 mr-0 pr-0`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className={`form-checkbox mr-2`}
                                                            />
                                                            <label htmlFor="">
                                                                Fund available
                                                            </label>
                                                        </div>
                                                        <div
                                                            className={`w-5/12 mr-0 pr-0`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked
                                                                className={`form-checkbox mr-2`}
                                                            />
                                                            <label htmlFor="">
                                                                Non Store Item
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`flex flex-row my-4`}
                                                    >
                                                        <div
                                                            className={`flex flex-row ml-0 pl-0`}
                                                        >
                                                            <div className={``}>
                                                                <input
                                                                    type="checkbox"
                                                                    className={`form-checkbox mr-2`}
                                                                />
                                                            </div>
                                                            <div className={``}>
                                                                Maybe arranged
                                                                on
                                                            </div>
                                                            <div
                                                                className={`border-b border-black ml-0 pl-0 w-20`}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`flex flex-col`}
                                                    >
                                                        <div
                                                            className={`flex flex-row my-4 items-center`}
                                                        >
                                                            <div>
                                                                Accounts Officer
                                                            </div>

                                                            <div
                                                                className={`w-1/2 border-b border-black flex flex-col`}
                                                            >
                                                                <span
                                                                    className={`ml-2`}
                                                                >
                                                                    {mainData
                                                                        ?.approval_status
                                                                        ?.accounts_approved_at &&
                                                                    mainData
                                                                        ?.approval_status
                                                                        ?.accounts_status ===
                                                                        2
                                                                        ? mainData
                                                                              ?.approval_status
                                                                              ?.accountsApprovedBy
                                                                              ?.name
                                                                        : ""}
                                                                </span>
                                                                <span
                                                                    className={`ml-2`}
                                                                >
                                                                    {mainData
                                                                        ?.approval_status
                                                                        ?.accounts_approved_at &&
                                                                    mainData
                                                                        ?.approval_status
                                                                        ?.accounts_status ===
                                                                        2
                                                                        ? moment(
                                                                              mainData
                                                                                  ?.approval_status
                                                                                  ?.accounts_approved_at
                                                                          ).format(
                                                                              "hh:mm A - DD MMM Y"
                                                                          )
                                                                        : ""}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={`text-center`}
                                                        >
                                                            [Requisitor to
                                                            initiate follow-up
                                                            action]
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`border px-2`}>
                                                <div
                                                    className={`flex flex-col justify-items-between items-baseline justify-between min-h-full h-36`}
                                                >
                                                    <div
                                                        className={`text-center w-full`}
                                                    >
                                                        Approved for payment
                                                    </div>
                                                    <div
                                                        className={`w-full flex flex-col`}
                                                    >
                                                        <span
                                                            className={`ml-2`}
                                                        >
                                                            {mainData
                                                                ?.approval_status
                                                                ?.ceo_approved_at &&
                                                            mainData
                                                                ?.approval_status
                                                                ?.ceo_status ===
                                                                2
                                                                ? "Neaz Khan"
                                                                : ""}
                                                        </span>
                                                        <span
                                                            className={`ml-2`}
                                                        >
                                                            {mainData
                                                                ?.approval_status
                                                                ?.ceo_approved_at &&
                                                            mainData
                                                                ?.approval_status
                                                                ?.ceo_status ===
                                                                2
                                                                ? moment(
                                                                      mainData
                                                                          ?.approval_status
                                                                          ?.ceo_approved_at
                                                                  ).format(
                                                                      "hh:mm A - DD MMM Y"
                                                                  )
                                                                : ""}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`text-center border-t border-black w-full`}
                                                    >
                                                        Chief Executive Officer
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className={`flex flex-row my-6`}>
                                <div className={`flex flex-row w-1/4 text-sm`}>
                                    <div>Received Tk.</div>
                                    <div
                                        className={`border-b border-black w-24`}
                                    ></div>
                                </div>
                                <div className={`flex flex-row w-2/4 text-sm`}>
                                    <div>Name</div>
                                    <div
                                        className={`border-b border-black w-80`}
                                    ></div>
                                </div>
                                <div className={`flex flex-row w-1/4 text-sm`}>
                                    <div>Signature</div>
                                    <div
                                        className={`border-b border-black w-32`}
                                    ></div>
                                </div>
                            </div>
                            <div className={`flex flex-row`}>
                                <div className={`flex flex-row w-3/4 text-sm`}>
                                    <div>
                                        Authorized Signature (Accounts Dept.)
                                    </div>
                                    <div
                                        className={`border-b border-black w-80`}
                                    ></div>
                                </div>
                                <div className={`flex flex-row w-1/4 text-sm`}>
                                    <div>Date</div>
                                    <div
                                        className={`border-b border-black w-40`}
                                    ></div>
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
                        ref={requisitorCopy}
                    >
                        <div
                            className={`flex flex-col justify-center items-center justify-items-center text-center`}
                        >
                            <h2
                                className={`py-1 px-4 underline bg-gray-300 w-fit`}
                            >
                                Purchase Requisition Form
                            </h2>
                        </div>
                        <div
                            className={`flex justify-center items-center justify-items-center text-center`}
                        >
                            <i
                                className={`py-1 px-4 w-fit font-extralight font-serif`}
                            >
                                (Requisitor's Copy)
                            </i>
                        </div>
                        <div
                            className={`flex flex-row items-stretch justify-between mt-2 w-full`}
                        >
                            <div
                                className={`flex flex-row w-full justify-start`}
                            >
                                <i className={`pr-2`}>Date: </i>
                                <p className={`underline`}>
                                    {moment(mainData?.created_at).format(
                                        "DD-MMM-Y"
                                    )}
                                </p>
                            </div>
                            <div className={`flex flex-row w-full`}>
                                <i className={`pr-0`}>Recieved Tk. </i>
                                <p className={`border-b border-black w-20`}></p>
                            </div>
                            <div className={`flex flex-row w-full justify-end`}>
                                <i className={`pr-2`}>P.R. NO. </i>
                                <p className={`underline`}>
                                    {mainData?.prf_no}
                                </p>
                            </div>
                        </div>
                        <div className={`flex flex-col text-sm shadow-none`}>
                            <div className="relative overflow-x-auto">
                                <table
                                    className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}
                                >
                                    <thead
                                        className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}
                                    >
                                        <tr>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-4 px-2 normal-case text-xs`}
                                            >
                                                Sl.#
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Name of the Item
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Last Purchase Date
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-0 normal-case`}
                                            >
                                                Unit
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Required Quantity
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Unit Price
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Purpose
                                            </th>
                                            <th
                                                scope="col"
                                                className={`border bg-white leading-3 py-0 px-2 normal-case`}
                                            >
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody
                                        className={`shadow-none text-gray-800`}
                                    >
                                        {requisition_products?.map(
                                            (rp, index) => (
                                                <tr
                                                    className={`border text-center bg-white`}
                                                    key={index}
                                                >
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {index + 1}
                                                    </td>
                                                    <td
                                                        className={`border p-0 text-left`}
                                                    >
                                                        {rp.item}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.last_purchase_date
                                                            ? moment(
                                                                  rp.last_purchase_date
                                                              ).format(
                                                                  "DD MMM Y"
                                                              )
                                                            : null}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp?.unit}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.required_unit}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.unit_price}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {rp.purpose}
                                                    </td>
                                                    <td
                                                        className={`border p-0`}
                                                    >
                                                        {(
                                                            parseFloat(
                                                                rp.unit_price
                                                            ) *
                                                            parseFloat(
                                                                rp.required_unit
                                                            )
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                        <tr>
                                            <th
                                                colSpan={7}
                                                className={`border py-0 px-2 text-right bg-white`}
                                            >
                                                Total:{" "}
                                            </th>
                                            <td
                                                className={`border py-0 px-2 text-center`}
                                            >
                                                {mainData?.total_cost.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
export default CashPrint;
