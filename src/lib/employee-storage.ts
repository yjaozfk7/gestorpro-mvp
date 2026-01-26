import { Employee } from './types'

const EMPLOYEES_KEY = 'gestorpro_employees'

export function getEmployees(): Employee[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(EMPLOYEES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveEmployee(employee: Employee): void {
  const employees = getEmployees()
  employees.push(employee)
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees))
}

export function updateEmployee(id: string, updates: Partial<Employee>): void {
  const employees = getEmployees()
  const index = employees.findIndex(e => e.id === id)
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updates }
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees))
  }
}

export function deleteEmployee(id: string): void {
  const employees = getEmployees()
  const filtered = employees.filter(e => e.id !== id)
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(filtered))
}

export function getTotalEmployeeCost(): number {
  const employees = getEmployees()
  return employees
    .filter(e => e.status === 'ativo')
    .reduce((sum, e) => sum + e.monthlyCost, 0)
}
