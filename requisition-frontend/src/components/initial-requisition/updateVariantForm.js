import React, { useRef, useState } from "react";
import { useSingleProductQuery } from "@/store/service/product/product";
import { Select } from "flowbite-react";

const UpdateVariantForm = ({row, changeProduct}) => {
    const reference = useRef();
    const [value, setValue] = useState(row.product_option_id);
    const {data, isLoading, isSuccess, isError, refetch} = useSingleProductQuery(row.product_id, {
        skip: !row.product_id,
    });

    const updateProduct = (e, newProductOption) => {
        newProductOption['product'] = row.product;
        return changeProduct(newProductOption);
    }
    return (
        <div className={`w-full border-1 border-gray-300`}>
            {
                isSuccess && (
                    <Select
                        ref={reference}
                        onChange={(e) => {
                            if ( e.target.selectedOptions[0].dataset?.data){
                                updateProduct(e.target.value, JSON.parse(e.target.selectedOptions[0].dataset?.data));
                            }
                            setValue(e.target.value)
                        }}
                        value={value}
                        className={`select`}
                        classNames={{
                            control: state => `select`
                        }}
                    >
                        <option value=""></option>
                        {
                            data?.data?.product_options?.map((po) => (
                                <option data-data={JSON.stringify(po)} key={po.id} value={po.id}>{po.option_value}</option>
                            ))
                        }

                    </Select>
                )
            }
        </div>
    )
};
export default UpdateVariantForm;
