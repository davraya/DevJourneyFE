import React, { useState, useEffect } from "react";
import { Box, Textarea, Spinner, Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { EntryResponse, JournalResponse } from "../types/JournalResponse";
import { fetchEntry, addEntry, editEntry } from "../api/journals";


interface JournalProps {
  journal: JournalResponse | null;
}

const AutoSaveTextArea = ({ journal } : JournalProps) => {
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId = useSelector((state: RootState) => state.user.userId);
  const selectedDate = useSelector((state: RootState) => state.app.selectedDate);
  const [content, setContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);


  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    // editEntry(userId, jwtToken, entryId, event.target.value);
    setIsSaving(true);
    setError(null);
  };

  // useEffect(() => {
  //   const getEntry = async () => {
  //     if (!jwtToken || !userId) return;

  //     try {
  //       const date = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  //       const entry: EntryResponse = await fetchEntry(userId, jwtToken, date);
  //       setContent(entry.content || "");
  //     } catch (err) {
  //       console.error("Error fetching entry:", err);
  //       setError("Failed to load entry. Please try again later.");
  //     }
  //   }

  //   const addNewEntry = async () => {
  //     if (!jwtToken || !userId || !content) return;

  //     try {
  //       const entry = await addEntry(userId, jwtToken, content, selectedDate);
  //       setEntryId(entry.id);
  //       setIsSaving(false);
  //     } catch (err) {
  //       console.error("Error saving entry:", err);
  //       setError("Failed to save entry. Please try again later.");
  //       setIsSaving(false);
  //     }
  //   }

  //   const entryRes = getEntry();
  //   console.log("Entry response:", entryRes);
  //   if (!entryRes){
  //     addNewEntry();
  //   }

  // }, []);

   useEffect(() => {
      const runAsync = async () => {
        if (!jwtToken) return;
        
        try{
          const entry = await fetchEntry(userId, jwtToken, selectedDate);
           setContent(entry.content);
        } catch (err) {
          const newEntry = await addEntry(userId, jwtToken, content, selectedDate);
          setContent(newEntry.content);
        }
  
        setIsSaving(false);
      };
  
      runAsync();
    }, []);
  
 






  return (
    <Box w="100%" maxW="1000px" padding="20px" mt={10}>
      <Textarea
        value={content}
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

export default AutoSaveTextArea;
