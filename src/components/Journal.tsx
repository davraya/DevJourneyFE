import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { JournalResponse } from "../types/JournalResponse";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { editEntry, deleteEntry, updateActual } from "../api/journals";
import { setJournal as setJournalStore } from "../redux/journalSlice";
import JournalList from "./JournalList";
import JournalEditor from "./JournalEditor";
import { sortEntriesByDateDesc } from "../utils/date";
import "./Journal.css";

interface JournalProps {
  journal: JournalResponse | null;
  selectedEntryId?: string | null;
  onAddEntry?: () => void;
}

const Journal = ({ journal, selectedEntryId: selectedEntryIdProp, onAddEntry }:   JournalProps) => {
  const dispatch = useDispatch();
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId = useSelector((state: RootState) => state.user.userId);

  const entries = useMemo(() => journal?.journalEntries ?? [], [journal]);

  // Use Redux store as the single source of truth
  const [localEntries, setLocalEntries] = useState(entries);
  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  const sortedEntries = useMemo(() => sortEntriesByDateDesc(localEntries), [localEntries]);

  const [selectedId, setSelectedId] = useState<string | null>(
    selectedEntryIdProp ?? (sortedEntries.length > 0 ? sortedEntries[0].id : null)
  );
  useEffect(() => {
    if (selectedEntryIdProp) setSelectedId(selectedEntryIdProp);
  }, [selectedEntryIdProp]);

  const selectedEntry = localEntries.find((e) => e.id === selectedId) || null;

  // Track pending changes to prevent overwriting user edits
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: {title?: string, content?: string}}>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{title: string, status: 'success' | 'error'} | null>(null);
  const [lastSelectedEntryId, setLastSelectedEntryId] = useState<string | null>(null);
  
  // Mobile view state
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list'); // 'list' or 'editor'
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const showToast = (title: string, status: 'success' | 'error') => {
    setToastMessage({ title, status });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedEntryId = selectedEntry?.id ?? null;
  
  // Get current values, preferring pending changes over stored values
  const getCurrentContent = useCallback(() => {
    if (selectedEntryId && pendingChanges[selectedEntryId]?.content !== undefined) {
      return pendingChanges[selectedEntryId].content!;
    }
    return selectedEntry?.content ?? "";
  }, [selectedEntryId, pendingChanges, selectedEntry]);

  const getCurrentTitle = useCallback(() => {
    if (selectedEntryId && pendingChanges[selectedEntryId]?.title !== undefined) {
      return pendingChanges[selectedEntryId].title!;
    }
    return selectedEntry?.title ?? "";
  }, [selectedEntryId, pendingChanges, selectedEntry]);

  const currentContent = getCurrentContent();
  const currentTitle = getCurrentTitle();
  const selectedEntryDate = ((selectedEntry as any)?.dateTime || (selectedEntry as any)?.date) as string | undefined;

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
        
        // Clear pending changes for this entry since they're now saved
        setPendingChanges(prev => {
          const updated = { ...prev };
          delete updated[selectedEntryId];
          return updated;
        });
        
        // Update local entries with the saved data
        const updatedEntries = localEntries.map((it: any) =>
          it.id === selectedEntryId
            ? { ...it, title: resp.title ?? currentTitle, content: resp.content ?? currentContent }
            : it
        );
        setLocalEntries(updatedEntries);
        
        // Update Redux store with the updated journal data
        if (journal) {
          const updatedJournal = {
            ...journal,
            journalEntries: updatedEntries
          };
          dispatch(setJournalStore(updatedJournal));
        }
        
      } catch (err) {
        setIsSaving(false);
        setSaveError("Failed to save. Changes will retry on next edit.");
        showToast("Failed to save entry", "error");
      }
    }, 800);
  }, [selectedEntryId, jwtToken, userId, dispatch, journal, localEntries]);

  // Update form values when switching entries, but preserve pending changes
  useEffect(() => {
    // Only update form values when actually switching to a different entry
    if (selectedEntryId === lastSelectedEntryId) return;
    
    const displayContent = getCurrentContent();
    const displayTitle = getCurrentTitle();
    
    if (contentRef.current) contentRef.current.value = displayContent;
    if (titleRef.current) titleRef.current.value = displayTitle;
    setSaveError(null);
    setLastSelectedEntryId(selectedEntryId);
  }, [selectedEntryId, lastSelectedEntryId, getCurrentContent, getCurrentTitle]);

  // Clear any pending autosave when switching entries
  useEffect(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
  }, [selectedEntryId]);

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
      const updatedEntries = localEntries.filter((e: any) => e.id !== entryId);
      setLocalEntries(updatedEntries);
      
      // Update Redux store with the updated journal data
      if (journal) {
        const updatedJournal = {
          ...journal,
          journalEntries: updatedEntries
        };
        dispatch(setJournalStore(updatedJournal));
      }
      
      setSelectedId((prevId) => {
        if (prevId !== entryId) return prevId;
        return updatedEntries.length ? updatedEntries[0].id : null;
      });
      
      showToast("Journal entry deleted", "success");
    } catch (err) {
      setSaveError("Failed to delete entry.");
      showToast("Failed to delete entry", "error");
    }
  };

  const handleUpdateGoal = async (metricId: string, amount: number) => {
    if (!jwtToken || !selectedEntryId) return;
    
    const currentEntry = localEntries.find((e: any) => e.id === selectedEntryId);
    const currentMetric = currentEntry?.goal?.metrics?.find((m: any) => m.id === metricId);
    
    if (!currentMetric) return;
    
    const newAbsoluteValue = Math.max(0, currentMetric.actual + amount);
    
    try {
      const updatedMetric = await updateActual(userId, jwtToken, selectedEntryId, metricId, newAbsoluteValue);
      const updatedEntries = localEntries.map((entry: any) => {
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
      });
      setLocalEntries(updatedEntries);
      
      // Update Redux store with the updated journal data
      if (journal) {
        const updatedJournal = {
          ...journal,
          journalEntries: updatedEntries
        };
        dispatch(setJournalStore(updatedJournal));
      }
      
      showToast("Goal updated", "success");
    } catch (err) {
      console.error("Error updating goal:", err);
      setSaveError("Failed to update goal. Please check your connection and try again.");
      showToast("Failed to update goal", "error");
    }
  };

  return (
    <div className="journal-container">
      {/* Mobile View */}
      {isMobileView ? (
        <>
          {mobileView === 'list' ? (
            <JournalList
              entries={sortedEntries}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setMobileView('editor');
              }}
              onAddEntry={onAddEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          ) : selectedEntry && (
            <JournalEditor
              title={currentTitle}
              content={currentContent}
              dateTime={selectedEntryDate}
              isSaving={isSaving}
              saveError={saveError}
              goals={selectedEntry.goal?.metrics}
              onUpdateGoal={handleUpdateGoal}
              hasUnsavedChanges={selectedEntryId ? pendingChanges[selectedEntryId] !== undefined : false}
              onBackMobile={() => setMobileView('list')}
              onTitleChange={(v) => {
                if (selectedEntryId) {
                  setPendingChanges(prev => ({
                    ...prev,
                    [selectedEntryId]: {
                      ...prev[selectedEntryId],
                      title: v
                    }
                  }));
                }
                scheduleAutosave();
              }}
              onContentChange={(v) => {
                if (selectedEntryId) {
                  setPendingChanges(prev => ({
                    ...prev,
                    [selectedEntryId]: {
                      ...prev[selectedEntryId],
                      content: v
                    }
                  }));
                }
                scheduleAutosave();
              }}
              titleRef={titleRef}
              contentRef={contentRef}
            />
          )}
        </>
      ) : (
        /* Desktop View */
        <>
          <JournalList
            entries={sortedEntries}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onAddEntry={onAddEntry}
            onDeleteEntry={handleDeleteEntry}
          />

          {selectedEntry && (
            <JournalEditor
              title={currentTitle}
              content={currentContent}
              dateTime={selectedEntryDate}
              isSaving={isSaving}
              saveError={saveError}
              goals={selectedEntry.goal?.metrics}
              onUpdateGoal={handleUpdateGoal}
              hasUnsavedChanges={selectedEntryId ? pendingChanges[selectedEntryId] !== undefined : false}
              onTitleChange={(v) => {
                if (selectedEntryId) {
                  setPendingChanges(prev => ({
                    ...prev,
                    [selectedEntryId]: {
                      ...prev[selectedEntryId],
                      title: v
                    }
                  }));
                }
                scheduleAutosave();
              }}
              onContentChange={(v) => {
                if (selectedEntryId) {
                  setPendingChanges(prev => ({
                    ...prev,
                    [selectedEntryId]: {
                      ...prev[selectedEntryId],
                      content: v
                    }
                  }));
                }
                scheduleAutosave();
              }}
              titleRef={titleRef}
              contentRef={contentRef}
            />
          )}
        </>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="toast-container">
          <div className={`toast ${toastMessage.status}`}>
            {toastMessage.title}
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
