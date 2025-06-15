export interface WeeklyJournalResponse {
    id: string;
    journalEntries: JournalEntry[];
    weekStartDate: string;
}

export interface JournalEntry {
    id: string;
    content: string;
    date: string;
}

