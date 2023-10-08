import React from "react";
import { useDispatch } from "react-redux";
import { updatePurchaseRequisitionData } from "@/store/service/requisitions/purchase_requisition_input_change";

const PurchaseInput = ({ row, price }) => {

    const dispatch = useDispatch();
    const onInputChange = async e => {
        const {name, value} = e.target;
        const newRow = {...row, price: value}
        dispatch(updatePurchaseRequisitionData(newRow))
    }
    return (
        <div key={row.id}>
            <input
                type={"number"}
                step={0.1}
                className={`form-input rounded border max-w-[6rem]`}
                onChange={onInputChange}
                name={row.id}
                value={price}
            />
        </div>
    )
}

export default PurchaseInput;
