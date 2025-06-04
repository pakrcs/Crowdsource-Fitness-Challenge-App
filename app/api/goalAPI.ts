import { getToken } from '../firebase/firebaseAuth';
import { BASE_URL } from '../config';

export interface Goal {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
}

// Fetch all goals
export async function getGoals(): Promise<Goal[]> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/goals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Could not load goals: ${res.statusText}`);
  const json = await res.json();
  return json.goals as Goal[];
}

// Create a goal
export async function createGoal(title: string, description?: string): Promise<Goal> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, description })
  });
  if (!res.ok) throw new Error(`Could not create goal: ${res.statusText}`);
  const json = await res.json();
  return json.goal as Goal;
}


// Delete goal
export async function deleteGoal(goalId: number): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/goals/${goalId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Could not delete goal: ${res.statusText}`);
}
