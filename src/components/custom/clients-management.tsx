'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, Users as UsersIcon } from 'lucide-react'
import type { Client } from '@/lib/supabase-types'
import { getClients, createClient, updateClient, deleteClient, getClientMetrics } from '@/lib/supabase-clients'
import { getCurrentUser } from '@/lib/supabase-auth'

interface ClientsManagementProps {
  userPlan: 'gratuito' | 'premium' | 'pro'
}

export function ClientsManagement({ userPlan }: ClientsManagementProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [name, setName] = useState('')
  const [businessArea, setBusinessArea] = useState('')
  const [revenue, setRevenue] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')

  // Métricas (Pro)
  const [metrics, setMetrics] = useState<any>(null)
  const [filterBy, setFilterBy] = useState<'revenue' | 'cost' | 'profit'>('revenue')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const data = await getClients(user.id)
      setClients(data)

      if (userPlan === 'pro') {
        const metricsData = await getClientMetrics(user.id)
        setMetrics(metricsData)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const clientData = {
        user_id: user.id,
        name: name.trim(),
        business_area: businessArea.trim(),
        revenue: parseFloat(revenue) || 0,
        cost: parseFloat(cost) || 0,
        notes: notes.trim() || undefined,
      }

      if (editingClient) {
        await updateClient(editingClient.id, clientData)
      } else {
        await createClient(clientData)
      }

      resetForm()
      loadClients()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      alert('Erro ao salvar cliente. Tente novamente.')
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      await deleteClient(clientId)
      loadClients()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      alert('Erro ao excluir cliente. Tente novamente.')
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setName(client.name)
    setBusinessArea(client.business_area)
    setRevenue(client.revenue.toString())
    setCost(client.cost.toString())
    setNotes(client.notes || '')
    setShowAddModal(true)
  }

  const resetForm = () => {
    setName('')
    setBusinessArea('')
    setRevenue('')
    setCost('')
    setNotes('')
    setEditingClient(null)
    setShowAddModal(false)
  }

  const getFilteredClients = () => {
    if (userPlan !== 'pro') return clients

    const sorted = [...clients].sort((a, b) => {
      switch (filterBy) {
        case 'revenue':
          return b.revenue - a.revenue
        case 'cost':
          return b.cost - a.cost
        case 'profit':
          return (b.revenue - b.cost) - (a.revenue - a.cost)
        default:
          return 0
      }
    })
    return sorted
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas (Pro) */}
      {userPlan === 'pro' && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="w-6 h-6" />
              <span className="text-2xl font-bold">{metrics.clientCount}</span>
            </div>
            <p className="text-blue-100 text-sm">Total de Clientes</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-2xl font-bold">R$ {metrics.totalRevenue.toFixed(0)}</span>
            </div>
            <p className="text-emerald-100 text-sm">Receita Total</p>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-6 h-6" />
              <span className="text-2xl font-bold">R$ {metrics.totalCost.toFixed(0)}</span>
            </div>
            <p className="text-amber-100 text-sm">Custo Total</p>
          </div>

          <div className={`bg-gradient-to-br ${metrics.totalProfit >= 0 ? 'from-green-600 to-emerald-600' : 'from-red-600 to-rose-600'} p-6 rounded-2xl text-white`}>
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-2xl font-bold">R$ {metrics.totalProfit.toFixed(0)}</span>
            </div>
            <p className="text-white/80 text-sm">Lucro Total</p>
          </div>
        </div>
      )}

      {/* Filtros (Pro) */}
      {userPlan === 'pro' && clients.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ordenar por:
          </label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="revenue">Maior Receita</option>
            <option value="cost">Maior Custo</option>
            <option value="profit">Maior Lucro</option>
          </select>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Clientes
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Cliente</span>
        </button>
      </div>

      {/* Lista de clientes */}
      {clients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nenhum cliente cadastrado ainda
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Adicionar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getFilteredClients().map((client) => {
            const profit = client.revenue - client.cost
            return (
              <div
                key={client.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {client.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.business_area}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Receita:</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      R$ {client.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Custo:</span>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      R$ {client.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lucro:</span>
                    <span className={`text-sm font-bold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      R$ {profit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.notes}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de adicionar/editar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do cliente ou empresa *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva, Empresa XYZ"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Área de atuação *
                </label>
                <input
                  type="text"
                  value={businessArea}
                  onChange={(e) => setBusinessArea(e.target.value)}
                  placeholder="Ex: Varejo, Serviços, Tecnologia"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Receita gerada (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custo associado (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !businessArea.trim() || !revenue || !cost}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-colors"
                >
                  {editingClient ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
