import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    products: [],
}

export const PurchaseRequisitionInputChangeSlice = createSlice({
    name: 'purchase_requisition_input_change',
    initialState,
    reducers: {
        getPurchaseRequisitionData: state => {
            return state.products
        },
        setPurchaseRequisitionData: (state, action) => {
            state.products = [...state.products, action.payload]
        },
        setAllPurchaseRequisitionData: (state, action) => {
            state.products = action.payload
        },
        updatePurchaseRequisitionData: (state, action) => {
            state.products = state.products.map(p => {
                if (p.id == action.payload.id) {
                    return action.payload
                }
                return p
            })
        },
        removePurchaseRequisitionData: state => {
            state.products = []
        },
    },
})

export const {
    getPurchaseRequisitionData,
    setPurchaseRequisitionData,
    setAllPurchaseRequisitionData,
    updatePurchaseRequisitionData,
    removePurchaseRequisitionData,
} = PurchaseRequisitionInputChangeSlice.actions
export default PurchaseRequisitionInputChangeSlice.reducer
