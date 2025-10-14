import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface AppState {
    userId: string;
    loggedIn: boolean;
    jwtToken: string | null;
};    




const token = localStorage.getItem('token');
const initialState: AppState = {
    userId: "",
    loggedIn: !!token, // Set loggedIn to true if token exists
    jwtToken: token,
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
            state.jwtToken = action.payload;
        },
        logout(state) {
            state.loggedIn = false;
            state.jwtToken = null;
            state.userId = "";
            // Clear only specific localStorage items
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPicture');
        },
        clearAllData(state) {
            // Reset to initial state
            state.loggedIn = false;
            state.jwtToken = null;
            state.userId = "";
            // Clear only specific localStorage items
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPicture');
        },
    },
});

export const { updateUserId, login, logout, clearAllData } = appSlice.actions;
export default appSlice.reducer;