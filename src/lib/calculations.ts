// Cálculos e utilitários
import { Transaction, MonthlyData } from './types'

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const getCurrentMonth = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const getPreviousMonth = (): string => {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
}

export const getMonthName = (monthStr: string): string => {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export const calculateMonthlyData = (transactions: Transaction[], month: string): MonthlyData => {
  const monthTransactions = transactions.filter(t => t.date.startsWith(month))
  
  // Total de Entradas
  const entradas = monthTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.value, 0)
  
  // Saídas gerais
  const saidas = monthTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.value, 0)
  
  // Salários / Retiradas
  const salarios = monthTransactions
    .filter(t => t.type === 'salario')
    .reduce((sum, t) => sum + t.value, 0)
  
  // Gastos Fixos
  const gastosFixos = monthTransactions
    .filter(t => t.type === 'gasto_fixo')
    .reduce((sum, t) => sum + t.value, 0)
  
  // Gastos Variáveis
  const gastosVariaveis = monthTransactions
    .filter(t => t.type === 'gasto_variavel')
    .reduce((sum, t) => sum + t.value, 0)
  
  // Total de Saídas (Dinheiro que saiu) = Saídas gerais + Gastos Fixos + Gastos Variáveis + Salários/Retiradas
  const totalSaidas = saidas + gastosFixos + gastosVariaveis + salarios
  
  // Quanto sobrou = Entradas - Total de Saídas
  const saldo = entradas - totalSaidas
  
  return { 
    month, 
    entradas, 
    saidas: totalSaidas, // Total de saídas completo
    salarios, // Mantém separado para exibição informativa
    saldo 
  }
}

export const getGrowthComparison = (current: MonthlyData, previous: MonthlyData): {
  status: 'cresceu' | 'caiu' | 'manteve'
  percentage: number
} => {
  if (previous.saldo === 0) {
    return { status: 'manteve', percentage: 0 }
  }
  
  const diff = current.saldo - previous.saldo
  const percentage = (diff / Math.abs(previous.saldo)) * 100
  
  if (percentage > 5) return { status: 'cresceu', percentage }
  if (percentage < -5) return { status: 'caiu', percentage }
  return { status: 'manteve', percentage }
}
