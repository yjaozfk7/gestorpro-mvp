// Funções de armazenamento local
import { Transaction, Task, User } from './types'

const STORAGE_KEYS = {
  TRANSACTIONS: 'gestorpro_transactions',
  TASKS: 'gestorpro_tasks',
  USER: 'gestorpro_user',
}

// Transações
export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  return data ? JSON.parse(data) : []
}

export const saveTransaction = (transaction: Transaction) => {
  const transactions = getTransactions()
  transactions.push(transaction)
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
}

export const deleteTransaction = (id: string) => {
  const transactions = getTransactions().filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
}

// Tarefas
export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.TASKS)
  return data ? JSON.parse(data) : []
}

export const saveTask = (task: Task) => {
  const tasks = getTasks()
  tasks.push(task)
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

export const updateTask = (id: string, updates: Partial<Task>) => {
  const tasks = getTasks().map(t => t.id === id ? { ...t, ...updates } : t)
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

export const deleteTask = (id: string) => {
  const tasks = getTasks().filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

// Usuário
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}
