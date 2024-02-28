import {createSlice} from "@reduxjs/toolkit";
const initialState = {
    page: 1,
}

const SupplierSlice = createSlice({
    name: 'supplier_slice',
    initialState,
    reducers: {
        setSupplierSearch: (state, {payload}) => {
            state.name = payload?.name
            state.page = payload.page
        }
    }
})

export const {
    setSupplierSearch,
} = SupplierSlice.actions;
export default SupplierSlice;
