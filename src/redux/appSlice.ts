import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface AppState {
    monday: string
    selectedDate: string;
    userId: string;
    loggedIn: boolean;
    jwtToken: string | null;
};    


const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}


function getMonday(date: Date) {
    const day = date.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ...)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
    date.setDate(diff); // Set the date to the calculated Monday
    return formatDate(date); // Return the formatted date    
}
      

const initialState: AppState = {
    monday: getMonday(new Date()),
    selectedDate: formatDate(new Date()),
    userId: "",
    loggedIn: false,
    jwtToken: localStorage.getItem('token') || null,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateDate(state, action: PayloadAction<string>) {
            state.selectedDate = action.payload;
        },
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
            localStorage.removeItem('token');
        },
    },
});

export const { updateDate, updateUserId, login, logout } = appSlice.actions;
export default appSlice.reducer;