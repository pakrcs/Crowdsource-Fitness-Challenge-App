import { getToken } from '../firebase/firebaseAuth';
import { BASE_URL } from '../config';

export const getAccountInfo = async (): Promise<any> => {
  try {
    // Fetch current user id token from Firebase auth
    const token = await getToken(); 

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BASE_URL}/account`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || 'Failed to fetch account info');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createAccount = async (username: string): Promise<any> => {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  const resp = await fetch(`${BASE_URL}/account`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
  const body = await resp.json();
  if (!resp.ok) throw new Error(body.message || 'Failed to create account');
  return body;
};