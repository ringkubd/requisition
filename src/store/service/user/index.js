import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: {},  // Changed from empty string to empty object
    csrf_token: '',
    selected_branch: '',
}

export const userSlice = createSlice( {
    name: 'user_slice',
    initialState,
    reducers: {
        getUser: state =>
        {
            return state.user
        },
        setUser: ( state, action ) =>
        {
            state.user = action.payload
        },
        setSelectedBranch: ( state, action ) =>
        {
            state.selected_branch = action.payload
        },
        getSelectedBranch: state =>
        {
            return state.selected_branch
        },
    },
} )

export const {
    getUser,
    setUser,
    setSelectedBranch,
    getSelectedBranch,
} = userSlice.actions
export default userSlice.reducer
