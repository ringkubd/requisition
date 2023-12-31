import React, { useState } from "react";
import { TextInput } from "flowbite-react";
import { useUpdateIssueQuantityMutation } from "@/store/service/issue";

const Quantity = ({row}) => {
    const [update, {data, isLoading, isError, isSuccess}] = useUpdateIssueQuantityMutation();
    const [value, setValue] = useState(row.quantity)
    return (
        <div>
            <TextInput
                value={value}
                disabled={isLoading || isError}
                onChange={(e) => {
                    setValue(e.target.value)
                }}
                onBlur={() => {
                    update({
                        id: row.id,
                        quantity: value
                    })
                }}
            />
        </div>
    )
}
export default Quantity;
