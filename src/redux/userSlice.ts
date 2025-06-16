import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "./states";




const initialState: UserState = {
    userId: localStorage.getItem('userId') || "",
    name: "",
    picture: "",
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser(state, action: PayloadAction<UserState>) {
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.picture = action.payload.picture;

        },
    },
});


export const { updateUser } = userSlice.actions;
export default userSlice.reducer;