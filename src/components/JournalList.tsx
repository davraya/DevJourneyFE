import React from "react";
import { Box, VStack, Button, Card, CardBody, Text } from "@chakra-ui/react";
import { EntryResponse } from "../types/JournalResponse";
import { formatDateTime } from "../utils/date";

interface JournalListProps {
  entries: EntryResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddEntry?: () => void;
}

const JournalList = ({ entries, selectedId, onSelect, onAddEntry }: JournalListProps) => {
  return (
    <VStack
      align="stretch"
      spacing={2}
      width={{ base: "36%", md: "28%", lg: "22%" }}
      height="100vh"
      overflowY="auto"
      pr={2}
      pb={4}
      ml={{ base: 4, md: 6 }}
    >
      <Box
        position="sticky"
        top={1}
        zIndex={2}
        pb={2}
        pt={1}
        pr={2}
        bg="chakra-body-bg"
        boxShadow="sm"
      >
        <Button onClick={onAddEntry} colorScheme="blue" width="100%" size="sm">
          + Add entry
        </Button>
      </Box>
      <Box h={2} />
      {entries.map((entry) => {
        const isSelected = entry.id === selectedId;
        return (
          <Card
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            cursor="pointer"
            borderWidth={isSelected ? "2px" : "1px"}
            borderColor={isSelected ? "blue.400" : "gray.200"}
          >
            <CardBody py={3}>
              <Text textAlign="left" fontWeight={isSelected ? "bold" : "semibold"} noOfLines={2}>
                {entry.title || "Untitled"}
              </Text>
              <Text textAlign="left" fontSize="sm" color="gray.500">
                {formatDateTime((entry as any).dateTime || (entry as any).date)}
              </Text>
            </CardBody>
          </Card>
        );
      })}
    </VStack>
  );
};

export default JournalList;
