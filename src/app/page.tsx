'use client'

import { useEffect, useState } from 'react'
import { Transaction, Task, User, Employee, Goal, SubscriptionPlan } from '@/lib/types'
import { getTransactions, getTasks, getUser, saveUser } from '@/lib/storage'
import { getEmployees } from '@/lib/employee-storage'
import { getGoals } from '@/lib/goals-storage'
import { getOnboardingProgress, updateOnboardingProgress, getOnboardingCompletion } from '@/lib/onboarding-storage'
import { 
  calculateMonthlyData, 
  getCurrentMonth, 
  getPreviousMonth, 
  getGrowthComparison,
  getMonthName 
} from '@/lib/calculations'
import { MonthlySummary } from '@/components/custom/monthly-summary'
import { SimpleChart } from '@/components/custom/simple-chart'
import { EmployeeManagement } from '@/components/custom/employee-management'
import { TasksExpanded } from '@/components/custom/tasks-expanded'
import { FinanceiroExpanded } from '@/components/custom/financeiro-expanded'
import { PlansModal } from '@/components/custom/plans-modal'
import { TrendingUp, LayoutDashboard, DollarSign, CheckSquare, Users, UserCircle, Crown, AlertCircle, ArrowUp, ArrowDown, Minus as MinusIcon, Phone } from 'lucide-react'

type TabType = 'resumo' | 'financeiro' | 'tarefas' | 'equipe' | 'conta'

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
  
  // Estado para controlar hidratação
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marcar que estamos no cliente para evitar problemas de hidratação
    setIsClient(true)
    
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

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !email.trim()) return

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

  // Tela de boas-vindas
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
              />
            </div>

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
              />
            </div>

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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Começar a usar
            </button>
          </form>
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

      case 'equipe':
        return (
          <EmployeeManagement
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
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 40 40" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <rect width="40" height="40" rx="10" fill="url(#gradient)" />
                  <path 
                    d="M12 20L18 26L28 14" 
                    stroke="white" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2563EB" />
                      <stop offset="1" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>
                </svg>
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
            {/* Botão Premium discreto - fixo em todas as abas */}
            <button
              onClick={() => setShowPlansModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors text-sm border border-amber-200 dark:border-amber-800"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Premium</span>
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
              onClick={() => setActiveTab('equipe')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'equipe'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">Equipe</span>
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