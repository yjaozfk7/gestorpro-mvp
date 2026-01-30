'use client'

import { useUserPlan, hasFeatureAccess } from '@/hooks/useUserPlan'
import { Lock } from 'lucide-react'
import { ReactNode } from 'react'

interface FeatureGateProps {
  requiredPlan: 'gratuito' | 'premium' | 'pro'
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente que bloqueia funcionalidades baseado no plano do usuário
 * Uso:
 * 
 * <FeatureGate requiredPlan="premium">
 *   <PremiumFeature />
 * </FeatureGate>
 */
export function FeatureGate({ requiredPlan, children, fallback }: FeatureGateProps) {
  const { plan, isLoading } = useUserPlan()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const hasAccess = hasFeatureAccess(plan, requiredPlan)

  if (!hasAccess) {
    return fallback || (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Funcionalidade {requiredPlan}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Esta funcionalidade está disponível apenas no plano {requiredPlan.toUpperCase()}.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Fazer upgrade
        </button>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Badge para mostrar o plano atual do usuário
 */
export function PlanBadge() {
  const { plan, isLoading } = useUserPlan()

  if (isLoading) return null

  const planColors = {
    gratuito: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    premium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    pro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${planColors[plan]}`}>
      {plan.toUpperCase()}
    </span>
  )
}
