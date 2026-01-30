// Tipos do GestorPro

export interface Transaction {
  id: string
  type: 'entrada' | 'saida' | 'salario' | 'gasto_fixo' | 'gasto_variavel'
  value: number
  date: string
  description?: string
  expenseType?: string // Para gastos fixos/variáveis (ex: "Aluguel", "Conta de luz")
}

export interface Task {
  id: string
  title: string
  completed: boolean
  date: string
  type: 'curto_prazo' | 'longo_prazo'
  deadline?: string
  priority: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_andamento' | 'concluida'
}

export interface Goal {
  id: string
  title: string
  type: 'curto_prazo' | 'longo_prazo'
  deadline?: string
  progress: number // 0-100
  description?: string
}

export interface MonthlyData {
  month: string // formato: YYYY-MM
  entradas: number
  saidas: number
  salarios: number
  gastosFixos: number
  gastosVariaveis: number
  saldo: number
}

// Tipos de planos (compatível com Kiwify)
export type SubscriptionPlan = 'gratuito' | 'premium' | 'pro'

// Alias para compatibilidade com nomenclatura da Kiwify
export type KiwifyPlan = 'free' | 'premium' | 'pro'

// Mapeamento entre nomenclaturas
export const PLAN_MAPPING: Record<KiwifyPlan, SubscriptionPlan> = {
  'free': 'gratuito',
  'premium': 'premium',
  'pro': 'pro'
}

export const REVERSE_PLAN_MAPPING: Record<SubscriptionPlan, KiwifyPlan> = {
  'gratuito': 'free',
  'premium': 'premium',
  'pro': 'pro'
}

export interface User {
  name: string
  businessName?: string
  email: string
  phone?: string // Novo campo para telefone
  emailVerified?: boolean // Status de verificação de e-mail
  businessCategory: 'comercio' | 'servicos' | 'alimentacao' | 'negocio_local' | 'online' | 'autonomo' | 'industria_leve' | 'profissional_liberal' | 'outro'
  whatYouSell?: string
  isPremium?: boolean
  subscriptionPlan: SubscriptionPlan
}

export interface Employee {
  id: string
  name: string
  role: string
  status: 'ativo' | 'inativo'
  monthlyCost: number
  monthlyBonus?: number // Bonificação mensal (Premium/Pro)
  startDate: string
  notes?: string
  // Campos Pro
  assignedGoal?: string
  generatedRevenue?: number
  estimatedProfit?: number
  goalAchieved?: boolean
}

export interface OnboardingProgress {
  firstEntry: boolean
  firstGoal: boolean
  firstTask: boolean
  firstEmployee: boolean
  profileComplete: boolean // Cadastro completo
  emailVerified: boolean // E-mail confirmado
  phoneAdded: boolean // Telefone adicionado
}
