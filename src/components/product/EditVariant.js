import { useEffect, useState } from 'react'
import { useUpdateProductOptionsMutation } from '@/store/service/product/product_option'
import { useDispatch } from 'react-redux'
import { ProductApiService } from '@/store/service/product/product'
import { Select } from 'flowbite-react'
import { toast } from 'react-toastify'
// import Select from "react-select";

const EditVariant = ({ selectedOption, options, rowId }) => {
    const [
        update,
        { data, isLoading, isError, isSuccess },
    ] = useUpdateProductOptionsMutation()
    const [value, setValue] = useState(selectedOption)
    const dispatch = useDispatch()

    useEffect(() => {
        if (isSuccess) {
            dispatch(
                ProductApiService.util.invalidateTags([
                    'product',
                    'editProduct',
                ]),
            )
            toast.success('Successfully updated.')
        }
    }, [isLoading, isSuccess])
    return (
        <div>
            <Select
                value={value}
                onChange={e => {
                    update({
                        id: rowId,
                        option_id: e.target.value,
                    })
                    setValue(e.target.value)
                }}>
                <option value=""></option>
                {options?.data?.map(o => (
                    <option key={o.id} value={o.id}>
                        {o.name}
                    </option>
                ))}
            </Select>
        </div>
    )
}
export default EditVariant
