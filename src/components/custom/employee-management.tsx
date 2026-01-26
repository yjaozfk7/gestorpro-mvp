'use client'

import { useState } from 'react'
import { Employee } from '@/lib/types'
import { saveEmployee, updateEmployee, deleteEmployee } from '@/lib/employee-storage'
import { Users, Plus, Trash2, DollarSign, Calendar, FileText, Target } from 'lucide-react'

interface EmployeeManagementProps {
  employees: Employee[]
  onEmployeesChanged: () => void
  userPlan: 'gratuito' | 'premium' | 'pro'
}

export function EmployeeManagement({ employees, onEmployeesChanged, userPlan }: EmployeeManagementProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [monthlyCost, setMonthlyCost] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [editingBonusId, setEditingBonusId] = useState<string | null>(null)
  const [editBonusValue, setEditBonusValue] = useState('')

  const activeEmployees = employees.filter(e => e.status === 'ativo')
  const totalCost = activeEmployees.reduce((sum, e) => sum + e.monthlyCost + (e.monthlyBonus || 0), 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim() || !monthlyCost) return

    const employee: Employee = {
      id: Date.now().toString(),
      name: name.trim(),
      role: role.trim(),
      status: 'ativo',
      monthlyCost: parseFloat(monthlyCost),
      startDate: startDate,
      notes: notes.trim() || undefined,
    }

    saveEmployee(employee)
    setName('')
    setRole('')
    setMonthlyCost('')
    setStartDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setShowForm(false)
    onEmployeesChanged()
  }

  const handleToggleStatus = (id: string, currentStatus: 'ativo' | 'inativo') => {
    updateEmployee(id, { status: currentStatus === 'ativo' ? 'inativo' : 'ativo' })
    onEmployeesChanged()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
      deleteEmployee(id)
      onEmployeesChanged()
    }
  }

  return (
    <div className="space-y-6">
      {/* Card de resumo */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Equipe</h2>
            <p className="text-blue-100 text-sm">
              {activeEmployees.length} {activeEmployees.length === 1 ? 'funcionário ativo' : 'funcionários ativos'}
            </p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
          <p className="text-blue-100 text-sm mb-1">Custo total da equipe</p>
          <p className="text-3xl font-bold">R$ {totalCost.toFixed(2)}</p>
          <p className="text-blue-100 text-xs mt-1">por mês (incluindo bonificações)</p>
        </div>
      </div>

      {/* Botão adicionar */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Adicionar funcionário</span>
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Novo funcionário
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Função
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Vendedor, Caixa, Entregador..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custo mensal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyCost}
                  onChange={(e) => setMonthlyCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Quanto este funcionário custa por mês (salário + encargos)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de entrada
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informações adicionais..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  setName('')
                  setRole('')
                  setMonthlyCost('')
                  setStartDate(new Date().toISOString().split('T')[0])
                  setNotes('')
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de funcionários */}
      {employees.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Você ainda não tem funcionários cadastrados
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Adicione sua equipe para controlar os custos mensais
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className={`bg-white dark:bg-gray-800 p-4 rounded-xl border transition-all duration-200 ${
                employee.status === 'ativo'
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {employee.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        employee.status === 'ativo'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {employee.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {employee.role}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {new Date(employee.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        R$ {employee.monthlyCost.toFixed(2)}/mês
                      </span>
                    </div>
                  </div>
                  
                  {/* Bonificação (Premium/Pro) */}
                  {(userPlan === 'premium' || userPlan === 'pro') && employee.status === 'ativo' && (
                    <div className="mt-2">
                      {editingBonusId === employee.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editBonusValue}
                            onChange={(e) => setEditBonusValue(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          />
                          <button
                            onClick={() => {
                              updateEmployee(employee.id, { monthlyBonus: parseFloat(editBonusValue) || 0 })
                              setEditingBonusId(null)
                              setEditBonusValue('')
                              onEmployeesChanged()
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditingBonusId(null)
                              setEditBonusValue('')
                            }}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Bonificação: <strong className="text-emerald-600 dark:text-emerald-400">
                              R$ {(employee.monthlyBonus || 0).toFixed(2)}
                            </strong>
                          </span>
                          <button
                            onClick={() => {
                              setEditingBonusId(employee.id)
                              setEditBonusValue((employee.monthlyBonus || 0).toString())
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {employee.monthlyBonus ? 'Editar' : 'Adicionar'}
                          </button>
                          {employee.monthlyBonus && (
                            <button
                              onClick={() => {
                                updateEmployee(employee.id, { monthlyBonus: 0 })
                                onEmployeesChanged()
                              }}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {employee.notes && (
                    <div className="mt-2 flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{employee.notes}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleStatus(employee.id, employee.status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      employee.status === 'ativo'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                    }`}
                  >
                    {employee.status === 'ativo' ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Seção Resultados (apenas para plano Pro) */}
              {userPlan === 'pro' && employee.status === 'ativo' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Resultados
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Receita gerada</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        R$ {(employee.generatedRevenue || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      (employee.estimatedProfit || 0) >= 0
                        ? 'bg-emerald-50 dark:bg-emerald-950'
                        : 'bg-red-50 dark:bg-red-950'
                    }`}>
                      <p className={`text-xs mb-1 ${
                        (employee.estimatedProfit || 0) >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        Lucro estimado
                      </p>
                      <p className={`text-lg font-bold ${
                        (employee.estimatedProfit || 0) >= 0
                          ? 'text-emerald-900 dark:text-emerald-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        R$ {(employee.estimatedProfit || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {employee.assignedGoal && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Meta:</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {employee.assignedGoal}
                      </span>
                      {employee.goalAchieved !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          employee.goalAchieved
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {employee.goalAchieved ? 'Atingiu' : 'Não atingiu'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Alerta para funcionário sem meta (plano Pro) */}
              {userPlan === 'pro' && employee.status === 'ativo' && !employee.assignedGoal && (
                <div className="mt-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    ⚠️ Este funcionário ainda não tem meta atribuída
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
