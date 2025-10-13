import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface AppState {
    userId: string;
    loggedIn: boolean;
    jwtToken: string | null;
};    




const initialState: AppState = {
    userId: "",
    loggedIn: false,
    jwtToken: localStorage.getItem('token') || null,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateUserId(state, action: PayloadAction<string>) {
            state.userId = action.payload;
        },
        login(state, action: PayloadAction<string>) {
            state.loggedIn = true;
            state.jwtToken = action.payload
        },
        logout(state) {
            state.loggedIn = false;
            state.jwtToken = null;
            state.userId = "";
            // Clear all localStorage items
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            // Clear any other potential localStorage items
            localStorage.clear();
        },
        clearAllData(state) {
            // Reset to initial state
            state.loggedIn = false;
            state.jwtToken = null;
            state.userId = "";
            // Clear all localStorage items
            localStorage.clear();
        },
    },
});

export const { updateUserId, login, logout, clearAllData } = appSlice.actions;
export default appSlice.reducer;