import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { HStack } from "@chakra-ui/react";
import { JournalResponse } from "../types/JournalResponse";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { editEntry, deleteEntry, updateActual } from "../api/journals";
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
  
  // Refs for uncontrolled input values to avoid re-renders on every keystroke
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const selectedEntryId = selectedEntry?.id ?? null;
  const selectedEntryContent = selectedEntry?.content ?? "";
  const selectedEntryTitle = selectedEntry?.title ?? "";
  const selectedEntryDate = ((selectedEntry as any)?.dateTime || (selectedEntry as any)?.date) as string | undefined;

  // Debounced autosave function
  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = setTimeout(async () => {
      if (!selectedEntryId || !jwtToken) return;
      
      const currentContent = contentRef.current?.value ?? "";
      const currentTitle = titleRef.current?.value ?? "";
      
      setIsSaving(true);
      setSaveError(null);
      
      try {
        const resp = await editEntry(userId, jwtToken, selectedEntryId, currentContent, currentTitle);
        setIsSaving(false);
        setContent(currentContent);
        setTitle(currentTitle);
        setLocalEntries((prev) =>
          prev.map((it: any) =>
            it.id === selectedEntryId
              ? { ...it, title: resp.title ?? currentTitle, content: resp.content ?? currentContent }
              : it
          )
        );
      } catch (err) {
        setIsSaving(false);
        setSaveError("Failed to save. Changes will retry on next edit.");
      }
    }, 600);
  }, [selectedEntryId, jwtToken, userId]);

  useEffect(() => {
    setContent(selectedEntryContent);
    setTitle(selectedEntryTitle);
    if (contentRef.current) contentRef.current.value = selectedEntryContent;
    if (titleRef.current) titleRef.current.value = selectedEntryTitle;
    setSaveError(null);
    setHasUserEdited(false);
    setHasUserEditedTitle(false);
  }, [selectedEntryId, selectedEntryContent, selectedEntryTitle]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, []);

  const handleDeleteEntry = async (entryId: string) => {
    if (!jwtToken) return;
    try {
      await deleteEntry(userId, jwtToken, entryId);
      setLocalEntries((prev) => prev.filter((e: any) => e.id !== entryId));
      setSelectedId((prevId) => {
        if (prevId !== entryId) return prevId;
        const remaining = localEntries.filter((e: any) => e.id !== entryId);
        return remaining.length ? remaining[0].id : null;
      });
    } catch (err) {
      setSaveError("Failed to delete entry.");
    }
  };

  const handleUpdateGoal = async (metricId: string, amount: number) => {
    if (!jwtToken || !selectedEntryId) return;
    
    // Find the current metric to calculate the new absolute value
    const currentEntry = localEntries.find((e: any) => e.id === selectedEntryId);
    const currentMetric = currentEntry?.goal?.metrics?.find((m: any) => m.id === metricId);
    
    if (!currentMetric) return;
    
    const newAbsoluteValue = Math.max(0, currentMetric.actual + amount);
    
    try {
      const updatedMetric = await updateActual(userId, jwtToken, selectedEntryId, metricId, newAbsoluteValue);
      setLocalEntries((prev) =>
        prev.map((entry: any) => {
          if (entry.id === selectedEntryId && entry.goal?.metrics) {
            return {
              ...entry,
              goal: {
                ...entry.goal,
                metrics: entry.goal.metrics.map((metric: any) =>
                  metric.id === metricId
                    ? { ...metric, actual: updatedMetric.actual }
                    : metric
                ),
              },
            };
          }
          return entry;
        })
      );
    } catch (err) {
      console.error("Error updating goal:", err);
      setSaveError("Failed to update goal. Please check your connection and try again.");
    }
  };

  return (
    <HStack align="start" justify="flex-start" spacing={6} width="100%" height="100vh">
      <JournalList
        entries={sortedEntries}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        onAddEntry={onAddEntry}
        onDeleteEntry={handleDeleteEntry}
      />

      {selectedEntry && (
        <JournalEditor
          title={title}
          content={content}
          dateTime={selectedEntryDate}
          isSaving={isSaving}
          saveError={saveError}
          goals={selectedEntry.goal?.metrics}
          onUpdateGoal={handleUpdateGoal}
          onTitleChange={(v) => {
            setHasUserEditedTitle(true);
            scheduleAutosave();
          }}
          onContentChange={(v) => {
            setHasUserEdited(true);
            scheduleAutosave();
          }}
          titleRef={titleRef}
          contentRef={contentRef}
        />
      )}
    </HStack>
  );
};

export default Journal;
