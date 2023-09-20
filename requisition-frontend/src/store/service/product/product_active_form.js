import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    activeForm: 1
}
export const ProductActiveFormSlice = createSlice({
    name: 'product_active_form',
    initialState,
    reducers: {
        getActiveForm: state => {
            return state.activeForm;
        },
        setActiveForm: (state, action) => {
            state.activeForm = action.payload;
        }
    }

});

export const {getActiveForm, setActiveForm} = ProductActiveFormSlice.actions;

export default ProductActiveFormSlice.reducer;
