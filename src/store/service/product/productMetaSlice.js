import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    metas: [],
}

export const productMetaSlice = createSlice({
    name: 'product_meta',
    initialState,
    reducers: {
        getProductMetas: state => {
            return state.metas
        },
        setProductMeta: (state, action) => {
            state.metas = [...state.metas, action.payload]
        },
        setEditProductMeta: (state, action) => {
            state.metas = action.payload
        },
        resetProductMeta: state => {
            state.metas = []
        },
    },
})

export const {
    getProductMetas,
    setProductMeta,
    resetProductMeta,
    setEditProductMeta,
} = productMetaSlice.actions
export default productMetaSlice.reducer
