'use client'

import { useUserPlan } from '@/hooks/useUserPlan'
import { FeatureGate, PlanBadge } from '@/components/FeatureGate'
import { Crown, Zap, Lock } from 'lucide-react'

/**
 * Exemplo de página que usa o sistema de planos
 * Demonstra como bloquear funcionalidades por plano
 */
export default function ExemploPlanos() {
  const { plan, isLoading, refreshPlan } = useUserPlan()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header com badge de plano */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sistema de Planos
          </h1>
          <div className="flex items-center gap-4">
            <PlanBadge />
            <button
              onClick={refreshPlan}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Atualizar Plano
            </button>
          </div>
        </div>

        {/* Grid de funcionalidades */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Funcionalidade Gratuita */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold">Funcionalidade Básica</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Disponível para todos os usuários
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                ✅ Você tem acesso a esta funcionalidade!
              </p>
            </div>
          </div>

          {/* Funcionalidade Premium */}
          <FeatureGate requiredPlan="premium">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-2 border-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Funcionalidade Premium</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Disponível para planos Premium e Pro
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                  ✅ Você tem acesso Premium!
                </p>
              </div>
            </div>
          </FeatureGate>

          {/* Funcionalidade Pro */}
          <FeatureGate requiredPlan="pro">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-2 border-purple-500">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Funcionalidade Pro</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Disponível apenas para plano Pro
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-purple-800 dark:text-purple-200">
                  ✅ Você tem acesso Pro completo!
                </p>
              </div>
            </div>
          </FeatureGate>
        </div>

        {/* Informações do plano atual */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Seu Plano Atual</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plano</p>
              <p className="text-2xl font-bold capitalize">{plan}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="text-2xl font-bold text-green-600">Ativo</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Atualização</p>
              <p className="text-sm">Automática via Kiwify</p>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Como funciona a atualização automática?
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>✅ Compre um plano na Kiwify usando o mesmo email cadastrado aqui</li>
            <li>✅ Após confirmação do pagamento, seu plano é atualizado automaticamente</li>
            <li>✅ Não precisa fazer nada - o sistema detecta e libera as funcionalidades</li>
            <li>✅ Se estiver logado, a atualização acontece em tempo real</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
