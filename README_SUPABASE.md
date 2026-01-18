# 🚀 Setup Rápido - Supabase

## 📝 Passo a Passo (5 minutos)

### 1️⃣ Criar Projeto no Supabase

1. Acesse: https://supabase.com
2. Crie conta e novo projeto
3. Copie **Project URL** e **anon key** em Settings → API

### 2️⃣ Configurar Banco de Dados

1. Vá em **SQL Editor** no Supabase
2. Copie todo conteúdo de `supabase_setup.sql`
3. Cole e execute (Run)

### 3️⃣ Configurar Variáveis

Crie arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 4️⃣ Instalar e Rodar

```bash
pnpm install
pnpm dev
```

## ✅ Testar

1. Abra http://localhost:5173
2. Clique em "Área de Membros"
3. Crie uma conta
4. Na página de pagamento, clique em "Pagar com PIX"
5. Clique em "🧪 Simular Aprovação"
6. Pronto! Você está na área de membros

## 📚 Documentação Completa

Veja `INTEGRACAO_SUPABASE.md` para:
- Integração com gateway de pagamento real
- Deploy em produção
- Configuração de webhooks
- Troubleshooting

## ⚠️ Antes de Produção

- [ ] Remover botão de simulação de pagamento
- [ ] Integrar Mercado Pago / Stripe
- [ ] Configurar webhooks
- [ ] Ativar confirmação de e-mail

---

**Dúvidas?** Consulte `INTEGRACAO_SUPABASE.md`
