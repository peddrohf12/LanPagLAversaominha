# 🚀 Integração Supabase - Percepção Social

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Fluxo de Autenticação](#fluxo-de-autenticação)
6. [Sistema de Pagamento](#sistema-de-pagamento)
7. [Testando a Aplicação](#testando-a-aplicação)
8. [Integração com Gateway de Pagamento](#integração-com-gateway-de-pagamento)
9. [Deploy em Produção](#deploy-em-produção)

---

## 🎯 Visão Geral

Esta integração adiciona ao seu site:

✅ **Autenticação completa** (Login e Cadastro)  
✅ **Armazenamento seguro** de credenciais no Supabase  
✅ **Sistema de verificação de pagamento**  
✅ **Controle de acesso** à área de membros  
✅ **Página de pagamento** com PIX e cartão  
✅ **Área de membros protegida**

---

## 🔧 Configuração do Supabase

### Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Crie uma conta (pode usar GitHub)
4. Crie um novo projeto:
   - **Nome**: `percepcao-social` (ou o que preferir)
   - **Database Password**: Crie uma senha forte e **guarde-a**
   - **Region**: Escolha `South America (São Paulo)` para melhor performance no Brasil
   - Clique em **"Create new project"**

⏰ **Aguarde 2-3 minutos** enquanto o Supabase provisiona seu banco de dados.

### Passo 2: Obter Credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem) → **API**
2. Você verá duas informações importantes:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Copie estas informações** - você vai precisar delas!

### Passo 3: Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados)
2. Clique em **"New query"**
3. Abra o arquivo `supabase_setup.sql` que está na raiz do projeto
4. **Copie todo o conteúdo** do arquivo
5. **Cole no SQL Editor** do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Você deve ver a mensagem: **"Success. No rows returned"**

✅ Pronto! Seu banco de dados está configurado com:
- Tabela `user_payments` (pagamentos)
- Tabela `access_logs` (logs de acesso)
- Políticas de segurança (RLS)
- Funções auxiliares

---

## ⚙️ Configuração do Projeto

### Passo 1: Criar Arquivo .env

1. Na raiz do projeto, crie um arquivo chamado `.env`
2. Adicione as credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: Substitua pelos valores reais que você copiou do Supabase!

### Passo 2: Instalar Dependências

```bash
pnpm install
```

### Passo 3: Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O site estará disponível em: `http://localhost:5173`

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `user_payments`

Armazena informações sobre pagamentos dos usuários:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do pagamento |
| `user_id` | UUID | ID do usuário (referência a auth.users) |
| `email` | TEXT | E-mail do usuário |
| `payment_status` | TEXT | Status: `pending`, `approved`, `rejected`, `cancelled` |
| `payment_method` | TEXT | Método: `pix`, `credit_card`, `boleto` |
| `payment_id` | TEXT | ID do gateway de pagamento |
| `amount` | DECIMAL | Valor do pagamento (ex: 17.50) |
| `currency` | TEXT | Moeda (padrão: BRL) |
| `access_granted` | BOOLEAN | Se o acesso foi liberado |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |
| `metadata` | JSONB | Dados adicionais (JSON) |

### Tabela: `access_logs`

Registra acessos dos usuários (opcional, para auditoria):

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do log |
| `user_id` | UUID | ID do usuário |
| `email` | TEXT | E-mail do usuário |
| `action` | TEXT | Ação: `login`, `logout`, `access_granted`, `access_denied` |
| `ip_address` | TEXT | IP do usuário |
| `user_agent` | TEXT | Navegador/dispositivo |
| `created_at` | TIMESTAMP | Data do acesso |

---

## 🔐 Fluxo de Autenticação

### 1. Cadastro de Novo Usuário

```
Usuário preenche formulário
    ↓
Sistema cria conta no Supabase Auth
    ↓
E-mail de confirmação enviado (opcional)
    ↓
Usuário é redirecionado para página de pagamento
```

### 2. Login de Usuário Existente

```
Usuário faz login
    ↓
Sistema verifica credenciais no Supabase
    ↓
Sistema verifica se há pagamento aprovado
    ↓
Se SIM: Acesso à área de membros
Se NÃO: Redireciona para página de pagamento
```

### 3. Verificação de Acesso

A função `checkPaidAccess()` verifica se o usuário tem acesso:

```javascript
const hasAccess = await checkPaidAccess()
// Retorna true se payment_status = 'approved' E access_granted = true
```

---

## 💳 Sistema de Pagamento

### Fluxo de Pagamento Atual (Simulado)

```
1. Usuário escolhe método de pagamento (PIX)
2. Sistema gera código PIX
3. Registro criado na tabela user_payments com status 'pending'
4. Usuário copia código PIX
5. [SIMULAÇÃO] Usuário clica em "Simular Aprovação"
6. Status atualizado para 'approved' e access_granted = true
7. Acesso liberado automaticamente
```

### Como Funciona o Código

**Arquivo**: `src/PaymentPage.jsx`

```javascript
// Criar registro de pagamento pendente
const { data, error } = await supabase
  .from('user_payments')
  .insert([{
    user_id: user.id,
    email: user.email,
    payment_status: 'pending',
    payment_method: 'pix',
    amount: 17.50,
    access_granted: false
  }])

// Aprovar pagamento (simulação)
const { error } = await supabase
  .from('user_payments')
  .update({
    payment_status: 'approved',
    access_granted: true
  })
  .eq('id', payment_id)
```

---

## 🧪 Testando a Aplicação

### Teste 1: Criar Conta

1. Acesse o site
2. Clique em **"Área de Membros"**
3. Vá para aba **"Criar Conta"**
4. Preencha:
   - Nome: `Teste Silva`
   - E-mail: `teste@exemplo.com`
   - Senha: `senha123`
5. Clique em **"Finalizar Cadastro"**
6. Você será redirecionado para a página de pagamento

### Teste 2: Simular Pagamento

1. Na página de pagamento, escolha **PIX**
2. Clique em **"Pagar R$ 17,50 com PIX"**
3. Um código PIX será gerado
4. Clique no botão **"🧪 Simular Aprovação (TESTE)"**
5. Você será redirecionado para a área de membros

### Teste 3: Verificar no Supabase

1. Vá para o painel do Supabase
2. Clique em **Table Editor** → **user_payments**
3. Você verá o registro do pagamento com:
   - `payment_status`: `approved`
   - `access_granted`: `true`

### Teste 4: Logout e Login

1. Na área de membros, clique em **"Sair"**
2. Faça login novamente com o mesmo e-mail e senha
3. Você deve ser levado direto para a área de membros (sem pedir pagamento)

---

## 🔌 Integração com Gateway de Pagamento

⚠️ **IMPORTANTE**: O código atual usa uma **simulação** de pagamento. Para produção, você precisa integrar com um gateway real.

### Opções de Gateway no Brasil

#### 1. **Mercado Pago** (Recomendado)
- ✅ PIX instantâneo
- ✅ Cartão de crédito
- ✅ Boleto
- 📚 [Documentação](https://www.mercadopago.com.br/developers/pt/docs)

**Instalação**:
```bash
pnpm add mercadopago
```

**Exemplo de integração**:
```javascript
import mercadopago from 'mercadopago'

mercadopago.configure({
  access_token: 'SEU_ACCESS_TOKEN'
})

// Criar pagamento PIX
const payment = await mercadopago.payment.create({
  transaction_amount: 17.50,
  description: 'Acesso Vitalício - Percepção Social',
  payment_method_id: 'pix',
  payer: {
    email: user.email
  }
})

// payment.point_of_interaction.transaction_data.qr_code
// payment.point_of_interaction.transaction_data.qr_code_base64
```

#### 2. **Stripe**
- ✅ Cartão de crédito internacional
- ✅ PIX (via Stripe Brasil)
- 📚 [Documentação](https://stripe.com/docs)

#### 3. **PagSeguro**
- ✅ PIX, Cartão, Boleto
- 📚 [Documentação](https://dev.pagseguro.uol.com.br/)

### Configurando Webhooks

Para receber notificações automáticas quando um pagamento é aprovado:

1. **No Gateway** (ex: Mercado Pago):
   - Configure a URL do webhook: `https://seu-site.com/api/webhook/payment`

2. **No seu Backend** (você precisará criar):
   - Crie um endpoint que recebe a notificação
   - Valide a assinatura do webhook
   - Atualize o status no Supabase:

```javascript
// Exemplo de endpoint webhook (Node.js/Express)
app.post('/api/webhook/payment', async (req, res) => {
  const { payment_id, status } = req.body
  
  if (status === 'approved') {
    await supabase
      .from('user_payments')
      .update({
        payment_status: 'approved',
        access_granted: true
      })
      .eq('payment_id', payment_id)
  }
  
  res.sendStatus(200)
})
```

---

## 🚀 Deploy em Produção

### Opção 1: Vercel (Recomendado)

1. Instale a CLI do Vercel:
```bash
pnpm add -g vercel
```

2. Faça deploy:
```bash
vercel
```

3. Configure as variáveis de ambiente no painel da Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Opção 2: Netlify

1. Crie uma conta em [netlify.com](https://netlify.com)
2. Conecte seu repositório GitHub
3. Configure:
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
4. Adicione as variáveis de ambiente

### Opção 3: Hospedagem Própria

1. Build do projeto:
```bash
pnpm build
```

2. Os arquivos estarão em `dist/`
3. Faça upload para seu servidor (Apache, Nginx, etc.)

---

## 📁 Estrutura de Arquivos Criados

```
LanPagLA/
├── src/
│   ├── App.jsx                 # ✅ Atualizado com roteamento
│   ├── AuthContext.jsx         # 🆕 Contexto de autenticação
│   ├── supabaseClient.js       # 🆕 Cliente Supabase
│   ├── MembersArea.jsx         # 🆕 Área de membros protegida
│   └── PaymentPage.jsx         # 🆕 Página de pagamento
├── .env                        # 🆕 Variáveis de ambiente (criar)
├── .env.example                # 🆕 Template de variáveis
├── supabase_setup.sql          # 🆕 Script SQL do banco
└── INTEGRACAO_SUPABASE.md      # 🆕 Esta documentação
```

---

## 🔒 Segurança

### Boas Práticas Implementadas

✅ **Row Level Security (RLS)** habilitado  
✅ **Políticas de acesso** por usuário  
✅ **Senhas criptografadas** pelo Supabase Auth  
✅ **Validação de e-mail** (opcional, pode ativar)  
✅ **Tokens JWT** para sessões  

### Checklist de Segurança para Produção

- [ ] Remover botão "Simular Aprovação" de `PaymentPage.jsx`
- [ ] Integrar gateway de pagamento real
- [ ] Configurar webhooks com validação de assinatura
- [ ] Ativar confirmação de e-mail no Supabase
- [ ] Adicionar rate limiting para login
- [ ] Configurar CORS adequadamente
- [ ] Usar HTTPS (obrigatório)
- [ ] Monitorar logs de acesso

---

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou corretamente as credenciais do Supabase
- Certifique-se de que o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento

### Erro: "relation 'user_payments' does not exist"
- Execute o script SQL `supabase_setup.sql` no SQL Editor do Supabase
- Verifique se o script foi executado sem erros

### Usuário não consegue fazer login
- Verifique se o e-mail foi confirmado (se ativou confirmação)
- Vá no Supabase → Authentication → Users para ver o status

### Pagamento não libera acesso
- Verifique no Supabase → Table Editor → user_payments
- Confirme que `payment_status` = `'approved'` e `access_granted` = `true`
- Faça logout e login novamente

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique a documentação do Supabase: [https://supabase.com/docs](https://supabase.com/docs)
2. Consulte os logs no console do navegador (F12)
3. Verifique os logs no painel do Supabase

---

## ✅ Próximos Passos

1. ✅ Configurar Supabase
2. ✅ Testar autenticação
3. ✅ Testar fluxo de pagamento simulado
4. 🔲 Integrar gateway de pagamento real
5. 🔲 Configurar webhooks
6. 🔲 Adicionar conteúdo na área de membros
7. 🔲 Fazer deploy em produção

---

**Desenvolvido com ❤️ para Percepção Social**
