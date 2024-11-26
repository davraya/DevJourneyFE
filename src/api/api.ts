import axios from 'axios';
import {WeeklyGoalsResponse} from '../types/WeeklyGoalsResponse';
import {MetricUpdateResponse} from '../types/MetricUpdateResponse';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Increment the actual value of a specific goal for a user.
 * 
 * @param userId - The unique identifier of the user whose goal is being updated.
 * @param goalId - The unique identifier of the goal to be updated.
 * @param goalType - The type of the goal (e.g., "informationalInterviews", "jobApplications").
 * @param amount - The amount by which the actual value should be changed.
 * @returns A promise that resolves to the API response containing the updated goal details.
 * @throws Will throw an error if the request fails.
 */
export const updateActual = async (
  userId: string, 
  goalId: string, 
  goalType: string, 
  amount: number
): Promise<MetricUpdateResponse> => {

  const url = `${API_BASE_URL}/api/users/${userId}/weekly-goals/${goalId}/updateActual`;

  try {
    const response = await axios.patch<MetricUpdateResponse>(url, null, {
      params: {
        goalType,
        amount,
      },
    });

    // Since axios automatically throws errors for non-2xx status codes,
    // we don't need to manually check response.ok.
    return response.data; // Safely return the response data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error incrementing actual value:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error incrementing actual value:', error);
    }
    throw error; // Re-throw for the caller to handle
  }
};


/**
 * Fetch the most recent weekly goals for a user.
 * 
 * @param userId - The unique identifier of the user whose weekly goals are being fetched.
 * @returns A promise that resolves to the user's most recent weekly goals.
 * @throws Will throw an error if the request fails.
 */
export const fetchUserWeeklyGoals = async (userId: string): Promise<WeeklyGoalsResponse> => {

  const url = `${API_BASE_URL}/api/users/${userId}/weekly-goals/most-recent`;

  try {
    const response = await axios.get<WeeklyGoalsResponse>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching user’s most recent Weekly Goals:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error fetching user’s most recent Weekly Goals:', error);
    }
    throw error;
  }
};

