import React, { useEffect, useState } from "react";
import { EntryResponse } from "../types/JournalResponse";
import { formatDateTime } from "../utils/date";
import "./JournalList.css";

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
    <div className="journal-list-container">
      <div className="journal-list-header">
        <button 
          className="add-entry-button"
          onClick={onAddEntry}
        >
          + Add Entry
        </button>
      </div>
      
      <div className="journal-list-content">
        <div className="journal-list-spacer" />
        {entries.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-content">
              <p className="empty-state-text">No journal entries found. Add your first entry!</p>
            </div>
          </div>
        ) : (
          entries.map((entry, index) => {
            const isSelected = entry.id === selectedId;
            return (
              <React.Fragment key={entry.id}>
                {index > 0 && <div className="journal-list-spacer" />}
                <div
                  className={`journal-entry-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelect(entry.id)}
                >
                  <div className="journal-entry-content">
                    <div className="journal-entry-text">
                      <div className={`journal-entry-title ${isSelected ? 'selected' : ''}`}>
                        {entry.title || "Untitled"}
                      </div>
                      <div className="journal-entry-date">
                        {formatDateTime((entry as any).dateTime || (entry as any).date)}
                      </div>
                    </div>
                    <button
                      className="journal-entry-menu-button"
                      aria-label="More options"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setMenuPosition({ top: rect.top + window.scrollY, left: rect.right + 8 + window.scrollX });
                        setOpenMenuId((prev) => (prev === entry.id ? null : entry.id));
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </div>

                {openMenuId === entry.id && menuPosition && (
                  <div
                    className="journal-entry-menu"
                    style={{
                      position: 'fixed',
                      top: `${menuPosition!.top}px`,
                      left: `${menuPosition!.left}px`,
                      zIndex: 2000
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="journal-menu-content">
                      <button
                        className="journal-menu-item"
                        onClick={() => {
                          onSelect(entry.id);
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        }}
                      >
                        Open
                      </button>
                      <button
                        className="journal-menu-item delete"
                        onClick={() => {
                          onDeleteEntry && onDeleteEntry(entry.id);
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JournalList;
