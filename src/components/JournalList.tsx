import React, { useEffect, useState } from "react";
import { Box, VStack, Button, Card, CardBody, Text, IconButton } from "@chakra-ui/react";
import { EntryResponse } from "../types/JournalResponse";
import { formatDateTime } from "../utils/date";

interface JournalListProps {
  entries: EntryResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddEntry?: () => void;
  onDeleteEntry?: (id: string) => void;
}

const JournalList = ({ entries, selectedId, onSelect, onAddEntry, onDeleteEntry }: JournalListProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function handleGlobalClick() {
      setOpenMenuId(null);
      setMenuPosition(null);
    }
    if (openMenuId) {
      document.addEventListener('click', handleGlobalClick);
    }
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [openMenuId]);
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
      pb={24}
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
          <React.Fragment key={entry.id}>
            <Card
              position="relative"
              zIndex={1}
              onClick={() => onSelect(entry.id)}
              cursor="pointer"
              borderWidth={isSelected ? "2px" : "1px"}
              borderColor={isSelected ? "blue.400" : "gray.200"}
            >
              <CardBody py={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Text textAlign="left" fontWeight={isSelected ? "bold" : "semibold"} noOfLines={2}>
                    {entry.title || "Untitled"}
                  </Text>
                  <IconButton
                    aria-label="More options"
                    size="xs"
                    color="gray.500"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setMenuPosition({ top: rect.top + window.scrollY, left: rect.right + 8 + window.scrollX });
                      setOpenMenuId((prev) => (prev === entry.id ? null : entry.id));
                    }}
                    _hover={{ bg: "gray.100", color: "gray.700" }}
                    _active={{ bg: "gray.200" }}
                    icon={<Box as="span" fontSize="md" lineHeight="1">⋮</Box>}
                  />
                </Box>
                <Text textAlign="left" fontSize="sm" color="gray.500">
                  {formatDateTime((entry as any).dateTime || (entry as any).date)}
                </Text>
              </CardBody>
            </Card>

            {openMenuId === entry.id && menuPosition && (
              <Box
                position="fixed"
                top={`${menuPosition!.top}px`}
                left={`${menuPosition!.left}px`}
                zIndex={2000}
                bg="transparent"
                borderWidth="0"
                borderColor="transparent"
                boxShadow="none"
                rounded="md"
                onClick={(e) => e.stopPropagation()}
              >
                <Box display="flex" flexDir="column" gap={1} p={1} bg="transparent">
                  <Box
                    as="button"
                    display="block"
                    w="full"
                    textAlign="left"
                    px={3}
                    py={2}
                    color="black"
                    bg="white"
                    rounded="md"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => {
                      onSelect(entry.id);
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    }}
                  >
                    Open
                  </Box>
                  <Box
                    as="button"
                    display="block"
                    w="full"
                    textAlign="left"
                    px={3}
                    py={2}
                    color="red.600"
                    bg="white"
                    rounded="md"
                    _hover={{ bg: "red.50", color: "red.700" }}
                    onClick={() => {
                      onDeleteEntry && onDeleteEntry(entry.id);
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    }}
                  >
                    Delete
                  </Box>
                </Box>
              </Box>
            )}
          </React.Fragment>
        );
      })}
    </VStack>
  );
};

export default JournalList;
