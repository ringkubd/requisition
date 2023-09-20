import {createSlice} from "@reduxjs/toolkit";
const initialState = {
    basic: {}
}
export const ProductBasicFormSlice = createSlice({
    name: 'product_basic_form',
    initialState,
    reducers: {
        getProductBasicInfo: state => {
            return state.basic
        },
        setProductBasicInfo: (state, action) => {
            state.basic = action.payload;
        },
        resetProductBasicInfo: state => {
            state.basic = {};
        }
    }
});

export const {getProductBasicInfo, setProductBasicInfo, resetProductBasicInfo} = ProductBasicFormSlice.actions;

export default ProductBasicFormSlice.reducer;
