import React, { useEffect, useState, useRef } from "react";
import { EntryResponse } from "../types/JournalResponse";
import { formatDateTime } from "../utils/date";
import DropdownMenu from "./DropdownMenu";
import "./JournalList.css";

interface JournalListProps {
  entries: EntryResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddEntry?: () => void;
  onDeleteEntry?: (id: string) => void;
}

const JournalList = ({ entries, selectedId, onSelect, onAddEntry, onDeleteEntry }: JournalListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [openMenuEntryId, setOpenMenuEntryId] = useState<string | null>(null);

  // Menu event handlers removed - now handled by DropdownMenu component
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
      
      <div className="journal-list-content" ref={scrollContainerRef}>
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
                  className={`journal-entry-card ${isSelected ? 'selected' : ''} ${openMenuEntryId === entry.id ? 'has-open-menu' : ''}`}
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
                    <DropdownMenu
                      items={[
                        {
                          label: 'Open',
                          onClick: () => onSelect(entry.id)
                        },
                        ...(onDeleteEntry ? [{
                          label: 'Delete',
                          onClick: () => onDeleteEntry(entry.id),
                          isDestructive: true
                        }] : [])
                      ]}
                      onMenuToggle={(isOpen) => setOpenMenuEntryId(isOpen ? entry.id : null)}
                      scrollContainerRef={scrollContainerRef}
                    />
                  </div>
                </div>

              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JournalList;
