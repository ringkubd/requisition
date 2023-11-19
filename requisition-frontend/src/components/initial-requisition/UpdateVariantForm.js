import React, { useEffect, useRef, useState } from "react";
import Select2Component from "@/components/select2/Select2Component";
import { useSingleProductQuery } from "@/store/service/product/product";

const UpdateVariantForm = ({row, changeProduct}) => {
    const reference = useRef();
    const {data, isLoading, isSuccess, isError, refetch} = useSingleProductQuery(row.product_id, {
        skip: !row.product_id,
    });
    const [newProduct, setNewProduct] = useState(data?.data);
    useEffect(() => {
        setNewProduct(data?.data)
    }, [isSuccess, isLoading, data])

    const updateProduct = (e, product) => {
        const newOptionId = e.target.value;
        const newProductOption = product?.product_options.filter((po) => po.id == newOptionId)[0];
        newProductOption['product'] = product;
        return changeProduct(newProductOption);
    }
    return (
        <div className={`w-full border-1 border-gray-300`}>
            {
                isSuccess && (
                    <Select2Component
                        className={`w-full border-1 border-gray-300`}
                        ref={reference}
                        onChange={(e, data) => {
                            updateProduct(e, data);
                        }}
                        value={row.product_option_id}
                        options={ newProduct?.product_options?.map((po)=> ({value: po.id, label: po.title}))}
                        data-data={ JSON.stringify(newProduct)}
                    />
                )
            }
        </div>
    )
};
export default UpdateVariantForm;
