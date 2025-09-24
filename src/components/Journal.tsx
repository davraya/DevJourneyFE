import React, { useEffect, useMemo, useState } from "react";
import { HStack } from "@chakra-ui/react";
import { JournalResponse } from "../types/JournalResponse";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { editEntry } from "../api/journals";
import JournalList from "./JournalList";
import JournalEditor from "./JournalEditor";
import { sortEntriesByDateDesc } from "../utils/date";

interface JournalProps {
  journal: JournalResponse | null;
  selectedEntryId?: string | null;
  onAddEntry?: () => void;
}

const Journal = ({ journal, selectedEntryId: selectedEntryIdProp, onAddEntry }: JournalProps) => {
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId = useSelector((state: RootState) => state.user.userId);

  // Raw entries from props
  const entries = useMemo(() => journal?.journalEntries ?? [], [journal]);

  // Local copy for immediate UI reflection
  const [localEntries, setLocalEntries] = useState(entries);
  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Keep memo only for sort to avoid repeated O(n log n)
  const sortedEntries = useMemo(() => sortEntriesByDateDesc(localEntries), [localEntries]);

  const [selectedId, setSelectedId] = useState<string | null>(
    selectedEntryIdProp ?? (sortedEntries.length > 0 ? sortedEntries[0].id : null)
  );
  useEffect(() => {
    if (selectedEntryIdProp) setSelectedId(selectedEntryIdProp);
  }, [selectedEntryIdProp]);

  // Compute selected entry directly (cheap enough)
  const selectedEntry = localEntries.find((e) => e.id === selectedId) || null;

  const [content, setContent] = useState<string>(selectedEntry?.content ?? "");
  const [title, setTitle] = useState<string>(selectedEntry?.title ?? "");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState<boolean>(false);
  const [hasUserEditedTitle, setHasUserEditedTitle] = useState<boolean>(false);

  const selectedEntryId = selectedEntry?.id ?? null;
  const selectedEntryContent = selectedEntry?.content ?? "";
  const selectedEntryTitle = selectedEntry?.title ?? "";
  const selectedEntryDate = ((selectedEntry as any)?.dateTime || (selectedEntry as any)?.date) as string | undefined;

  useEffect(() => {
    setContent(selectedEntryContent);
    setTitle(selectedEntryTitle);
    setSaveError(null);
    setHasUserEdited(false);
    setHasUserEditedTitle(false);
  }, [selectedEntryId, selectedEntryContent, selectedEntryTitle]);

  useEffect(() => {
    if (!selectedEntryId || !jwtToken) return;
    if (!hasUserEdited && !hasUserEditedTitle) return;

    setIsSaving(true);
    setSaveError(null);

    const timer = setTimeout(async () => {
      try {
        const resp = await editEntry(userId, jwtToken, selectedEntryId, content, title);
        setIsSaving(false);
        setHasUserEdited(false);
        setHasUserEditedTitle(false);
        setLocalEntries((prev) =>
          prev.map((it: any) =>
            it.id === selectedEntryId
              ? { ...it, title: resp.title ?? title, content: resp.content ?? content }
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
    <HStack align="start" justify="flex-start" spacing={6} width="100%" height="100vh">
      <JournalList
        entries={sortedEntries}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        onAddEntry={onAddEntry}
      />

      {selectedEntry && (
        <JournalEditor
          title={title}
          content={content}
          dateTime={selectedEntryDate}
          isSaving={isSaving}
          saveError={saveError}
          onTitleChange={(v) => {
            setTitle(v);
            setHasUserEditedTitle(true);
          }}
          onContentChange={(v) => {
            setContent(v);
            setHasUserEdited(true);
          }}
        />
      )}
    </HStack>
  );
};

export default Journal;
