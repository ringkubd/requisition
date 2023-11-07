import React, { useEffect, useState } from "react";
import { TextInput } from "flowbite-react";
import moment from "moment";
import { useUpdatePurchaseRequisitionMutation } from "@/store/service/requisitions/purchase";

const UpdatePno = ({value, requisition_id, created}) =>{
    const [updatePo, result] =  useUpdatePurchaseRequisitionMutation();
    const [inputValue, setInputValue] = useState(value);
    console.log(value);
    useEffect(() => {
        console.log(result)
    }, [result])
    const update = (e) => {
        updatePo({id: requisition_id, po_no: e.target.value})
    }

    return (
        <div className={`flex flex-row justify-center items-center`}>
            <div className={`w-20`}>
                <TextInput
                    value={inputValue}
                    onBlur={update}
                    className={`max-w-sm`}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
            <div>/{moment(created).format('YY')}</div>
        </div>
    )
}
export default UpdatePno;
