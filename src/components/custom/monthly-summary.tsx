'use client'

import { MonthlyData } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { TrendingUp, TrendingDown, Minus, DollarSign, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

interface MonthlySummaryProps {
  currentMonth: MonthlyData
  previousMonth: MonthlyData
  growth: {
    status: 'cresceu' | 'caiu' | 'manteve'
    percentage: number
  }
}

export function MonthlySummary({ currentMonth, previousMonth, growth }: MonthlySummaryProps) {
  const getGrowthIcon = () => {
    if (growth.status === 'cresceu') return <TrendingUp className="w-5 h-5" />
    if (growth.status === 'caiu') return <TrendingDown className="w-5 h-5" />
    return <Minus className="w-5 h-5" />
  }

  const getGrowthColor = () => {
    if (growth.status === 'cresceu') return 'text-emerald-600 dark:text-emerald-400'
    if (growth.status === 'caiu') return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getGrowthText = () => {
    if (growth.status === 'cresceu') return 'Seu negócio cresceu!'
    if (growth.status === 'caiu') return 'Atenção: negócio em queda'
    return 'Negócio estável'
  }

  return (
    <div className="space-y-4">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Dinheiro que entrou</span>
            <ArrowDownCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(currentMonth.entradas)}
          </p>
        </div>

        {/* Saídas - CORRIGIDO: agora usa o total completo de saídas */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Dinheiro que saiu</span>
            <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">
            {formatCurrency(currentMonth.saidas)}
          </p>
          {currentMonth.salarios > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              (inclui {formatCurrency(currentMonth.salarios)} de retirada)
            </p>
          )}
        </div>

        {/* Saldo */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Quanto sobrou</span>
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(currentMonth.saldo)}
          </p>
        </div>
      </div>

      {/* Comparação com mês anterior */}
      <div className={`p-6 rounded-2xl border-2 ${
        growth.status === 'cresceu' 
          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700' 
          : growth.status === 'caiu'
          ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={getGrowthColor()}>
            {getGrowthIcon()}
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-lg ${getGrowthColor()}`}>
              {getGrowthText()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comparado ao mês passado: {Math.abs(growth.percentage).toFixed(1)}%
              {growth.status === 'cresceu' && ' a mais'}
              {growth.status === 'caiu' && ' a menos'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
