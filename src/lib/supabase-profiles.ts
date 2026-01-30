import { supabase } from './supabase'
import type { Profile } from './supabase-types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Erro ao buscar perfil:', error)
    return null
  }
  
  return data
}

export async function createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
