import { getToken } from '../firebase/firebaseAuth';
import { BASE_URL } from '../config';

export interface ChallengePreview {
  title: string;
  description: string;
  difficulty: string;
}

export interface CommunityMessage {
  id: number;
  user: string;
  text: string;
  image_url?: string;
  timestamp: string;
}

export const getHomeContent = async (): Promise<{
  latest_challenges: ChallengePreview[];
  latest_community_messages: CommunityMessage[];
}> => {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/latest`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch home content');
  }

  return await response.json();
};
