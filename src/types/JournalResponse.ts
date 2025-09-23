export interface JournalResponse {
    id: string;
    journalEntries: EntryResponse[];
    weekStartDate: string;
}

export interface EntryResponse {
    id: string;
    content: string;
    dateTime: string;
    title: string
}

