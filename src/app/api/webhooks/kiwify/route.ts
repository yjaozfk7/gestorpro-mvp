import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Cliente Supabase com service role para operações administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Tipos do webhook Kiwify
interface KiwifyWebhookPayload {
  order_id: string
  order_status: string // 'paid', 'pending', 'refused', 'refunded', 'cancelled'
  product_id: string
  product_name: string
  customer: {
    email: string
    name: string
  }
  payment: {
    status: string
    method: string
    amount: number
  }
  signature?: string
}

// Mapeamento de produtos Kiwify para planos
const PRODUCT_TO_PLAN_MAP: Record<string, 'free' | 'premium' | 'pro'> = {
  // Adicione aqui os IDs dos produtos da Kiwify
  // Exemplo:
  // 'prod_premium_123': 'premium',
  // 'prod_pro_456': 'pro',
}

// Mapeamento de nomes de produtos (fallback se ID não estiver mapeado)
const PRODUCT_NAME_TO_PLAN: Record<string, 'free' | 'premium' | 'pro'> = {
  'premium': 'premium',
  'pro': 'pro',
  'gestorpro premium': 'premium',
  'gestorpro pro': 'pro',
  'plano premium': 'premium',
  'plano pro': 'pro',
}

/**
 * Valida a assinatura do webhook da Kiwify
 * A Kiwify envia um hash HMAC-SHA256 no header X-Kiwify-Signature
 */
function validateWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET
  
  if (!secret) {
    console.warn('⚠️ KIWIFY_WEBHOOK_SECRET não configurado - validação de assinatura desabilitada')
    return true // Em desenvolvimento, permite sem validação
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('❌ Erro ao validar assinatura:', error)
    return false
  }
}

/**
 * Determina o plano baseado no produto comprado
 */
function getPlanFromProduct(productId: string, productName: string): 'free' | 'premium' | 'pro' | null {
  // Tenta mapear pelo ID do produto
  if (PRODUCT_TO_PLAN_MAP[productId]) {
    return PRODUCT_TO_PLAN_MAP[productId]
  }

  // Tenta mapear pelo nome do produto (case-insensitive)
  const normalizedName = productName.toLowerCase().trim()
  for (const [key, plan] of Object.entries(PRODUCT_NAME_TO_PLAN)) {
    if (normalizedName.includes(key)) {
      return plan
    }
  }

  return null
}

/**
 * Atualiza o plano do usuário no Supabase
 */
async function updateUserPlan(email: string, plan: 'free' | 'premium' | 'pro'): Promise<boolean> {
  try {
    // Busca o usuário pelo email no auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários:', authError)
      return false
    }

    const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      console.error('❌ Usuário não encontrado:', email)
      return false
    }

    // Atualiza o plano no perfil do usuário
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        subscription_plan: plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar plano:', updateError)
      return false
    }

    console.log(`✅ Plano atualizado: ${email} → ${plan}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao atualizar plano do usuário:', error)
    return false
  }
}

/**
 * Endpoint POST para receber webhooks da Kiwify
 */
export async function POST(request: NextRequest) {
  try {
    // Lê o corpo da requisição
    const rawBody = await request.text()
    const payload: KiwifyWebhookPayload = JSON.parse(rawBody)

    // Valida a assinatura do webhook
    const signature = request.headers.get('x-kiwify-signature') || ''
    if (!validateWebhookSignature(rawBody, signature)) {
      console.error('❌ Assinatura inválida do webhook')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log('📦 Webhook recebido:', {
      order_id: payload.order_id,
      status: payload.order_status,
      product: payload.product_name,
      customer: payload.customer.email
    })

    // Processa apenas pagamentos aprovados
    if (payload.order_status !== 'paid' && payload.payment?.status !== 'paid') {
      console.log(`⏭️ Ignorando status: ${payload.order_status}`)
      return NextResponse.json({ 
        message: 'Status não processado',
        status: payload.order_status 
      })
    }

    // Determina o plano baseado no produto
    const plan = getPlanFromProduct(payload.product_id, payload.product_name)
    
    if (!plan) {
      console.error('❌ Produto não mapeado:', {
        product_id: payload.product_id,
        product_name: payload.product_name
      })
      return NextResponse.json(
        { error: 'Produto não reconhecido' },
        { status: 400 }
      )
    }

    // Atualiza o plano do usuário
    const success = await updateUserPlan(payload.customer.email, plan)

    if (!success) {
      return NextResponse.json(
        { error: 'Falha ao atualizar plano' },
        { status: 500 }
      )
    }

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      email: payload.customer.email,
      plan: plan
    })

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint GET para verificar se o webhook está ativo
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/kiwify',
    message: 'Webhook Kiwify está ativo e pronto para receber eventos'
  })
}
