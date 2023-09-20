import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: "",
    csrf_token: ""
}

export const userSlice = createSlice({
    name: 'user_slice',
    initialState,
    reducers: {
        getUser: (state) => {
            return state.user
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    }
});

export const { getUser, setUser } =  userSlice.actions;
export default userSlice.reducer;
