import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req ) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, amount, userId } = await req.json()
    const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: Number(amount ),
        description: 'Acesso Vitalicio - Percepcao Social',
        payment_method_id: 'pix',
        payer: { email: email },
        metadata: { user_id: userId }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Erro MP' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // RETORNA EXATAMENTE O QUE O FRONTEND PRECISA
   return new Response(
  JSON.stringify({
    id: data.id,
    qr_code: data.point_of_interaction.transaction_data.qr_code
  }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
)

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
