import axios from 'axios';
import { AuthResponse } from '../types/AuthResponse';
import { UserProfile } from '../types/UserProfile '

const API_BASE_URL =
  process.env.REACT_APP_API_URL

export const handleCredentialResponse = async (response: any): Promise<AuthResponse> => {
  const token = response.credential;
  const url = `${API_BASE_URL}/api/auth/token`;

  try {
    const { data } = await axios.post<AuthResponse>(url, { token }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return data; // Return the response data as AuthResponse
  } catch (error) {                                                                     
    if (axios.isAxiosError(error)) {
      console.error('Axios error during credential response handling:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error during credential response handling:', error);
    }
    throw error; // Re-throw the error for the caller to handle
  }
};

export const handleGetUserInfo = async (response: any): Promise<UserProfile> => {
    const jwtToken = response.credential;

    const url = `${API_BASE_URL}api/users/me`;

    try {
        const { data } = await axios.get<UserProfile>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` // Proper Authorization header
            },
            withCredentials: true, // Add this line if using cookies

        });

        console.log(data); // Log the response data
        return data; // Return the response data as UserProfile
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error during user info fetch:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
        } else {
            console.error('Unexpected error during user info fetch:', error);
        }
        throw error; // Re-throw the error for the caller to handle
    }
};          
