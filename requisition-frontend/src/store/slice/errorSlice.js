import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    errors: {
        status: 500,
        message: '',
    },
}
export const errorSlice = createSlice({
    name: 'rtk_errors',
    initialState,
    reducers: {
        getError: state => {
            return state.errors
        },
        setError: (state, action) => {
            state.errors = {
                message: action.payload.message,
                status: action.payload.status,
            }
        },
        restError: state => {
            state = initialState
        },
    },
})

export const { getError, setError, restError } = errorSlice.actions
export default errorSlice.reducer
