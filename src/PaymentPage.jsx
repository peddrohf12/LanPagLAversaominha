import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, CreditCard, QrCode, ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

const PaymentPage = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPixCode, setShowPixCode] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  const handlePixPayment = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Gera o código PIX visual
      const code = "00020126580014br.gov.bcb.pix0136" + Math.random().toString(36).substring(2, 15);
      setPixCode(code);

      // 2. SALVA NO SUPABASE (INSERT)
      const { data, error: insertError } = await supabase
        .from('user_payments')
        .insert({
          user_id: user.id,
          email: user.email,
          payment_status: 'pending',
          payment_method: 'pix',
          amount: 17.50,
          access_granted: false,
          payment_id: `PIX_${Date.now()}`
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      
      // 3. GUARDA O ID PARA USAR NA APROVAÇÃO DEPOIS
      if (data) {
        setCurrentPaymentId(data.id);
      }
      
      setShowPixCode(true);
    } catch (err) {
      console.error('Erro ao gerar PIX:', err);
      setError('Erro ao processar pagamento. Verifique o SQL no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const simulateApproval = async () => {
    if (!currentPaymentId) {
        setError('Nenhum pagamento encontrado para aprovar.');
        return;
    }
    
    setLoading(true);
    try {
      // 4. ATUALIZA NO SUPABASE (UPDATE)
      const { error: updateError } = await supabase
        .from('user_payments')
        .update({ 
          payment_status: 'approved',
          access_granted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPaymentId);

      if (updateError) throw updateError;

      // 5. LIBERA O ACESSO NO FRONTEND
      onSuccess();
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      setError('Erro ao confirmar no banco. Verifique as políticas RLS.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixCode);
    alert('Código PIX copiado!');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-pink/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-purple/20 rounded-full blur-3xl" />

        <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-purple mb-4 shadow-lg shadow-brand-pink/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Finalizar Acesso</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!showPixCode ? (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Produto</span>
                <span className="font-medium">Acesso Vitalício</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span className="text-brand-pink text-2xl">R$ 17,50</span>
              </div>
            </div>

            <button
              onClick={() => setMethod('pix')}
              className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all ${
                method === 'pix' ? 'border-brand-pink bg-brand-pink/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <QrCode className="w-6 h-6 text-emerald-400 mr-4" />
              <div className="text-left">
                <div className="font-bold text-lg">PIX</div>
                <div className="text-sm text-gray-400">Aprovação instantânea</div>
              </div>
            </button>

            <button
              onClick={handlePixPayment}
              disabled={!method || loading}
              className="w-full bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-5 rounded-2xl mt-8 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-2 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pagar Agora'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-6 rounded-3xl mb-6 inline-block shadow-2xl">
              <QrCode className="w-32 h-32 text-brand-dark" />
            </div>
            <h3 className="text-xl font-bold mb-2">PIX Gerado!</h3>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <code className="text-xs text-gray-300 truncate mr-4">{pixCode}</code>
              <button onClick={copyToClipboard} className="text-brand-pink"><Copy className="w-5 h-5" /></button>
            </div>
            <button
              onClick={simulateApproval}
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              🧪 Simular Aprovação (TESTE)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentPage;
