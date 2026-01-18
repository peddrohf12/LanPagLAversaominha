-- ============================================
-- CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://app.supabase.com/project/_/sql

-- 1. Criar tabela de pagamentos dos usuários
CREATE TABLE IF NOT EXISTS public.user_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
    payment_method TEXT, -- pix, credit_card, boleto, etc
    payment_id TEXT, -- ID do gateway de pagamento
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    access_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- Dados adicionais do pagamento
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON public.user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_email ON public.user_payments(email);
CREATE INDEX IF NOT EXISTS idx_user_payments_status ON public.user_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_payments_payment_id ON public.user_payments(payment_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.user_payments ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Usuários podem ver apenas seus próprios pagamentos
CREATE POLICY "Users can view their own payments"
    ON public.user_payments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios pagamentos
CREATE POLICY "Users can insert their own payments"
    ON public.user_payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Apenas o sistema pode atualizar pagamentos (via service role)
CREATE POLICY "Service role can update payments"
    ON public.user_payments
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_user_payments_updated_at ON public.user_payments;
CREATE TRIGGER update_user_payments_updated_at
    BEFORE UPDATE ON public.user_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar tabela de logs de acesso (opcional, para auditoria)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    action TEXT NOT NULL, -- login, logout, access_granted, access_denied
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access logs"
    ON public.access_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- 8. Criar função para registrar pagamento aprovado
CREATE OR REPLACE FUNCTION approve_payment(payment_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_payments
    SET 
        payment_status = 'approved',
        access_granted = TRUE,
        updated_at = NOW()
    WHERE id = payment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar função para verificar se usuário tem acesso
CREATE OR REPLACE FUNCTION check_user_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_payments 
        WHERE user_id = user_uuid 
        AND payment_status = 'approved' 
        AND access_granted = TRUE
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DADOS DE TESTE (OPCIONAL - Remover em produção)
-- ============================================
-- Descomente as linhas abaixo para criar um usuário de teste com acesso aprovado
-- Substitua 'USER_ID_AQUI' pelo ID de um usuário real do auth.users

/*
INSERT INTO public.user_payments (user_id, email, payment_status, payment_method, amount, access_granted)
VALUES (
    'USER_ID_AQUI'::UUID,
    'teste@exemplo.com',
    'approved',
    'pix',
    17.50,
    TRUE
);
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar se as tabelas foram criadas corretamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_payments', 'access_logs');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_payments', 'access_logs');
