import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    productOptions: [],
}
export const optionSlice = createSlice({
    name: 'options',
    initialState,
    reducers: {
        getOptions: state => {
            return state.productOptions
        },
        setProductOptionsLocal: (state, action) => {
            state.productOptions = [...state.productOptions, action.payload]
        },
        setEditProductOptionsLocal: (state, action) => {
            state.productOptions = action.payload
        },
        resetProductOptionsLocal: state => {
            state.productOptions = []
        },
    },
})

export const {
    getOptions,
    setProductOptionsLocal,
    resetProductOptionsLocal,
    setEditProductOptionsLocal,
} = optionSlice.actions
export default optionSlice.reducer
