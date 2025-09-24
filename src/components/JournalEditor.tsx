import React from "react";
import { Box, Card, CardBody, Input, Text, Textarea, Spinner, Button } from "@chakra-ui/react";
import { formatDateTime } from "../utils/date";

interface JournalEditorProps {
  title: string;
  content: string;
  dateTime?: string;
  isSaving: boolean;
  saveError: string | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onBackMobile?: () => void;
}

const JournalEditor = ({ title, content, dateTime, isSaving, saveError, onTitleChange, onContentChange, onBackMobile }: JournalEditorProps) => {
  return (
    <Box flex={1} height="100vh" overflowY="hidden" pt={4}>
      <Card>
        <CardBody>
          <Box mb={2} display={{ base: onBackMobile ? "block" : "none", md: "none" }}>
            {onBackMobile && (
              <Button size="sm" onClick={onBackMobile}>Back to list</Button>
            )}
          </Box>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
            size="lg"
            fontWeight="bold"
            mb={2}
            variant="unstyled"
          />
          <Text fontSize="sm" color="gray.500" mb={4} textAlign="left">
            {formatDateTime(dateTime)}
          </Text>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Start typing..."
            size="md"
            resize="vertical"
            focusBorderColor="blue.500"
            minH="200px"
          />
          <Box mt={2} display="flex" alignItems="center">
            {isSaving ? (
              <>
                <Spinner size="sm" color="blue.500" mr={2} />
                <Text fontSize="sm" color="gray.500">Saving...</Text>
              </>
            ) : (
              <Text fontSize="sm" color="gray.500">All changes saved.</Text>
            )}
          </Box>
          {saveError && (
            <Text fontSize="sm" color="red.500" mt={2}>{saveError}</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default JournalEditor;
