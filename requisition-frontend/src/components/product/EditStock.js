import { TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useUpdateProductOptionsMutation } from "@/store/service/product/product_option";
import { useDispatch } from "react-redux";
import { ProductApiService } from "@/store/service/product/product";

const EditStock = ({rowId, rowValue, name = 'stock'}) => {
    const [update, {data, isLoading, isError, isSuccess}] = useUpdateProductOptionsMutation();
    const [value, setValue] = useState(rowValue);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isSuccess){
            dispatch(ProductApiService.util.invalidateTags(['product', 'editProduct']));
        }
    }, [isLoading, isSuccess]);
    return (
        <div>
            <TextInput
                name={name}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value)
                }}
                onBlur={() => {
                    const data = {
                        id: rowId,
                    };
                    data[name] = value;
                    update(data);
                }}
            />
        </div>
    )
}
export default EditStock;
