import {createSlice} from "@reduxjs/toolkit";
const initialState = {
    page: 1,
}

const ProductSearchSlice = createSlice({
    name: 'product_search_slice',
    initialState,
    reducers: {
        setProductSearch: (state, {payload}) => {
            state.search = payload?.search
            state.category_id = payload?.category_id
            state.page = payload.page
        }
    }
})

export const {
    setProductSearch,
} = ProductSearchSlice.actions;
export default ProductSearchSlice;
