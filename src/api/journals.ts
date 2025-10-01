import axios from 'axios';
import { JournalResponse } from '../types/JournalResponse';
import { EntryResponse } from '../types/JournalResponse';

const API_BASE_URL =
  process.env.REACT_APP_API_URL


  export const addEntry = async (
    userId: string,
    token: string,
    content: string,
    dateTime: string,
    title: string
  ): Promise<EntryResponse> => {
    const url = `${API_BASE_URL}/api/journal/${userId}/add-entry`;
  
    try {
      const response = await axios.patch<EntryResponse>(url, null, {
        params: {
          content,
          dateTime,
          title
        },
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
  


export const fetchEntry = async (userId: string, token: string, date: Date): Promise<EntryResponse> => {

  const url = `${API_BASE_URL}/api/journal/${userId}/entry`;

  try {
    const response = await axios.get<EntryResponse>(url,{
      params: {
        date,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching entry:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error fetching entry:', error);
    }
    throw error;
  }
};


export const editEntry = async (
    userId: string,
    token: string,
    entryId: string,
    content: string, 
    title: string
  ): Promise<EntryResponse> => {
    const url = `${API_BASE_URL}/api/journal/${userId}/${entryId}/edit-entry`;
  
    try {
      const response = await axios.patch<EntryResponse>(url, null, {
        params: {
          content,
          title,
        },
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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

export const deleteEntry = async (
  userId: string,
  token: string,
  entryId: string
): Promise<{ success: boolean }> => {
  const url = `${API_BASE_URL}/api/journal/${userId}/${entryId}/delete-entry`;

  try {
    const response = await axios.delete<{ success: boolean }>(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error deleting journal entry:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error deleting journal entry:', error);
    }
    throw error;
  }
};

export const updateActual = async (
  userId: string,
  token: string,
  entryId: string,
  metricId: string,
  amount: number
): Promise<{ id: string; actual: number; goal: number; name: string }> => {
  const url = `${API_BASE_URL}/api/goal/${userId}/${entryId}/updateActual`;

  try {
    const response = await axios.patch<{ id: string; actual: number; goal: number; name: string }>(url, null, {
      params: {
        metricId,
        value: amount,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error updating actual value:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error updating actual value:', error);
    }
    throw error;
  }
};

  export const fetchJournal = async (userId: string, token: string): Promise<JournalResponse> => {

  const url = `${API_BASE_URL}/api/journal/${userId}`;

  try {
    const response = await axios.get<JournalResponse>(url,{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching journal:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error fetching journal:', error);
    }
    throw error;
  }
};

