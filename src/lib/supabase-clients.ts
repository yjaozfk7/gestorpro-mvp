import { supabase } from './supabase'
import type { Client, ClientRevenueHistory } from './supabase-types'

// Clientes
export async function getClients(userId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar clientes:', error)
    return []
  }
  
  return data || []
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateClient(clientId: string, updates: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteClient(clientId: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
  
  if (error) throw error
}

// Histórico de receita (Plano Pro)
export async function getClientRevenueHistory(clientId: string): Promise<ClientRevenueHistory[]> {
  const { data, error } = await supabase
    .from('client_revenue_history')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar histórico:', error)
    return []
  }
  
  return data || []
}

export async function addClientRevenueHistory(
  history: Omit<ClientRevenueHistory, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('client_revenue_history')
    .insert([history])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Métricas agregadas (Plano Pro)
export async function getClientMetrics(userId: string) {
  const clients = await getClients(userId)
  
  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)
  const totalCost = clients.reduce((sum, c) => sum + c.cost, 0)
  const totalProfit = totalRevenue - totalCost
  
  const sortedByRevenue = [...clients].sort((a, b) => b.revenue - a.revenue)
  const sortedByCost = [...clients].sort((a, b) => b.cost - a.cost)
  const sortedByProfit = [...clients].sort((a, b) => 
    (b.revenue - b.cost) - (a.revenue - a.cost)
  )
  
  return {
    totalRevenue,
    totalCost,
    totalProfit,
    clientCount: clients.length,
    topByRevenue: sortedByRevenue.slice(0, 5),
    topByCost: sortedByCost.slice(0, 5),
    topByProfit: sortedByProfit.slice(0, 5),
  }
}
