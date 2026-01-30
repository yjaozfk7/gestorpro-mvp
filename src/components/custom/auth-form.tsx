'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#2563eb',
                brandAccent: '#1d4ed8',
              },
            },
          },
        }}
        providers={['google']}
        redirectTo={`${window.location.origin}/auth/callback`}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Senha',
              button_label: 'Entrar',
              loading_button_label: 'Entrando...',
              social_provider_text: 'Entrar com {{provider}}',
              link_text: 'Já tem uma conta? Entre',
            },
            sign_up: {
              email_label: 'Email',
              password_label: 'Senha',
              button_label: 'Criar conta',
              loading_button_label: 'Criando conta...',
              social_provider_text: 'Cadastrar com {{provider}}',
              link_text: 'Não tem uma conta? Cadastre-se',
            },
          },
        }}
      />
    </div>
  )
}
