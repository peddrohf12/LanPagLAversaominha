# 💳 Guia de Integração com Gateways de Pagamento

## 🎯 Mercado Pago (Recomendado para Brasil)

### Passo 1: Criar Conta

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma conta de desenvolvedor
3. Vá em **Suas integrações** → **Criar aplicação**
4. Copie suas credenciais:
   - **Public Key** (para frontend)
   - **Access Token** (para backend)

### Passo 2: Instalar SDK

```bash
pnpm add mercadopago
```

### Passo 3: Implementar no Backend

Crie um arquivo `api/create-payment.js` (você precisará de um backend):

```javascript
import mercadopago from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
})

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key no backend
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email, amount } = req.body

  try {
    // Criar pagamento PIX no Mercado Pago
    const payment = await mercadopago.payment.create({
      transaction_amount: amount,
      description: 'Acesso Vitalício - Percepção Social',
      payment_method_id: 'pix',
      payer: {
        email: email,
        first_name: 'Cliente',
        last_name: 'Percepção Social'
      },
      notification_url: `${process.env.BASE_URL}/api/webhook/mercadopago`,
      metadata: {
        user_id: userId
      }
    })

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('user_payments')
      .insert([{
        user_id: userId,
        email: email,
        payment_status: 'pending',
        payment_method: 'pix',
        payment_id: payment.body.id.toString(),
        amount: amount,
        currency: 'BRL',
        access_granted: false,
        metadata: {
          mercadopago_payment_id: payment.body.id,
          qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
          qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64
        }
      }])
      .select()
      .single()

    if (error) throw error

    // Retornar dados do PIX
    res.status(200).json({
      success: true,
      payment_id: payment.body.id,
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
      ticket_url: payment.body.point_of_interaction.transaction_data.ticket_url
    })

  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    res.status(500).json({ error: 'Erro ao processar pagamento' })
  }
}
```

### Passo 4: Webhook para Receber Notificações

Crie `api/webhook/mercadopago.js`:

```javascript
import mercadopago from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data } = req.body

    // Mercado Pago envia notificações de diferentes tipos
    if (type === 'payment') {
      const paymentId = data.id

      // Buscar informações do pagamento
      const payment = await mercadopago.payment.get(paymentId)
      const status = payment.body.status

      console.log(`Pagamento ${paymentId} - Status: ${status}`)

      // Se pagamento aprovado, liberar acesso
      if (status === 'approved') {
        const { error } = await supabase
          .from('user_payments')
          .update({
            payment_status: 'approved',
            access_granted: true,
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', paymentId.toString())

        if (error) {
          console.error('Erro ao atualizar pagamento:', error)
        } else {
          console.log(`✅ Acesso liberado para pagamento ${paymentId}`)
        }
      }

      // Se pagamento rejeitado ou cancelado
      if (status === 'rejected' || status === 'cancelled') {
        await supabase
          .from('user_payments')
          .update({
            payment_status: status,
            access_granted: false
          })
          .eq('payment_id', paymentId.toString())
      }
    }

    res.status(200).json({ success: true })

  } catch (error) {
    console.error('Erro no webhook:', error)
    res.status(500).json({ error: 'Erro ao processar webhook' })
  }
}
```

### Passo 5: Atualizar Frontend

Em `src/PaymentPage.jsx`, substitua a função `handlePixPayment`:

```javascript
const handlePixPayment = async () => {
  setLoading(true)
  setError('')

  try {
    // Chamar API do backend
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        amount: 17.50
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar pagamento')
    }

    // Mostrar QR Code
    setPixCode(data.qr_code)
    setPixQrCodeBase64(data.qr_code_base64)
    setShowPixCode(true)

    // Iniciar polling para verificar status do pagamento
    startPaymentStatusPolling(data.payment_id)

  } catch (err) {
    console.error('Erro ao processar pagamento:', err)
    setError('Erro ao gerar código PIX. Tente novamente.')
  } finally {
    setLoading(false)
  }
}

// Função para verificar status do pagamento a cada 5 segundos
const startPaymentStatusPolling = (paymentId) => {
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('user_payments')
      .select('payment_status, access_granted')
      .eq('payment_id', paymentId)
      .single()

    if (data?.payment_status === 'approved' && data?.access_granted) {
      clearInterval(interval)
      onSuccess() // Redirecionar para área de membros
    }
  }, 5000) // Verificar a cada 5 segundos

  // Parar após 10 minutos
  setTimeout(() => clearInterval(interval), 600000)
}
```

