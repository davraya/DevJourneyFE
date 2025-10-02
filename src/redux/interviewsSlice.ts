import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Interview } from "../types/Interview";

interface InterviewsState {
  items: Interview[];
  lastFetched: number | null;
}

const initialState: InterviewsState = {
  items: [],
  lastFetched: null,
};

const interviewsSlice = createSlice({
  name: "interviews",
  initialState,
  reducers: {
    setInterviews(state, action: PayloadAction<Interview[]>) {
      state.items = action.payload;
      state.lastFetched = Date.now();
    },
    addInterviewLocal(state, action: PayloadAction<Interview>) {
      state.items = [action.payload, ...state.items];
    },
    updateInterviewLocal(state, action: PayloadAction<Interview>) {
      state.items = state.items.map((i) => (i.id === action.payload.id ? action.payload : i));
    },
    removeInterviewLocal(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearInterviews(state) {
      state.items = [];
      state.lastFetched = null;
    },
  },
});

export const {
  setInterviews,
  addInterviewLocal,
  updateInterviewLocal,
  removeInterviewLocal,
  clearInterviews,
} = interviewsSlice.actions;

export default interviewsSlice.reducer;


