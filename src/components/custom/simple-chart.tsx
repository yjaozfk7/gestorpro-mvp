'use client'

import { MonthlyData } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'

interface SimpleChartProps {
  currentMonth: MonthlyData
  previousMonth: MonthlyData
}

export function SimpleChart({ currentMonth, previousMonth }: SimpleChartProps) {
  const maxValue = Math.max(
    currentMonth.entradas,
    currentMonth.saidas + currentMonth.salarios,
    previousMonth.entradas,
    previousMonth.saidas + previousMonth.salarios
  )

  const getBarHeight = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * 100 : 0
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Comparação com mês anterior
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Mês anterior */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 text-center">
            Mês passado
          </p>
          <div className="space-y-4">
            {/* Entradas */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Entradas</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(previousMonth.entradas)}
                </span>
              </div>
              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg transition-all duration-500"
                  style={{ width: `${getBarHeight(previousMonth.entradas)}%` }}
                />
              </div>
            </div>

            {/* Saídas */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Saídas</span>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(previousMonth.saidas + previousMonth.salarios)}
                </span>
              </div>
              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-lg transition-all duration-500"
                  style={{ width: `${getBarHeight(previousMonth.saidas + previousMonth.salarios)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mês atual */}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 text-center">
            Este mês
          </p>
          <div className="space-y-4">
            {/* Entradas */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Entradas</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(currentMonth.entradas)}
                </span>
              </div>
              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg transition-all duration-500"
                  style={{ width: `${getBarHeight(currentMonth.entradas)}%` }}
                />
              </div>
            </div>

            {/* Saídas */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Saídas</span>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(currentMonth.saidas + currentMonth.salarios)}
                </span>
              </div>
              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-lg transition-all duration-500"
                  style={{ width: `${getBarHeight(currentMonth.saidas + currentMonth.salarios)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
