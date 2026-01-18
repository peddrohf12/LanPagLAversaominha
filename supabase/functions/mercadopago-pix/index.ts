import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, amount, userId } = await req.json()
    const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    if (!token) {
      throw new Error('Token do Mercado Pago não configurado no Supabase Secrets.')
    }

    console.log(`Iniciando pagamento para: ${email}, Valor: ${amount}`)

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID() // Boa prática para evitar duplicidade
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: 'Acesso Vitalicio - Percepcao Social',
        payment_method_id: 'pix',
        payer: { email: email },
        metadata: { user_id: userId }
      }),
    })

    const data = await response.json()

    // LOG DE DEPURAÇÃO: Isso vai aparecer nos logs do Supabase se der erro
    if (!response.ok) {
      console.error('Erro MP (Status):', response.status, data)
      return new Response(JSON.stringify({ error: data.message || 'Erro na API do Mercado Pago' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // VERIFICAÇÃO DE SEGURANÇA (AQUI ESTAVA O ERRO)
    // Usamos ?. (optional chaining) para não quebrar se vier vazio
    const qrCode = data.point_of_interaction?.transaction_data?.qr_code
    const ticketUrl = data.point_of_interaction?.transaction_data?.ticket_url // Link do PDF se precisar

    if (!qrCode) {
      console.error('Resposta MP incompleta:', JSON.stringify(data, null, 2))
      throw new Error('O Mercado Pago criou o pagamento, mas não retornou o QR Code.')
    }

    // SUCESSO
    return new Response(
      JSON.stringify({
        id: data.id,
        qr_code: qrCode,
        qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 // Opcional: imagem pronta
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Erro CRÍTICO na Function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})