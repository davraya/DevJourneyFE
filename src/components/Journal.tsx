import React, { useState, useEffect } from "react";
import { Box, Textarea, Spinner, Text } from "@chakra-ui/react";

const AutoSaveTextarea = () => {
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    const saveData = async () => {
      setIsSaving(true);
      // Simulate saving data (e.g., make an API call here)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Autosaved:", value || "(empty)");
      setIsSaving(false);
    };

    const timeoutId = setTimeout(() => {
      saveData(); // Trigger save regardless of content
    }, 1000); // Autosave after 1 second of inactivity

    return () => clearTimeout(timeoutId); // Cleanup previous timeout
  }, [value]);

  return (
    <Box w="100%" maxW="1000px" padding="20px" mt={10}>
  <Textarea
    value={value}
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
</Box>

  );
};

export default AutoSaveTextarea;
