import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user_list: [],
    number_of_user: 0
}
export const UserOnlineSlice = createSlice({
    name: 'user_online_slice',
    initialState,
    reducers: {
        setAllOnline: (state, {payload}) => {
            state.user_list = payload;
            state.number_of_user = payload?.length ?? 0;
        },
        addNewOnline: (state, {payload}) => {
            state.user_list = [...state.user_list, payload]
            state.number_of_user = state.user_list.length;
        },
        removeOnline: (state, {payload}) => {
            state.user_list = state.user_list.filter(u => u.id !== payload.id);
            state.number_of_user = state.user_list.length ?? 0;
        }
    }
});

export const {
    setAllOnline,
    addNewOnline,
    removeOnline
} = UserOnlineSlice.actions;
export default UserOnlineSlice.reducer;
