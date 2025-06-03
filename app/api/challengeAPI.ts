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

export const getChallengesByCreator = async (creatorId: string): Promise<{ challenges: Challenge[] }> => {
  const token = await getToken()
  const resp = await fetch(
    `${BASE_URL}/challenges/creator/${encodeURIComponent(creatorId)}`,
    {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
  if (!resp.ok) {
    throw new Error('Failed to fetch your challenges')
  }
  return resp.json()
}

export interface Challenge {
  id: number;
  title: string;
  description?: string | null;
  goal?: number | null;
  unit?: string | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
  start_date?: string | null;   
  end_date?: string | null;     
  created_at: string;           
  creator: string;              
  goal_list: string[];          
}

export const getCompletedChallenges = async () => {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/challenges/completed`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch completed challenges");
  }

  return await response.json();
};

export const updateProgress = async (challengeId: number) => {
  const token = await getToken();
  
  const response = await fetch(`${BASE_URL}/progress/${challengeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to update progress');
  }

  return await response.json(); // { current_day, completed }
};
