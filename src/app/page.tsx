'use client'

import { useEffect, useState } from 'react'
import { Transaction, Task, User, Employee, Goal, SubscriptionPlan } from '@/lib/types'
import { getTransactions, getTasks, getUser, saveUser } from '@/lib/storage'
import { getEmployees } from '@/lib/employee-storage'
import { getGoals } from '@/lib/goals-storage'
import { getOnboardingProgress, updateOnboardingProgress, getOnboardingCompletion } from '@/lib/onboarding-storage'
import { supabase } from '@/lib/supabase'
import { 
  calculateMonthlyData, 
  getCurrentMonth, 
  getPreviousMonth, 
  getGrowthComparison,
  getMonthName 
} from '@/lib/calculations'
import { MonthlySummary } from '@/components/custom/monthly-summary'
import { SimpleChart } from '@/components/custom/simple-chart'
import { PessoasTab } from '@/components/custom/pessoas-tab'
import { TasksExpanded } from '@/components/custom/tasks-expanded'
import { FinanceiroExpanded } from '@/components/custom/financeiro-expanded'
import { PlansModal } from '@/components/custom/plans-modal'
import { TrendingUp, LayoutDashboard, DollarSign, CheckSquare, Users, UserCircle, Crown, AlertCircle, ArrowUp, ArrowDown, Minus as MinusIcon, Phone, Mail } from 'lucide-react'

type TabType = 'resumo' | 'financeiro' | 'tarefas' | 'pessoas' | 'conta'
type AuthMethod = 'email' | 'phone'