### Passo 6: Variáveis de Ambiente

Adicione no `.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (não expor no frontend)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxx
BASE_URL=https://seu-site.com
```

---

## 🔵 Stripe (Alternativa Internacional)

### Passo 1: Criar Conta

1. Acesse: https://stripe.com
2. Crie uma conta
3. Copie suas chaves em **Developers** → **API keys**

### Passo 2: Instalar SDK

```bash
pnpm add stripe @stripe/stripe-js
```

### Passo 3: Criar Checkout Session (Backend)

```javascript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  const { userId, email } = req.body

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Acesso Vitalício - Percepção Social',
          },
          unit_amount: 1750, // R$ 17,50 em centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
      customer_email: email,
      metadata: {
        user_id: userId
      }
    })

    res.status(200).json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

### Passo 4: Frontend com Stripe

```javascript
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY)

const handleStripePayment = async () => {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, email: user.email })
  })

  const { sessionId } = await response.json()
  const stripe = await stripePromise
  
  await stripe.redirectToCheckout({ sessionId })
}
```

---

## 🟢 PagSeguro

### Instalação

```bash
pnpm add pagseguro-nodejs-sdk
```

### Exemplo Básico

```javascript
import PagSeguro from 'pagseguro-nodejs-sdk'

const pagSeguro = new PagSeguro({
  email: process.env.PAGSEGURO_EMAIL,
  token: process.env.PAGSEGURO_TOKEN,
  mode: 'sandbox' // ou 'production'
})

const payment = await pagSeguro.payment.create({
  method: 'pix',
  amount: 17.50,
  description: 'Acesso Vitalício',
  reference: userId,
  sender: {
    email: email,
    name: 'Cliente'
  }
})
```

---

## 📊 Comparação de Gateways

| Gateway | PIX | Cartão | Boleto | Taxa | Tempo Integração |
|---------|-----|--------|--------|------|------------------|
| **Mercado Pago** | ✅ | ✅ | ✅ | 4,99% | Médio |
| **Stripe** | ✅ | ✅ | ❌ | 3,99% + R$0,39 | Fácil |
| **PagSeguro** | ✅ | ✅ | ✅ | 4,99% | Médio |

---

## 🔐 Segurança

### Checklist

- [ ] **Nunca** exponha `access_token` ou `secret_key` no frontend
- [ ] Use variáveis de ambiente
- [ ] Valide webhooks com assinatura
- [ ] Use HTTPS em produção
- [ ] Implemente rate limiting
- [ ] Registre logs de transações

### Validar Webhook do Mercado Pago

```javascript
import crypto from 'crypto'

function validateWebhook(req) {
  const xSignature = req.headers['x-signature']
  const xRequestId = req.headers['x-request-id']
  
  const parts = xSignature.split(',')
  const ts = parts[0].split('=')[1]
  const hash = parts[1].split('=')[1]
  
  const manifest = `id:${req.body.data.id};request-id:${xRequestId};ts:${ts};`
  const hmac = crypto.createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET)
  hmac.update(manifest)
  const sha = hmac.digest('hex')
  
  return sha === hash
}
```

---

## 🧪 Modo de Teste

### Mercado Pago - Cartões de Teste

```
VISA Aprovado:     4509 9535 6623 3704
Mastercard Negado: 5031 4332 1540 6351
CVV: 123
Validade: Qualquer data futura
```

### Stripe - Cartões de Teste

```
Aprovado:  4242 4242 4242 4242
Negado:    4000 0000 0000 0002
CVV: Qualquer 3 dígitos
Validade: Qualquer data futura
```

---

## 📞 Suporte dos Gateways

- **Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Stripe**: https://support.stripe.com
- **PagSeguro**: https://dev.pagseguro.uol.com.br/

---

**Próximo passo**: Escolha um gateway e siga o guia de integração acima!
