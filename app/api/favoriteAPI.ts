import { getToken } from '../firebase/firebaseAuth';
import { BASE_URL } from '../config';

export interface FavoriteChallenge {
    id: number
    title: string
    description: string | null
    goal: number | null
    unit: string | null
    difficulty: string | null
    start_date: string | null
    end_date: string | null
    created_at: string
    creator: string
    goal_list: string[] | null
}

// Get favorite
export async function getFavorites(): Promise<FavoriteChallenge[]> {
    const token = await getToken()
    const res = await fetch(`${BASE_URL}/favorites`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`Fetch favorites failed: ${res.status}`)
    const json = await res.json()
    return json.favorites as FavoriteChallenge[]
}

// Delete favorite
export async function deleteFavorite(challengeId: number): Promise<void> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}/favorites/${challengeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Failed to delete favorite: ${res.status} ${txt}`)
  }
}

// Add favorite
export async function addFavorite(challengeId: number): Promise<void> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}/favorites/${challengeId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  if (res.status === 409) {
    throw new Error('This challenge is already favorited.')
  }
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Failed to add favorite: ${res.status} ${txt}`)
  }
}
