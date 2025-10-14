import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "./states";




// Helper function to get user data from localStorage
const getUserFromStorage = (): UserState => {
    const userId = localStorage.getItem('userId') || "";
    const name = localStorage.getItem('userName') || "";
    const picture = localStorage.getItem('userPicture') || "";
    
    return { userId, name, picture };
};

const initialState: UserState = getUserFromStorage();

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser(state, action: PayloadAction<UserState>) {
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.picture = action.payload.picture;
            
            // Persist to localStorage
            localStorage.setItem('userId', action.payload.userId);
            localStorage.setItem('userName', action.payload.name);
            localStorage.setItem('userPicture', action.payload.picture);
        },
        clearUser(state) {
            state.userId = "";
            state.name = "";
            state.picture = "";
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPicture');
        },
    },
});


export const { updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;