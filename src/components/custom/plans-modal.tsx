'use client'

import { Crown, X, Check } from 'lucide-react'

interface PlansModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: 'gratuito' | 'premium' | 'pro'
}

export function PlansModal({ isOpen, onClose, currentPlan }: PlansModalProps) {
  if (!isOpen) return null

  const handleSubscribe = (plan: 'premium' | 'pro') => {
    const checkoutUrls = {
      premium: 'https://pay.kiwify.com.br/x8jJu53',
      pro: 'https://pay.kiwify.com.br/HKPsk6i'
    }
    
    // Abrir checkout em nova aba
    window.open(checkoutUrls[plan], '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Escolha seu plano
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Desbloqueie todo o potencial do GestorPro
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Planos */}
        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Plano Gratuito */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Gratuito
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">R$ 0</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <span>Uso básico do app</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <span>Cadastro básico de funcionários</span>
              </li>
            </ul>

            {currentPlan === 'gratuito' ? (
              <button
                disabled
                className="w-full bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-3 rounded-xl cursor-not-allowed"
              >
                Plano atual
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-3 rounded-xl cursor-not-allowed"
              >
                Continuar no Gratuito
              </button>
            )}
          </div>

          {/* Plano Premium */}
          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-2xl border-2 border-blue-500 dark:border-blue-600 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Premium
                </h3>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">R$ 29,90</span>
                <span className="text-gray-600 dark:text-gray-400">/mês</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Financeiro completo</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Tarefas com calendário e metas gerais</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Equipe com custo mensal por funcionário</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Bonificações mensais configuráveis</span>
              </li>
            </ul>

            {currentPlan === 'premium' ? (
              <button
                disabled
                className="w-full bg-blue-300 dark:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 rounded-xl cursor-not-allowed"
              >
                Plano atual
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('premium')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Assinar Premium
              </button>
            )}
          </div>

          {/* Plano Pro */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 p-6 rounded-2xl border-2 border-purple-500 dark:border-purple-600">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Pro
                </h3>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">R$ 59,90</span>
                <span className="text-gray-600 dark:text-gray-400">/mês</span>
              </div>
            </div>
            
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 text-center">
              Tudo do Premium, mais:
            </p>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Metas por funcionário</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Receita gerada por funcionário</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Lucro estimado por funcionário</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Comparativos simples de desempenho</span>
              </li>
            </ul>

            {currentPlan === 'pro' ? (
              <button
                disabled
                className="w-full bg-purple-300 dark:bg-purple-700 text-purple-800 dark:text-purple-200 font-semibold py-3 rounded-xl cursor-not-allowed"
              >
                Plano atual
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('pro')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Assinar Pro
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            Pagamento seguro processado pela Kiwify. Cobrança recorrente mensal. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  )
}
