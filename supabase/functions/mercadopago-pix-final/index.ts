import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Configuração básica de CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Pegamos o token que já está salvo nas Secrets do Supabase
    const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''
    
    console.log("[CLOUD] Tentando criar usuário de teste via Supabase...")

    // Chamada para criar o usuário (Rodando nos servidores do Google/Supabase)
    const mpResponse = await fetch("https://api.mercadopago.com/users/test_user", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            site_id: "MLB"
        })
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
        throw new Error(`Erro MP: ${JSON.stringify(data)}`)
    }

    // Retorna o email gerado direto para a tela
    return new Response(JSON.stringify({ 
        msg: "SUCESSO! Copie o email abaixo:",
        email_gerado: data.email 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})