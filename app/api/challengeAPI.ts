import { getToken } from '../firebase/firebaseAuth';

export const createChallenge = async (challengeData: { title: string; description?: string }) => {
  const token = await getToken();

  const response = await fetch("http://localhost:5000/challenges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(challengeData)
  });

  const data = await response.json();
  return data;
};