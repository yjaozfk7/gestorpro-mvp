'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type UserPlan = 'gratuito' | 'premium' | 'pro'

interface UserPlanData {
  plan: UserPlan
  isLoading: boolean
  error: Error | null
  refreshPlan: () => Promise<void>
}

/**
 * Hook para gerenciar o plano do usuário em tempo real
 * Escuta mudanças no Supabase e atualiza automaticamente
 */
export function useUserPlan(): UserPlanData {
  const [plan, setPlan] = useState<UserPlan>('gratuito')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUserPlan = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtém o usuário atual
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) throw authError
      if (!user) {
        setPlan('gratuito')
        return
      }

      // Busca o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Mapeia o plano (subscription_plan pode ser 'gratuito', 'premium' ou 'pro')
      const userPlan = (profile?.subscription_plan || 'gratuito') as UserPlan
      setPlan(userPlan)

    } catch (err) {
      console.error('Erro ao buscar plano do usuário:', err)
      setError(err as Error)
      setPlan('gratuito') // Fallback para gratuito em caso de erro
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserPlan()

    // Escuta mudanças no perfil do usuário em tempo real
    const { data: { user } } = supabase.auth.getUser().then(result => result)

    user?.then(u => {
      if (!u) return

      const channel = supabase
        .channel('user-plan-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${u.id}`
          },
          (payload) => {
            console.log('🔄 Plano atualizado em tempo real:', payload.new)
            const newPlan = (payload.new as any).subscription_plan as UserPlan
            setPlan(newPlan)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [])

  return {
    plan,
    isLoading,
    error,
    refreshPlan: fetchUserPlan
  }
}

/**
 * Verifica se o usuário tem acesso a uma funcionalidade específica
 */
export function hasFeatureAccess(userPlan: UserPlan, requiredPlan: UserPlan): boolean {
  const planHierarchy: Record<UserPlan, number> = {
    'gratuito': 0,
    'premium': 1,
    'pro': 2
  }

  return planHierarchy[userPlan] >= planHierarchy[requiredPlan]
}
