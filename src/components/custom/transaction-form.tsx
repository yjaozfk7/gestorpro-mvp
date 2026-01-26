'use client'

import { useState } from 'react'
import { Transaction } from '@/lib/types'
import { saveTransaction } from '@/lib/storage'
import { ArrowDownCircle, ArrowUpCircle, Wallet, Plus } from 'lucide-react'

interface TransactionFormProps {
  onTransactionAdded: () => void
}

export function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [type, setType] = useState<'entrada' | 'saida' | 'salario'>('entrada')
  const [value, setValue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!value || parseFloat(value) <= 0) return

    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      value: parseFloat(value),
      date,
      description: description || undefined,
    }

    saveTransaction(transaction)
    setValue('')
    setDescription('')
    onTransactionAdded()
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Registrar movimentação
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de transação */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setType('entrada')}
            className={`p-4 rounded-xl border-2 transition-all ${
              type === 'entrada'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
            }`}
          >
            <ArrowDownCircle className={`w-6 h-6 mx-auto mb-1 ${
              type === 'entrada' ? 'text-emerald-600' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              type === 'entrada' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'
            }`}>
              Entrada
            </span>
          </button>

          <button
            type="button"
            onClick={() => setType('saida')}
            className={`p-4 rounded-xl border-2 transition-all ${
              type === 'saida'
                ? 'border-red-500 bg-red-50 dark:bg-red-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
            }`}
          >
            <ArrowUpCircle className={`w-6 h-6 mx-auto mb-1 ${
              type === 'saida' ? 'text-red-600' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              type === 'saida' ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'
            }`}>
              Saída
            </span>
          </button>

          <button
            type="button"
            onClick={() => setType('salario')}
            className={`p-4 rounded-xl border-2 transition-all ${
              type === 'salario'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <Wallet className={`w-6 h-6 mx-auto mb-1 ${
              type === 'salario' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              type === 'salario' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
            }`}>
              Retirada
            </span>
          </button>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Descrição (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Venda de produto, Pagamento de fornecedor..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Adicionar
        </button>
      </form>
    </div>
  )
}
