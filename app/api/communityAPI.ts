import { getToken } from '../firebase/firebaseAuth';
import { BASE_URL } from '../config';

export interface CommunityMessage {
  id: number;
  user: string;
  text: string;
  image_url: string | null;
  timestamp: string;
}

// Fetch
export const getCommunityMessages = async (): Promise<CommunityMessage[]> => {
  const response = await fetch(`${BASE_URL}/community_chat`);
  if (!response.ok) {
    throw new Error("Failed to fetch community messages");
  }
  return await response.json();
};

// Post
export const postCommunityMessage = async (data: {
  user: string;
  text?: string;
  image_url?: string;
}) => {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/community_chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to post community message");
  }

  return await response.json();
};
