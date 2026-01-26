import { Goal } from './types'

const GOALS_KEY = 'gestorpro_goals'

export function getGoals(): Goal[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(GOALS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveGoal(goal: Goal): void {
  const goals = getGoals()
  goals.push(goal)
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}

export function updateGoal(id: string, updates: Partial<Goal>): void {
  const goals = getGoals()
  const index = goals.findIndex(g => g.id === id)
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates }
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  }
}

export function deleteGoal(id: string): void {
  const goals = getGoals()
  const filtered = goals.filter(g => g.id !== id)
  localStorage.setItem(GOALS_KEY, JSON.stringify(filtered))
}
