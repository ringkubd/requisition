import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    activity: [],
}

const ActivitySlice = createSlice({
    name: 'dashboardSlice',
    initialState,
    reducers: {
        getActivity: (state, action) => {
            return state.activity
        },
        setActivity: (state, action) => {
            state.activity = action.payload
        },
        setSingleActivity: (state, action) => {
            state.activity = [action.payload, ...state.activity]
        },
    },
})

export const {
    getActivity,
    setActivity,
    setSingleActivity,
} = ActivitySlice.actions
export default ActivitySlice
