'use client'

import { useState } from 'react'
import { Users, UserPlus } from 'lucide-react'
import { EmployeeManagement } from './employee-management'
import { ClientsManagement } from './clients-management'
import type { Employee } from '@/lib/types'

interface PessoasTabProps {
  employees: Employee[]
  onEmployeesChanged: () => void
  userPlan: 'gratuito' | 'premium' | 'pro'
}

type SubTab = 'equipe' | 'clientes'

export function PessoasTab({ employees, onEmployeesChanged, userPlan }: PessoasTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('equipe')

  // Plano Free não tem acesso a Clientes
  const hasClientsAccess = userPlan === 'premium' || userPlan === 'pro'

  return (
    <div className="space-y-6">
      {/* Sub-navegação */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 inline-flex gap-2">
        <button
          onClick={() => setActiveSubTab('equipe')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeSubTab === 'equipe'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Equipe</span>
        </button>

        {hasClientsAccess && (
          <button
            onClick={() => setActiveSubTab('clientes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSubTab === 'clientes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Clientes</span>
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {activeSubTab === 'equipe' ? (
        <EmployeeManagement
          employees={employees}
          onEmployeesChanged={onEmployeesChanged}
          userPlan={userPlan}
        />
      ) : (
        <ClientsManagement userPlan={userPlan} />
      )}

      {/* Mensagem para usuários Free */}
      {!hasClientsAccess && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                Gerencie seus Clientes
              </h3>
              <p className="text-amber-800 dark:text-amber-200 mb-4">
                Controle receitas, custos e lucros de cada cliente. Disponível nos planos Premium e Pro.
              </p>
              <button
                onClick={() => {
                  // Abrir modal de planos (implementar)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
              >
                Fazer Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
