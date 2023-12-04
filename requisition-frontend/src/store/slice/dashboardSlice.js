import {createSlice} from "@reduxjs/toolkit";
const initialState = {
    initial: [],
    purchase: [],
    cash: []
}

const DashboardSlice = createSlice({
    name: 'dashboardSlice',
    initialState,
    reducers: {
        getInitialRequisition: (state, action) => {
            return state.initial;
        },
        setInitialRequisition: (state, action) => {
            state.initial = action.payload;
        },
        setSingleInitialRequisition: (state, action) => {
            state.initial = [action.payload, ...state.initial]
        }
    }
})

export const {
    getInitialRequisition,
    setInitialRequisition,
    setSingleInitialRequisition,
} = DashboardSlice.actions;
export default DashboardSlice;
