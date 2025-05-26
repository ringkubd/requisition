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
            // Validate the payload before setting it
            if ( action.payload && typeof action.payload === 'object' )
            {
                state.user = action.payload
            } else
            {
                // Log error but maintain current state (don't crash by setting invalid data)
                console.error( "Invalid user data passed to Redux setUser", action.payload )
            }
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
