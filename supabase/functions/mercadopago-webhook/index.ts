import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // 1. Verificar se é uma notificação de pagamento
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    // O Mercado Pago manda o ID no corpo (body) ou na URL. Vamos tentar pegar do body se não vier na URL.
    let paymentId = id
    if (!paymentId && req.body) {
      const body = await req.json()
      paymentId = body?.data?.id || body?.id
    }

    if (!paymentId) {
      return new Response('Ok', { status: 200 }) // Responde 200 pro MP parar de mandar se não for pagamento
    }

    console.log(`🔔 Webhook recebido para pagamento ID: ${paymentId}`)

    // 2. Consultar a API do Mercado Pago para confirmar o status (Segurança)
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`
      }
    })

    if (!mpResponse.ok) {
      throw new Error('Erro ao consultar o Mercado Pago')
    }

    const paymentData = await mpResponse.json()
    console.log(`Status do pagamento ${paymentId}: ${paymentData.status}`)

    // 3. Se estiver aprovado, libera o acesso no Banco de Dados
    if (paymentData.status === 'approved') {
      
      // Criamos um cliente Supabase com a CHAVE DE SERVIÇO (Service Role)
      // Isso permite alterar o banco sem o usuário estar logado
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Atualiza a tabela user_payments
      const { error } = await supabaseAdmin
        .from('user_payments')
        .update({ 
          payment_status: 'approved',
          access_granted: true,
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', String(paymentId)) // Importante: converte para string para garantir

      if (error) {
        console.error('Erro ao atualizar banco:', error)
        throw error
      }
      
      console.log('✅ Acesso liberado no banco de dados!')
    }

    return new Response(JSON.stringify({ message: 'Webhook processado' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Erro no Webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})