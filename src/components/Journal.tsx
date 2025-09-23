import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
  Textarea,
  Spinner,
  Button,
  Input,
} from "@chakra-ui/react";
import { JournalResponse } from "../types/JournalResponse";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { editEntry } from "../api/journals";

interface JournalProps {
  journal: JournalResponse | null;
  selectedEntryId?: string | null;
  onAddEntry?: () => void;
}

const Journal = ({
  journal,
  selectedEntryId: selectedEntryIdProp,
  onAddEntry,
}: JournalProps) => {
  // Read auth/user from global state for API calls
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId = useSelector((state: RootState) => state.user.userId);

  // Base journal entries from props
  const entries = useMemo(() => journal?.journalEntries ?? [], [journal]);

  // Local copy of entries so UI can reflect title changes immediately
  const [localEntries, setLocalEntries] = useState(entries);
  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Sort entries newest first
  const sortedEntries = useMemo(
    () =>
      [...localEntries].sort((a, b) => {
        const bdt = (b as any).dateTime || (b as any).date;
        const adt = (a as any).dateTime || (a as any).date;
        return new Date(bdt).getTime() - new Date(adt).getTime();
      }),
    [localEntries]
  );

  // Selected entry id
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedEntryIdProp ?? (sortedEntries.length > 0 ? sortedEntries[0].id : null)
  );

  useEffect(() => {
    if (selectedEntryIdProp) {
      setSelectedId(selectedEntryIdProp);
    }
  }, [selectedEntryIdProp]);

  // Selected entry data
  const selectedEntry = useMemo(
    () => localEntries.find((e) => e.id === selectedId) || null,
    [localEntries, selectedId]
  );

  const [content, setContent] = useState<string>(selectedEntry?.content ?? "");
  const [title, setTitle] = useState<string>(selectedEntry?.title ?? "");

  // UX + autosave flags
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState<boolean>(false);
  const [hasUserEditedTitle, setHasUserEditedTitle] = useState<boolean>(false);

  const selectedEntryId = selectedEntry?.id ?? null;
  const selectedEntryContent = selectedEntry?.content ?? "";
  const selectedEntryTitle = selectedEntry?.title ?? "";

  // Format date/time like: Sep 14, 2025, 3:45 PM
  const formatDateTime = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Reset editor only when switching entries (not when title/content changes locally)
  useEffect(() => {
    setContent(selectedEntryContent);
    setTitle(selectedEntryTitle);
    setSaveError(null);
    setHasUserEdited(false);
    setHasUserEditedTitle(false);
  }, [selectedEntryId, selectedEntryContent, selectedEntryTitle]);

  // Debounced autosave
  useEffect(() => {
    if (!selectedEntryId || !jwtToken) return;
    if (!hasUserEdited && !hasUserEditedTitle) return;

    setIsSaving(true);
    setSaveError(null);

    const timer = setTimeout(async () => {
      try {
        const resp = await editEntry(
          userId,
          jwtToken,
          selectedEntryId,
          content,
          title
        );
        setIsSaving(false);
        setHasUserEdited(false);
        setHasUserEditedTitle(false);

        // Update local list with saved values
        setLocalEntries((prev) =>
          prev.map((it: any) =>
            it.id === selectedEntryId
              ? {
                  ...it,
                  title: resp.title ?? title,
                  content: resp.content ?? content,
                }
              : it
          )
        );
      } catch (err) {
        setIsSaving(false);
        setSaveError("Failed to save. Changes will retry on next edit.");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [content, title, hasUserEdited, hasUserEditedTitle, selectedEntryId, jwtToken, userId]);

  return (
    <HStack
      align="start"
      justify="flex-start"
      spacing={6}
      width="100%"
      height="100vh"
    >
      {/* Left column */}
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
        {sortedEntries.map((entry) => {
          const isSelected = entry.id === selectedId;
          return (
            <Card
              key={entry.id}
              onClick={() => setSelectedId(entry.id)}
              cursor="pointer"
              borderWidth={isSelected ? "2px" : "1px"}
              borderColor={isSelected ? "blue.400" : "gray.200"}
            >
              <CardBody py={3}>
                <Text
                  textAlign="left"
                  fontWeight={isSelected ? "bold" : "semibold"}
                  noOfLines={2}
                >
                  {entry.title || "Untitled"}
                </Text>
                <Text textAlign="left" fontSize="sm" color="gray.500">
                  {formatDateTime(
                    ((entry as any).dateTime || (entry as any).date) as string
                  )}
                </Text>
              </CardBody>
            </Card>
          );
        })}
      </VStack>

      {/* Right column */}
      <Box flex={1} height="100vh" overflowY="hidden" pt={4}>
        {selectedEntry ? (
          <Card>
            <CardBody>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUserEditedTitle(true);
                }}
                placeholder="Title"
                size="lg"
                fontWeight="bold"
                mb={2}
                variant="unstyled"
              />

              <Text fontSize="sm" color="gray.500" mb={4} textAlign="left">
                {formatDateTime(
                  ((selectedEntry as any).dateTime ||
                    (selectedEntry as any).date) as string
                )}
              </Text>

              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setHasUserEdited(true);
                }}
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
                    <Text fontSize="sm" color="gray.500">
                      Saving...
                    </Text>
                  </>
                ) : (
                  <Text fontSize="sm" color="gray.500">All changes saved.</Text>
                )}
              </Box>

              {saveError && (
                <Text fontSize="sm" color="red.500" mt={2}>
                  {saveError}
                </Text>
              )}
            </CardBody>
          </Card>
        ) : (
          <Box color="gray.500">
            Select a journal entry to view its content.
          </Box>
        )}
      </Box>
    </HStack>
  );
};

export default Journal;
