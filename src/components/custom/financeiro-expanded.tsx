'use client'

import { useState } from 'react'
import { Transaction } from '@/lib/types'
import { saveTransaction } from '@/lib/storage'
import { DollarSign, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface FinanceiroExpandedProps {
  transactions: Transaction[]
  onTransactionsChanged: () => void
}

export function FinanceiroExpanded({ transactions, onTransactionsChanged }: FinanceiroExpandedProps) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<'entrada' | 'saida' | 'salario' | 'gasto_fixo' | 'gasto_variavel'>('entrada')
  const [value, setValue] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth))

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value || parseFloat(value) <= 0) return

    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      value: parseFloat(value),
      date,
      description: description.trim() || undefined,
    }

    saveTransaction(transaction)
    setValue('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setShowForm(false)
    onTransactionsChanged()
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'entrada': return 'Entrada'
      case 'saida': return 'Saída'
      case 'salario': return 'Salário/Retirada'
      case 'gasto_fixo': return 'Gasto Fixo'
      case 'gasto_variavel': return 'Gasto Variável'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entrada': return 'text-emerald-600 dark:text-emerald-400'
      case 'saida': return 'text-red-600 dark:text-red-400'
      case 'salario': return 'text-purple-600 dark:text-purple-400'
      case 'gasto_fixo': return 'text-orange-600 dark:text-orange-400'
      case 'gasto_variavel': return 'text-amber-600 dark:text-amber-400'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo - CORRIGIDO: Total de Saídas agora inclui tudo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Entradas</p>
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            R$ {entradas.toFixed(2)}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Total de Saídas</p>
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            R$ {totalSaidas.toFixed(2)}
          </p>
          {salarios > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              (inclui R$ {salarios.toFixed(2)} de retirada)
            </p>
          )}
        </div>

        <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Gastos Fixos</p>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            R$ {gastosFixos.toFixed(2)}
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Gastos Variáveis</p>
          </div>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            R$ {gastosVariaveis.toFixed(2)}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Salários</p>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            R$ {salarios.toFixed(2)}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${
          saldo >= 0
            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-5 h-5 ${saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
            <p className={`text-sm font-medium ${saldo >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
              Saldo Final
            </p>
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-red-900 dark:text-red-100'}`}>
            R$ {saldo.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Botão adicionar */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Adicionar movimentação</span>
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Nova movimentação
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="gasto_fixo">Gasto Fixo (aluguel, luz, água...)</option>
                <option value="gasto_variavel">Gasto Variável (compras, combustível...)</option>
                <option value="salario">Salário/Retirada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setValue('')
                  setDescription('')
                  setDate(new Date().toISOString().split('T')[0])
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de movimentações */}
      {monthTransactions.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Últimas movimentações
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {monthTransactions
              .slice()
              .reverse()
              .slice(0, 20)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t.description || getTypeLabel(t.type)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.type === 'entrada' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        t.type === 'gasto_fixo' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                        t.type === 'gasto_variavel' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        t.type === 'salario' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
                        'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      }`}>
                        {getTypeLabel(t.type)}
                      </span>
                    </div>
                  </div>
                  <span className={`font-bold ${getTypeColor(t.type)}`}>
                    {t.type === 'entrada' ? '+' : '-'} R$ {t.value.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Você ainda não registrou nenhuma movimentação este mês
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Adicione sua primeira entrada usando o botão acima
          </p>
        </div>
      )}
    </div>
  )
}
