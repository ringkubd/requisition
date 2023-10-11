import React, { forwardRef, useEffect, useRef } from "react";
import moment from "moment";

const InitialPrint = forwardRef(({mainData, requisition_products}, ref) => {
    const accountsCopy = useRef();
    const requisitorCopy = useRef();
    const hrRef = useRef();

    useEffect(() => {
        const accountsCopyHeight = accountsCopy.current.offsetHeight;
        const requisitorCopyHeight = requisitorCopy.current.offsetHeight;
        const totalHeight = accountsCopyHeight + requisitorCopyHeight;

        if (totalHeight > 1000){
            accountsCopy.current.classList.add('break-after-page')
            requisitorCopy.current.classList.add('mt-4')
            hrRef.current.hide()
        }else {
            accountsCopy.current.classList.remove('break-after-page')
        }

        console.log(requisition_products)
    })



    return (
        <div className={`flex flex-col w-[21cm] m-2 justify-center justify-items-center p-4 shadow-none`} ref={ref}>
            {/*Header*/}
            <div className={`flex flex-col shadow-none min-h-[450px]`} ref={accountsCopy}>
                <div className={`flex flex-row`}>
                    <div className={`w-full text-left font-bold`}>
                        <div className={`border-2 text-center border-black w-60`}>
                            <h2 className={`font-extrabold italic text-xl`}>IsDB-BISEW</h2>
                        </div>
                    </div>
                    <div className={`text-right w-full text-xs`}>
                        <i>Form: IsDB-BISEW/Forms/ED/IR-05</i>
                    </div>
                </div>
                <div>
                    <div className={`flex justify-center items-center justify-items-center text-center`}>
                        <p className={`px-4 underline w-fit italic font-extralight`}>Initial Requisition Form</p>
                    </div>
                    <div className={`flex justify-center items-center justify-items-center text-center`}>
                        <i className={`px-4 w-fit font-extralight font-serif`}>(Store Copy)</i>
                    </div>
                </div>
                <div className={`flex flex-row items-stretch justify-between mt-2 w-full`}>
                    <div className={`flex flex-row w-full justify-start`}>
                        <i className={`pr-4`}>Date: </i>
                        <p className={`underline`}>{moment(mainData?.created_at).format('DD-MMM-Y')}</p>
                    </div>
                    <div className={`flex flex-row w-full justify-end`}>
                        <i className={`pr-2`}>I.R.F. no. </i>
                        <p className={`underline`}>{mainData?.irf_no}</p>
                    </div>
                </div>
                <div className={`flex flex-col text-sm shadow-none`}>
                    <div className="relative overflow-x-auto">
                        <table className={`mb-3 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                            <thead className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                            <tr>
                                <th scope="col" className={`border bg-white leading-3 py-4 px-2 w-6 normal-case text-xs`}>Sl.#</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 normal-case`}>Name of the Item</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-0 w-24 normal-case`}>Last Purchase Date</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-0 w-24 normal-case`}>Unit</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>Available Quantity</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>Required Quantity</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>Qty to be Purchase</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 normal-case`}>Purpose</th>
                            </tr>
                            </thead>
                            <tbody className={`shadow-none text-gray-800`}>
                            {
                                requisition_products?.map((rp, index) => (
                                    <tr className={`border text-center bg-white`} key={index}>
                                        <td className={`border p-0`}>{index + 1}</td>
                                        <td className={`border p-0 text-left`}>{rp.title} ({rp?.product_option?.option_name} {rp?.product_option?.option_value})</td>
                                        <td className={`border p-0`}>{moment(rp.last_purchase_date).format('DD MMM YYYY')}</td>
                                        <td className={`border p-0`}>{rp?.product?.unit}</td>
                                        <td className={`border p-0`}>{rp.available_quantity}</td>
                                        <td className={`border p-0`}>{rp.required_quantity}</td>
                                        <td className={`border p-0`}>{rp.quantity_to_be_purchase}</td>
                                        <td className={`border p-0`}>{rp.purpose}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                    <div className={`my-1`}></div>
                    <div className={`flex flex-row justify-between text-center mt-16`}>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Requisitor</h2>
                        </div>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Store</h2>
                        </div>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Projects Department</h2>
                        </div>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Chief Executive Officer</h2>
                        </div>
                    </div>
                </div>
            </div>
            {/*  End Header  */}
            <hr ref={hrRef} className={`mt-16 mb-8 h-px bg-gray-400 border-2 border-dashed`}/>
            <div className={`flex flex-col shadow-none`} ref={requisitorCopy}>
                <div className={`flex flex-row`}>
                    <div className={`w-full text-left font-bold`}>
                        <div className={`border-2 text-center border-black w-60`}>
                            <h2 className={`font-extrabold italic text-xl`}>IsDB-BISEW</h2>
                        </div>
                    </div>
                    <div className={`text-right w-full text-xs`}>
                        <i>Form: IsDB-BISEW/Forms/ED/IR-05</i>
                    </div>
                </div>
                <div>
                    <div className={`flex justify-center items-center justify-items-center text-center`}>
                        <p className={`px-4 underline w-fit italic font-extralight`}>Initial Requisition Form</p>
                    </div>
                    <div className={`flex justify-center items-center justify-items-center text-center`}>
                        <i className={`px-4 w-fit font-extralight font-serif`}>(Requisitor's copy)</i>
                    </div>
                </div>
                <div className={`flex flex-row items-stretch justify-between mt-2 w-full`}>
                    <div className={`flex flex-row items-stretch justify-between w-full`}>
                        <div className={`flex flex-row w-full justify-start`}>
                            <i className={`pr-4`}>Date: </i>
                            <p className={`underline`}>{moment(mainData?.created_at).format('DD-MMM-Y')}</p>
                        </div>
                        <div className={`flex flex-row w-full justify-end`}>
                            <i className={`pr-2`}>I.R.F. no. </i>
                            <p className={`underline`}>{mainData?.irf_no}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex flex-col text-sm shadow-none`}>
                    <div className="relative overflow-x-auto">
                        <table className={`mb-2 shadow-none w-full text-sm text-left text-gray-500 dark:text-gray-400`}>
                            <thead className={`text-center italic border bg-white text-xs text-gray-700 uppercase`}>
                            <tr>
                                <th scope="col" className={`border bg-white leading-3 py-4 px-2 w-6 normal-case`}>Sl.#</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 normal-case`}>Name of the Item</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 w-24 normal-case`}>Last Purchase Date</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-0 w-24 normal-case`}>Unit</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>Available Quantity</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>Required Quantity</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 w-6 normal-case`}>Qty to be Purchase</th>
                                <th scope="col" className={`border bg-white leading-3 py-0 px-2 normal-case`}>Purpose</th>
                            </tr>
                            </thead>
                            <tbody className={`shadow-none text-gray-800`}>
                            {
                                requisition_products?.map((rp, index) => (
                                    <tr className={`border text-center bg-white`} key={index}>
                                        <td className={`border p-0`}>{index + 1}</td>
                                        <td className={`border p-0 text-left`}>{rp.title} ({rp?.product_option?.option_name} {rp?.product_option?.option_value})</td>
                                        <td className={`border p-0`}>{moment(rp.last_purchase_date).format('DD-MMM-YY')}</td>
                                        <td className={`border p-0`}>{rp?.product?.unit}</td>
                                        <td className={`border p-0`}>{rp.available_quantity}</td>
                                        <td className={`border p-0`}>{rp.required_quantity}</td>
                                        <td className={`border p-0`}>{rp.quantity_to_be_purchase}</td>
                                        <td className={`border p-0`}>{rp.purpose}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                    <div className={`flex flex-row justify-between text-center mt-20`}>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Requisitor</h2>
                        </div>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Store</h2>
                        </div>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Projects Department</h2>
                        </div>
                        <div>
                            <h2 className={`border-t border-black px-4`}>Chief Executive Officer</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default InitialPrint;
