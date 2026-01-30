// Tipos específicos do Supabase
export interface Profile {
  id: string
  name: string
  business_name?: string
  email: string
  phone?: string
  email_verified: boolean
  business_category: string
  what_you_sell?: string
  subscription_plan: 'gratuito' | 'premium' | 'pro'
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  business_area: string
  revenue: number
  cost: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ClientRevenueHistory {
  id: string
  client_id: string
  user_id: string
  revenue: number
  cost: number
  date: string
  notes?: string
  created_at: string
}
