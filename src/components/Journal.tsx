import React, { useState, useEffect } from "react";

import { Box, Textarea, Spinner, Text } from "@chakra-ui/react";
import { editEntry } from "../api/journals";
import { saveJournal } from "../redux/journalSlice";
import { JournalEntry, WeeklyJournalResponse } from "../types/WeeklyJournalResponse";
import { RootState, AppDispatch } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";

const AutoSaveTextarea = ({ journal }: { journal: WeeklyJournalResponse[] }) => {

  const dispatch = useDispatch<AppDispatch>();

  const userId = "67070e23eb54589c5995d33e"; // Hardcoded user ID
  // const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [weekJournal, setweekJournal] = useState<WeeklyJournalResponse | null>(null);

  const {selectedDate, monday} = useSelector((state: RootState) => state.app);
  const { isSaving } = useSelector((state: RootState) => state.journal);

  useEffect(() => {
    const selectEntry = async () => {
      const weeklyJournal = journal.find((j) => j.weekStartDate === monday);
      if (weeklyJournal) {
        setweekJournal(weeklyJournal); 
        const selectedEntry = weeklyJournal.journalEntries.find((e) => e.date === selectedDate);
        if (selectedEntry){
          setEntry(selectedEntry);
        } 
      }
    };
    selectEntry();
  }, [selectedDate]);

  useEffect(() => {
    if (!entry || !weekJournal) return;

    const saveData = async () => {
      try {
        if (entry) {
          await dispatch(
            saveJournal({
              userId,
              journalId: weekJournal.id,
              updatedEntry: entry,
            })
          );
          console.log("Autosaved:", entry);
        } else {
          console.error("Missing journalId or entryId");
        }
      } catch (err) {
        console.error("Error saving data:", err);
        setError("Failed to save changes.");
      } finally {
      }
    };

    const debounceTimeout = setTimeout(() => {
      saveData();
    }, 1000);
    
    return () => clearTimeout(debounceTimeout); // Cleanup debounce timeout
    
  }, [entry, weekJournal]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!entry) return; // Ensure `entry` is not null
    setEntry({ ...entry, content: e.target.value });
  };
  

  return (
    <Box w="100%" maxW="1000px" padding="20px" mt={10}>
      <Textarea
        value={entry?.content}
        onChange={handleChange}
        placeholder="Start typing..."
        size="md"
        resize="vertical"
        focusBorderColor="blue.500"
      />
      <Box mt={2} display="flex" alignItems="center">
        {isSaving ? (
          <>
            <Spinner size="sm" color="blue.500" mr={2} />
            <Text fontSize="sm" color="gray.500">
              Saving...
            </Text>
          </>
        ) : (
          <Text fontSize="sm" color="gray.500">
            All changes saved.
          </Text>
        )}
      </Box>
      {error && (
        <Text fontSize="sm" color="red.500" mt={2}>
          {error}
        </Text>
      )}
    </Box>
  );
};

export default AutoSaveTextarea;
