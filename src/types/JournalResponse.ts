export interface JournalResponse {
    id: string;
    journalEntries: EntryResponse[];
    weekStartDate: string;
}

export interface EntryResponse {
    id: string;
    content: string;
    dateTime: string;
    title: string;
    goal?: {
        metrics: GoalMetric[];
    };
}

export interface GoalMetric {
    id: string;
    goal: number;
    actual: number;
    name: string;
}