export default function GestorPro() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('resumo')
  const [userName, setUserName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessCategory, setBusinessCategory] = useState<'comercio' | 'servicos' | 'alimentacao' | 'negocio_local' | 'online' | 'autonomo' | 'industria_leve' | 'profissional_liberal' | 'outro'>('comercio')
  const [whatYouSell, setWhatYouSell] = useState('')
  const [showPlansModal, setShowPlansModal] = useState(false)
  
  // Estados de autenticação
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  
  // Estado para controlar hidratação
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marcar que estamos no cliente para evitar problemas de hidratação
    setIsClient(true)
    
    // Verificar sessão do Supabase
    checkSupabaseSession()
    
    // Carregar dados do localStorage
    setTransactions(getTransactions())
    setTasks(getTasks())
    setGoals(getGoals())
    setEmployees(getEmployees())
    const savedUser = getUser()
    setUser(savedUser)
    setShowWelcome(!savedUser)
    
    if (savedUser) {
      setUserName(savedUser.name)
      setBusinessName(savedUser.businessName || '')
      setEmail(savedUser.email)
      setPhone(savedUser.phone || '')
      setBusinessCategory(savedUser.businessCategory)
      setWhatYouSell(savedUser.whatYouSell || '')
    }
  }, [])

  const checkSupabaseSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      // Usuário já autenticado via Supabase
      const savedUser = getUser()
      if (!savedUser) {
        // Criar perfil local baseado no usuário do Supabase
        setEmail(session.user.email || '')
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '')
      }
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setAuthMessage('')
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
    } catch (error: any) {
      setAuthMessage(error.message || 'Erro ao fazer login com Google')
      setIsLoading(false)
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || (authMethod === 'email' && !email.trim()) || (authMethod === 'phone' && !phone.trim())) return

    setIsLoading(true)
    setAuthMessage('')

    try {
      if (authMethod === 'email') {
        // Cadastro/Login com e-mail
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: true,
          },
        })
        
        if (error) throw error
        
        setShowVerification(true)
        setAuthMessage('Enviamos um código de verificação de 6 dígitos para seu e-mail.')
        updateOnboardingProgress({ profileComplete: true })
      } else {
        // Cadastro/Login com telefone
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
          options: {
            shouldCreateUser: true,
          },
        })
        
        if (error) throw error
        
        setShowVerification(true)
        setAuthMessage('Enviamos um código de verificação por SMS para seu telefone.')
        updateOnboardingProgress({ profileComplete: true, phoneAdded: true })
      }
    } catch (error: any) {
      setAuthMessage(error.message || 'Erro ao enviar código de verificação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setAuthMessage('Por favor, insira o código de 6 dígitos')
      return
    }

    setIsLoading(true)
    setAuthMessage('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        [authMethod === 'email' ? 'email' : 'phone']: authMethod === 'email' ? email : phone,
        token: verificationCode,
        type: authMethod === 'email' ? 'email' : 'sms',
      })
      
      if (error) throw error
      
      // E-mail/telefone confirmado com sucesso
      const newUser: User = {
        name: userName,
        businessName: businessName || undefined,
        email: email,
        phone: phone || undefined,
        businessCategory: businessCategory,
        whatYouSell: whatYouSell || undefined,
        isPremium: false,
        subscriptionPlan: 'gratuito',
      }
      saveUser(newUser)
      setUser(newUser)
      setShowWelcome(false)
      updateOnboardingProgress({ emailVerified: true })
      setAuthMessage('E-mail confirmado com sucesso!')
    } catch (error: any) {
      setAuthMessage(error.message || 'Código inválido. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !email.trim()) return

    const updatedUser: User = {
      name: userName,
      businessName: businessName || undefined,
      email: email,
      phone: phone || undefined,
      businessCategory: businessCategory,
      whatYouSell: whatYouSell || undefined,
      isPremium: user?.isPremium || false,
      subscriptionPlan: user?.subscriptionPlan || 'gratuito',
    }
    saveUser(updatedUser)
    setUser(updatedUser)
  }

  const refreshData = () => {
    setTransactions(getTransactions())
    setTasks(getTasks())
    setGoals(getGoals())
    setEmployees(getEmployees())
  }

  // Calcular dados mensais apenas no cliente
  const currentMonth = isClient ? getCurrentMonth() : ''
  const previousMonth = isClient ? getPreviousMonth() : ''
  const currentData = isClient ? calculateMonthlyData(transactions, currentMonth) : { month: '', entradas: 0, saidas: 0, salarios: 0, saldo: 0 }
  const previousData = isClient ? calculateMonthlyData(transactions, previousMonth) : { month: '', entradas: 0, saidas: 0, salarios: 0, saldo: 0 }
  const growth = isClient ? getGrowthComparison(currentData, previousData) : { status: 'manteve' as const, percentage: 0 }

  // Progresso do onboarding apenas no cliente
  const onboardingProgress = isClient ? getOnboardingProgress() : { profileComplete: false, emailVerified: false, phoneAdded: false, firstEntry: false, firstGoal: false, firstTask: false, firstEmployee: false }
  const onboardingCompletion = isClient ? getOnboardingCompletion() : 0

  // Atualizar progresso do onboarding
  useEffect(() => {
    if (!isClient) return
    
    if (transactions.length > 0 && !onboardingProgress.firstEntry) {
      updateOnboardingProgress({ firstEntry: true })
    }
    if (goals.length > 0 && !onboardingProgress.firstGoal) {
      updateOnboardingProgress({ firstGoal: true })
    }
    if (tasks.length > 0 && !onboardingProgress.firstTask) {
      updateOnboardingProgress({ firstTask: true })
    }
    if (employees.length > 0 && !onboardingProgress.firstEmployee) {
      updateOnboardingProgress({ firstEmployee: true })
    }
    if (phone && !onboardingProgress.phoneAdded) {
      updateOnboardingProgress({ phoneAdded: true })
    }
  }, [transactions, goals, tasks, employees, phone, isClient])

  // Gerar mensagem inteligente
  const getSmartMessage = () => {
    if (!isClient) return { text: "Carregando...", type: 'neutral' as const }
    
    const hasData = currentData.entradas > 0 || currentData.saidas > 0
    
    if (!hasData) {
      return {
        text: "Ainda não há dados suficientes. Comece registrando suas movimentações.",
        type: 'neutral' as const
      }
    }

    if (currentData.saldo > 0 && currentData.entradas > currentData.saidas) {
      return {
        text: "Seu negócio está indo bem este mês 👍",
        type: 'positive' as const
      }
    }

    if (currentData.saidas > currentData.entradas) {
      return {
        text: "Atenção: você gastou mais do que ganhou este mês.",
        type: 'warning' as const
      }
    }

    if (growth.status === 'cresceu' && growth.percentage > 10) {
      return {
        text: "Parabéns! Seu faturamento cresceu em relação ao mês passado.",
        type: 'positive' as const
      }
    }

    if (growth.status === 'caiu' && growth.percentage > 10) {
      return {
        text: "Seu negócio teve uma queda este mês. Vamos melhorar!",
        type: 'warning' as const
      }
    }

    return {
      text: "Continue registrando suas movimentações para acompanhar seu negócio.",
      type: 'neutral' as const
    }
  }

  const smartMessage = getSmartMessage()

  // Próximo passo recomendado
  const getNextStep = () => {
    if (!isClient) return "Carregando..."
    if (transactions.length === 0) return "Registre sua primeira entrada de dinheiro"
    if (goals.length === 0) return "Crie sua primeira meta para o negócio"
    if (tasks.length === 0) return "Adicione uma tarefa para organizar seu dia"
    if (employees.length === 0) return "Cadastre sua equipe para controlar custos"
    return "Continue acompanhando seu negócio diariamente"
  }

  // Alertas visuais
  const getAlerts = () => {
    if (!isClient) return []
    
    const alerts = []
    
    // Meta próxima do prazo
    const goalsNearDeadline = goals.filter(g => {
      if (!g.deadline) return false
      const daysUntil = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 7 && daysUntil > 0 && g.progress < 100
    })
    if (goalsNearDeadline.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${goalsNearDeadline.length} meta(s) próxima(s) do prazo`
      })
    }

    // Tarefa vencida
    const overdueTasks = tasks.filter(t => {
      if (!t.deadline || t.completed) return false
      return new Date(t.deadline) < new Date()
    })
    if (overdueTasks.length > 0) {
      alerts.push({
        type: 'danger',
        message: `${overdueTasks.length} tarefa(s) vencida(s)`
      })
    }

    // Funcionário sem meta (plano Pro)
    if (user?.subscriptionPlan === 'pro') {
      const employeesWithoutGoal = employees.filter(e => e.status === 'ativo' && !e.assignedGoal)
      if (employeesWithoutGoal.length > 0) {
        alerts.push({
          type: 'info',
          message: `${employeesWithoutGoal.length} funcionário(s) sem meta atribuída`
        })
      }
    }

    // Gasto alto em relação ao faturamento
    if (currentData.entradas > 0) {
      const gastoPercentage = (currentData.saidas / currentData.entradas) * 100
      if (gastoPercentage > 70) {
        alerts.push({
          type: 'warning',
          message: `Seus gastos representam ${gastoPercentage.toFixed(0)}% do faturamento`
        })
      }
    }

    return alerts
  }

  const alerts = getAlerts()

  // Não renderizar até que esteja no cliente para evitar hidratação
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando GestorPro...</p>
        </div>
      </div>
    )
  }

  // Tela de boas-vindas com autenticação
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Bem-vindo ao GestorPro
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vamos começar! Conte um pouco sobre você e seu negócio.
            </p>
          </div>

          {!showVerification ? (
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seu nome *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Seletor de método de autenticação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Como deseja se cadastrar? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      authMethod === 'email'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">E-mail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      authMethod === 'phone'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">Telefone</span>
                  </button>
                </div>
              </div>

              {authMethod === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seu email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seu telefone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do seu negócio (opcional)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Loja do João, Maria Costura..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria do negócio *
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                >
                  <option value="comercio">Comércio</option>
                  <option value="servicos">Serviços</option>
                  <option value="alimentacao">Alimentação</option>
                  <option value="negocio_local">Negócio local</option>
                  <option value="online">Online</option>
                  <option value="autonomo">Autônomo</option>
                  <option value="industria_leve">Indústria leve</option>
                  <option value="profissional_liberal">Profissional liberal</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Mensagem de feedback */}
              {authMessage && (
                <div className={`p-3 rounded-xl text-sm ${
                  authMessage.includes('sucesso') || authMessage.includes('Enviamos')
                    ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                }`}>
                  {authMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Começar a usar'}
              </button>

              {/* Divisor */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">ou</span>
                </div>
              </div>

              {/* Botão Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>
            </form>
          ) : (
            // Tela de verificação de código
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                  {authMethod === 'email' ? (
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Confirme seu {authMethod === 'email' ? 'e-mail' : 'telefone'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Digite o código de 6 dígitos que enviamos para<br />
                  <span className="font-medium">{authMethod === 'email' ? email : phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de verificação
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {authMessage && (
                <div className={`p-3 rounded-xl text-sm ${
                  authMessage.includes('sucesso')
                    ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                }`}>
                  {authMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Confirmar código'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVerification(false)
                  setVerificationCode('')
                  setAuthMessage('')
                }}
                disabled={isLoading}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium py-2 transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Renderizar conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'resumo':
        return (
          <div className="space-y-6">
            {/* Checklist de onboarding */}
            {onboardingCompletion < 100 && (
              <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-300 dark:border-blue-700 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    Complete seu perfil
                  </h3>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {onboardingCompletion.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${onboardingCompletion}%` }}
                  />
                </div>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${onboardingProgress.profileComplete ? 'text-blue-900 dark:text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingProgress.profileComplete ? 'bg-blue-600' : 'bg-blue-300 dark:bg-blue-800'}`}>
                      {onboardingProgress.profileComplete && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm">Complete o seu cadastro</span>
                  </div>
                  <div className={`flex items-center gap-2 ${onboardingProgress.emailVerified ? 'text-blue-900 dark:text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingProgress.emailVerified ? 'bg-blue-600' : 'bg-blue-300 dark:bg-blue-800'}`}>
                      {onboardingProgress.emailVerified && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm">Confirme o seu e-mail</span>
                  </div>
                  <div className={`flex items-center gap-2 ${onboardingProgress.phoneAdded ? 'text-blue-900 dark:text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingProgress.phoneAdded ? 'bg-blue-600' : 'bg-blue-300 dark:bg-blue-800'}`}>
                      {onboardingProgress.phoneAdded && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm">Adicione um número de telefone</span>
                  </div>
                  <div className={`flex items-center gap-2 ${onboardingProgress.firstEntry ? 'text-blue-900 dark:text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingProgress.firstEntry ? 'bg-blue-600' : 'bg-blue-300 dark:bg-blue-800'}`}>
                      {onboardingProgress.firstEntry && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm">Adicione sua primeira entrada financeira</span>
                  </div>
                  <div className={`flex items-center gap-2 ${onboardingProgress.firstEmployee ? 'text-blue-900 dark:text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingProgress.firstEmployee ? 'bg-blue-600' : 'bg-blue-300 dark:bg-blue-800'}`}>
                      {onboardingProgress.firstEmployee && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm">Adicione o seu primeiro funcionário</span>
                  </div>
                </div>
              </div>
            )}

            {/* Alertas */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                      alert.type === 'danger'
                        ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
                        : alert.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700'
                        : 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700'
                    }`}
                  >
                    <AlertCircle className={`w-5 h-5 ${
                      alert.type === 'danger'
                        ? 'text-red-600 dark:text-red-400'
                        : alert.type === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      alert.type === 'danger'
                        ? 'text-red-900 dark:text-red-100'
                        : alert.type === 'warning'
                        ? 'text-amber-900 dark:text-amber-100'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Próximo passo recomendado */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
              <p className="text-blue-100 text-sm mb-2">Próximo passo recomendado</p>
              <p className="text-xl font-bold">{getNextStep()}</p>
            </div>

            {/* Mensagem inteligente */}
            <div className={`p-6 rounded-2xl border-2 ${
              smartMessage.type === 'positive' 
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700' 
                : smartMessage.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700'
                : 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700'
            }`}>
              <p className={`text-lg font-semibold ${
                smartMessage.type === 'positive' 
                  ? 'text-emerald-900 dark:text-emerald-100' 
                  : smartMessage.type === 'warning'
                  ? 'text-amber-900 dark:text-amber-100'
                  : 'text-blue-900 dark:text-blue-100'
              }`}>
                {smartMessage.text}
              </p>
            </div>

            {/* Comparativo mês atual vs anterior */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Comparativo mensal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Faturamento</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      R$ {currentData.entradas.toFixed(2)}
                    </p>
                    {growth.status === 'cresceu' && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ArrowUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{growth.percentage.toFixed(0)}%</span>
                      </div>
                    )}
                    {growth.status === 'caiu' && (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <ArrowDown className="w-4 h-4" />
                        <span className="text-sm font-semibold">{growth.percentage.toFixed(0)}%</span>
                      </div>
                    )}
                    {growth.status === 'manteve' && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <MinusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">0%</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mês anterior: R$ {previousData.entradas.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Saldo</p>
                  <p className={`text-2xl font-bold ${
                    currentData.saldo >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    R$ {currentData.saldo.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mês anterior: R$ {previousData.saldo.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumo mensal */}
            <MonthlySummary
              currentMonth={currentData}
              previousMonth={previousData}
              growth={growth}
            />

            {/* Gráfico comparativo */}
            <SimpleChart currentMonth={currentData} previousMonth={previousData} />
          </div>
        )

      case 'financeiro':
        return <FinanceiroExpanded transactions={transactions} onTransactionsChanged={refreshData} />

      case 'tarefas':
        return (
          <TasksExpanded
            tasks={tasks}
            goals={goals}
            onTasksChanged={refreshData}
            onGoalsChanged={refreshData}
            userPlan={user?.subscriptionPlan || 'gratuito'}
          />
        )

      case 'pessoas':
        return (
          <PessoasTab
            employees={employees}
            onEmployeesChanged={refreshData}
            userPlan={user?.subscriptionPlan || 'gratuito'}
          />
        )

      case 'conta':
        return (
          <div className="space-y-6">
            {/* Card de perfil */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <UserCircle className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-blue-100">{user?.email}</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Plano atual</p>
                    <p className="text-xl font-bold">
                      {user?.subscriptionPlan === 'pro' ? 'Pro' : user?.subscriptionPlan === 'premium' ? 'Premium' : 'Gratuito'}
                    </p>
                  </div>
                  {(user?.subscriptionPlan === 'premium' || user?.subscriptionPlan === 'pro') && (
                    <Crown className="w-8 h-8 text-amber-300" />
                  )}
                </div>
                {(user?.subscriptionPlan === 'premium' || user?.subscriptionPlan === 'pro') && (
                  <button
                    onClick={() => {
                      const checkoutUrl = user?.subscriptionPlan === 'pro' 
                        ? 'https://pay.kiwify.com.br/HKPsk6i'
                        : 'https://pay.kiwify.com.br/x8jJu53'
                      window.open(checkoutUrl, '_blank')
                    }}
                    className="mt-3 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2 rounded-lg transition-colors text-sm"
                  >
                    Gerenciar assinatura
                  </button>
                )}
              </div>
            </div>

            {/* Formulário de dados */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Seus dados
              </h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do negócio
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ex: Loja do João"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria do negócio
                  </label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="comercio">Comércio</option>
                    <option value="servicos">Serviços</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="negocio_local">Negócio local</option>
                    <option value="online">Online</option>
                    <option value="autonomo">Autônomo</option>
                    <option value="industria_leve">Indústria leve</option>
                    <option value="profissional_liberal">Profissional liberal</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    O que você vende?
                  </label>
                  <input
                    type="text"
                    value={whatYouSell}
                    onChange={(e) => setWhatYouSell(e.target.value)}
                    placeholder="Ex: Roupas, Serviços de limpeza, Comida..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Salvar alterações
                </button>
              </form>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Dashboard principal com navegação
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo GestorPro */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/13e91ceb-9533-417b-aab6-22ca7782d03a.png" 
                  alt="Logo GestorPro" 
                  className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    GestorPro
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getMonthName(currentMonth)}
                  </p>
                </div>
              </div>
            </div>
            {/* Botão Fazer Upgrade - abre modal de planos */}
            <button
              onClick={() => setShowPlansModal(true)}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
            >
              Fazer Upgrade
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Planos */}
      <PlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        currentPlan={user?.subscriptionPlan || 'gratuito'}
      />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Navegação inferior estilo Instagram */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'resumo'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-xs font-medium">Resumo</span>
            </button>

            <button
              onClick={() => setActiveTab('financeiro')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'financeiro'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-xs font-medium">Financeiro</span>
            </button>

            <button
              onClick={() => setActiveTab('tarefas')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'tarefas'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <CheckSquare className="w-6 h-6" />
              <span className="text-xs font-medium">Tarefas</span>
            </button>

            <button
              onClick={() => setActiveTab('pessoas')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'pessoas'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">Pessoas</span>
            </button>

            <button
              onClick={() => setActiveTab('conta')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'conta'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <UserCircle className="w-6 h-6" />
              <span className="text-xs font-medium">Conta</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
