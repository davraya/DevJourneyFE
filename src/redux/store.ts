import { configureStore } from "@reduxjs/toolkit";
import journalReducer from "./journalSlice";
import appReducer from "./appSlice";
import userReducer from "./userSlice";
import interviewsReducer from "./interviewsSlice";

// Create and configure the store
export const store = configureStore({
  reducer: {
    journal: journalReducer, // Add your journal slice here
    app: appReducer, // Add your app slice here
    user: userReducer, // Add your user slice here
    interviews: interviewsReducer,
  },
});

// Types for Redux
export type RootState = ReturnType<typeof store.getState>; // Global state type
export type AppDispatch = typeof store.dispatch; // Dispatch type
