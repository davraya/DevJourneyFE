import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JournalResponse } from "../types/JournalResponse";

interface JournalState {
  journal: JournalResponse | null;
  lastFetched: number | null;
}

const initialState: JournalState = {
  journal: null,
  lastFetched: null,
};

const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {
    setJournal(state, action: PayloadAction<JournalResponse | null>) {
      state.journal = action.payload;
      state.lastFetched = action.payload ? Date.now() : null;
    },
    clearJournal(state) {
      state.journal = null;
      state.lastFetched = null;
    },
  },
});

export const { setJournal, clearJournal } = journalSlice.actions;
export default journalSlice.reducer;

