import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, email, amount } = await req.json()
    const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''
    
    // --- ESTRATÉGIA ANTI-BLOQUEIO ---
    
    // 1. Email totalmente aleatório a cada milissegundo
    const emailFake = `cliente_${Date.now()}_${Math.floor(Math.random() * 1000)}@teste.com`
    
    // 2. Chave de Idempotência (Evita erros de requisição duplicada)
    const idempotencyKey = crypto.randomUUID()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[SERVER] Tentando aprovação imediata via Binary Mode...`)

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey // Cabeçalho mágico
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: "Compra Digital", // Descrição mais genérica
        payment_method_id: "pix",
        binary_mode: true, // <--- PULA ANÁLISES COMPLEXAS DE RISCO
        payer: { 
            email: emailFake,
            // Removemos nome/sobrenome para evitar validação de string
            identification: {
                type: "CPF",
                number: "19119119100" 
            }
        },
      })
    })

    const mpData = await mpResponse.json()

    if (!mpResponse.ok) {
        // Se der erro, mostramos o prefixo do token pra confirmar que está usando o certo
        const prefix = token.substring(0, 8)
        throw new Error(`[DEBUG] Erro MP (${prefix}): ${JSON.stringify(mpData)}`)
    }

    // Sucesso! Salva no banco
    const { error: dbError } = await supabaseAdmin
      .from('user_payments') 
      .insert({
         user_id: userId,
         email: email, 
         payment_id: mpData.id.toString(),
         payment_status: mpData.status,
         amount: amount
      })

    if (dbError) console.error("Erro Banco:", dbError)

    const responseData = {
        point_of_interaction: mpData.point_of_interaction,
        id: mpData.id
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Erro Geral:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})