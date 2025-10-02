import axios from 'axios';
import { Interview } from '../types/Interview';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const addInterview = async (
  userId: string,
  token: string,
  position: string,
  company: string,
  status: string,
  interviewer: string,
  notes: string
): Promise<Interview> => {
  const url = `${API_BASE_URL}/api/interviews/${userId}/add`;

  try {
    const response = await axios.patch<Interview>(url, null, {
      params: {
        position,
        company,
        status,
        interviewer,
        notes,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error adding interview:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error adding interview:', error);
    }
    throw error;
  }
};

export const editInterview = async (
  userId: string,
  token: string,
  interviewId: string,
  position?: string,
  company?: string,
  status?: string,
  interviewer?: string,
  notes?: string
): Promise<Interview> => {
  const url = `${API_BASE_URL}/api/interviews/${userId}/${interviewId}/edit`;

  try {
    const response = await axios.patch<Interview>(url, null, {
      params: {
        ...(position && { position }),
        ...(company && { company }),
        ...(status && { status }),
        ...(interviewer && { interviewer }),
        ...(notes && { notes }),
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error editing interview:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error editing interview:', error);
    }
    throw error;
  }
};

export const deleteInterview = async (
  userId: string,
  token: string,
  interviewId: string
): Promise<void> => {
  const url = `${API_BASE_URL}/api/interviews/${userId}/${interviewId}/delete`;

  try {
    await axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error deleting interview:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error deleting interview:', error);
    }
    throw error;
  }
};

export const getUserInterviews = async (
  userId: string,
  token: string
): Promise<Interview[]> => {
  const url = `${API_BASE_URL}/api/interviews/${userId}`;

  try {
    const response = await axios.get<Interview[]>(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = Array.isArray(response.data) ? response.data : [];
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching interviews:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error fetching interviews:', error);
    }
    throw error;
  }
};

export const getInterviewById = async (
  userId: string,
  token: string,
  interviewId: string
): Promise<Interview> => {
  const url = `${API_BASE_URL}/api/interviews/${userId}/${interviewId}`;

  try {
    const response = await axios.get<Interview>(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching interview:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error fetching interview:', error);
    }
    throw error;
  }
};
