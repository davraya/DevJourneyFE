import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { WeeklyJournalResponse, JournalEntry } from "../types/WeeklyJournalResponse";
import { fetchUserJournals, editEntry } from "../api/journals";

interface JournalState {
  journal: WeeklyJournalResponse[] | null;
  isSaving: boolean;
  error: string | null;
}

const initialState: JournalState = {
  journal: null,
  isSaving: false,
  error: null,
};

// Fetch weekly journal
export const fetchJournal = createAsyncThunk(
  "journal/fetchJournal",
  async (userId: string) => {
    return await fetchUserJournals(userId);
  }
);

export const saveJournal = createAsyncThunk(
  "journal/saveJournal",
  async ({ userId, journalId, updatedEntry }: { userId: string; journalId: string; updatedEntry: JournalEntry }) => {
    await editEntry(userId, journalId, updatedEntry.id, updatedEntry.content);
    return { journalId, updatedEntry }; // Return structured payload
  }
);
  

const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {
    updateEntry(state, action: PayloadAction<{ entryId: string; content: string; journalId: string }>) {
      const { entryId, content, journalId } = action.payload;
      const weeklyJournal = state.journal?.find((j) => j.id === journalId);
      if (weeklyJournal){
        const entry = weeklyJournal.journalEntries.find((e) => e.id === entryId);  
        if (entry) entry.content = content; // Update content in the state
      }
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournal.fulfilled, (state, action: PayloadAction<WeeklyJournalResponse[]>) => {
        state.journal = action.payload;
        state.error = null;
      })
      .addCase(fetchJournal.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch journal";
      })
      .addCase(saveJournal.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveJournal.fulfilled, (state, action: PayloadAction<{ journalId: string; updatedEntry: JournalEntry }>) => {
        const { journalId, updatedEntry } = action.payload;
        const weeklyJournal = state.journal?.find((j) => j.id === journalId);
        if (weeklyJournal) {
          const entry = weeklyJournal.journalEntries.find((e) => e.id === updatedEntry.id);
          if (entry) {
            entry.content = updatedEntry.content; // Update the content
          }
        }
        state.isSaving = false;
        state.error = null;
      })
      .addCase(saveJournal.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.error.message || "Failed to save journal entry";
      });
  },
});

export const { updateEntry } = journalSlice.actions;
export default journalSlice.reducer;
