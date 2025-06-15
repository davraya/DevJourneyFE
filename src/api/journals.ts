import axios from 'axios';
import { WeeklyJournalResponse } from '../types/WeeklyJournalResponse';
import { JournalEntry } from '../types/WeeklyJournalResponse';

const API_BASE_URL =
  process.env.REACT_APP_API_URL

/**
 * Fetch the most recent weekly goals for a user.
 * 
 * @param userId - The unique identifier of the user whose weekly goals are being fetched.
 * @returns A promise that resolves to the user's most recent weekly journal.
 * @throws Will throw an error if the request fails.
 */
export const fetchUserJournals = async (userId: string): Promise<WeeklyJournalResponse[]> => {

  const url = `${API_BASE_URL}/api/weekly-journals/${userId}/get-all`;

  try {
    const response = await axios.get<WeeklyJournalResponse[]>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching user’s most recent Weekly Journal:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error fetching user’s most recent Weekly Journal:', error);
    }
    throw error;
  }
};


/**
 * Edit a journal entry's content for a specific user.
 * 
 * @param userId - The unique identifier of the user.
 * @param journalId - The unique identifier of the journal containing the entry.
 * @param entryId - The unique identifier of the entry to be edited.
 * @param content - The updated content for the journal entry.
 * @returns A promise that resolves to the updated journal entry.
 * @throws Will throw an error if the request fails.
 */
export const editEntry = async (
    userId: string,
    journalId: string,
    entryId: string,
    content: string
  ): Promise<JournalEntry> => {
    const url = `${API_BASE_URL}/api/weekly-journals/${userId}/${journalId}/${entryId}/edit-entry`;
  
    try {
      const response = await axios.patch<JournalEntry>(url, null, {
        params: {
          content,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error editing journal entry:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      } else {
        console.error('Unexpected error editing journal entry:', error);
      }
      throw error;
    }
  };
  