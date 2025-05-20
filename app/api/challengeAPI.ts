import { getToken } from '../firebase/firebaseAuth';

export const createChallenge = async (challengeData: {
  title: string;
  description?: string;
  goal?: number;
  unit?: string;
  difficulty?: string;  // e.g., "easy", "medium", "hard"
  start_date?: string;  // Format: "YYYY-MM-DD"
  end_date?: string;    // Format: "YYYY-MM-DD"
}) => {
  const token = await getToken();

  const response = await fetch("http://172.19.175.17:5000/challenges", {
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

  const data = await response.json();
  return data;
};