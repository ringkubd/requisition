import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePurchaseRequisitionData } from "@/store/service/requisitions/purchase_requisition_input_change";

const PurchaseInput = forwardRef(({ row, price, unit_price,...rest }, ref) => {

    const dispatch = useDispatch();
    const [unitPrice, setUnitPrice] = useState(price??unit_price);
    const [updateRow, setUpdateRow] = useState(row);
    const onInputChange = async e => {
      const {name, value} = e.target;
      var newRow = row;
      if (unit_price){
        newRow = {...row, unit_price: value}
      }else{
        newRow = {...row, price: value}
      }
      setUnitPrice(value);
      setUpdateRow(newRow);
      dispatch(updatePurchaseRequisitionData(newRow))
      return newRow;
    }

    const getUpdatedData = () => {
      return updateRow;
    }

    useImperativeHandle(ref, () => ({
      onInputChange,
      unitPrice,
      updateRow,
      getUpdatedData,
    }))

    return (
        <div key={row.id}>
            <input
                type={'number'}
                step={0.1}
                className={`form-input rounded border max-w-[6rem]`}
                onChange={onInputChange}
                name={row.id}
                value={unitPrice}
                {...rest}
            />
        </div>
    )
  });

export default PurchaseInput;
