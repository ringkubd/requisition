import moment from "moment/moment";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    startDate: moment().startOf('month').format('Y-MM-DD'),
    endDate: moment().endOf('month').format('Y-MM-DD'),
}

export const FilterDateRange = createSlice({
    name: 'filter_date_range',
    initialState,
    reducers: {
        setDateRange: (state, {payload}) =>{
            state.startDate = payload.startDate;
            state.endDate = payload.endDate;
        },
        setChangeDate: (state, {payload}) => {
            state = {...state, payload}
        },
    }
})
export const {
    setChangeDate,
    setDateRange,
} = FilterDateRange.actions;
export default FilterDateRange.reducer;
