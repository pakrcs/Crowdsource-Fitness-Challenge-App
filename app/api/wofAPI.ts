import { auth } from '../firebase/firebaseConfig'; 
import { BASE_URL } from '../config';

export interface LeaderboardUser {
  id: number;
  username: string;
  email: string;
  bronze_badges: number;
  silver_badges: number;
  gold_badges: number;
  firebase_uid: string;
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${BASE_URL}/leaderboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Leaderboard fetch failed: ${text}`);
  }
  return res.json();
}
