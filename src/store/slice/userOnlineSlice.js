import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user_list: [],
    number_of_user: 0,
};
export const UserOnlineSlice = createSlice({
    name: "user_online_slice",
    initialState,
    reducers: {
        setAllOnline: (state, { payload }) => {
            state.user_list = Array.isArray(payload) ? payload : [];
            state.number_of_user = state.user_list.length;
        },
        addNewOnline: (state, { payload }) => {
            // Check if user already exists to prevent duplicates
            const exists = state.user_list.some((u) => u.id === payload.id);
            if (!exists) {
                state.user_list = [...state.user_list, payload];
                state.number_of_user = state.user_list.length;
            }
        },
        removeOnline: (state, { payload }) => {
            state.user_list = state.user_list.filter(
                (u) => u.id !== payload.id
            );
            state.number_of_user = state.user_list.length;
        },
    },
});

export const {
    setAllOnline,
    addNewOnline,
    removeOnline,
} = UserOnlineSlice.actions;
export default UserOnlineSlice.reducer;
