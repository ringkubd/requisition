import React, {useRef } from "react";
import { useSingleProductQuery } from "@/store/service/product/product";
import Select from "react-select";

const UpdateVariantForm = ({row, changeProduct}) => {
    const reference = useRef();
    const {data, isLoading, isSuccess, isError, refetch} = useSingleProductQuery(row.product_id, {
        skip: !row.product_id,
    });

    const updateProduct = (e, newProductOption) => {
        const newOptionId = e.target.value;
        newProductOption['product'] = row;
        return changeProduct(newProductOption);
    }
    return (
        <div className={`w-full border-1 border-gray-300`}>
            {
                isSuccess && (
                    <Select
                        ref={reference}
                        onChange={(newValue) => {
                            updateProduct(newValue?.value, newValue?.data);
                        }}
                        value={{value: row.product_option_id, label: row.product_option?.option_value}}
                        options={ data?.data?.product_options?.map((po)=> ({value: po.id, label: po.option_value, data: po}))}
                        className={`select`}
                        classNames={{
                            control: state => `select`
                        }}
                    />
                )
            }
        </div>
    )
};
export default UpdateVariantForm;
