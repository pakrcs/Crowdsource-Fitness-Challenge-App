import { getToken } from '../firebase/firebaseAuth';
import { BASE_URL } from '../config';

export const createChallenge = async (challengeData: {
  title: string;
  description?: string;
  goal?: number;
  unit?: string;
  difficulty?: string;  // "beginner", "indermediate", "advanced"
  start_date?: string;  // Format: "YYYY-MM-DD"
  end_date?: string;    // Format: "YYYY-MM-DD"
}) => {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/challenges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(challengeData)
  });

  if (!response.ok) {
  throw new Error('Failed to create challenge');
  }

  return await response.json();
};

export const deleteChallenge = async (id: number) => {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/challenges/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete challenge');
  }

  return await response.json();
};

export const getChallenges = async () => {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/challenges`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch challenges");
  }
   // returns { challenges: [...] }
  return await response.json(); 
};

export const getChallengeById = async (id: number) => {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/challenges/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch challenge details");
  }

  return await response.json();
};
