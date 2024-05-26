import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    initial: [],
    purchase: [],
    cash: [],
}

const DashboardSlice = createSlice({
    name: 'dashboardSlice',
    initialState,
    reducers: {
        getInitialRequisition: (state, action) => {
            return state.initial
        },
        setInitialRequisition: (state, action) => {
            state.initial = action.payload
        },
        setSingleInitialRequisition: (state, action) => {
            state.initial = [action.payload, ...state.initial]
        },
        updateSingleInitialRequisition: (state, action) => {
            state.initial = state.initial.map(il => {
                if (il.id === action.payload.id) {
                    return action.payload
                }
                return il
            })
        },
    },
})

export const {
    getInitialRequisition,
    setInitialRequisition,
    setSingleInitialRequisition,
    updateSingleInitialRequisition,
} = DashboardSlice.actions
export default DashboardSlice
