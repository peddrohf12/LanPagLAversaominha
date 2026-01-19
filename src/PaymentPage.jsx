import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, QrCode, ArrowLeft, Loader2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

const PaymentPage = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPixCode, setShowPixCode] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixImage, setPixImage] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  const handlePixPayment = async () => {
    // Log de segurança
    console.log("Tentando criar pagamento. User ID:", user?.id, "Email:", user?.email);
    
    setLoading(true);
    setError('');

    try {
      // Chamada para a Edge Function
      const response = await fetch('https://vcqgkazlxutsfzvgzxtf.supabase.co/functions/v1/pix-final', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          amount: 17.5
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro retornado pela API');
      }

      // --- AQUI ESTÁ A CORREÇÃO MÁGICA ---
      // O Mercado Pago retorna o PIX dentro de 'point_of_interaction.transaction_data'
      const qrCodeString = data.point_of_interaction?.transaction_data?.qr_code;
      const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;

      if (qrCodeString) {
        setPixCode(qrCodeString);
        
        if (qrCodeBase64) {
          setPixImage(qrCodeBase64);
        }

        setShowPixCode(true);
        
        // Salva no banco de dados como "pending"
        const { data: dbData, error: dbError } = await supabase
          .from('user_payments')
          .insert({
            user_id: user.id,
            email: user.email,
            payment_status: 'pending',
            payment_method: 'pix',
            amount: 17.50,
            access_granted: false,
            payment_id: data.id.toString()
          })
          .select()
          .maybeSingle();

        if (dbError) console.error("Erro ao salvar no banco:", dbError);
        if (dbData) setCurrentPaymentId(dbData.id);

      } else {
        // Log para ajudar no debug caso falhe
        console.error("JSON Recebido (Sem QR Code):", data);
        throw new Error('O servidor respondeu OK, mas o código PIX não foi encontrado.');
      }

    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.message || "Erro desconhecido ao gerar PIX");
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o pagamento foi aprovado
  const checkPaymentStatus = async () => {
    if (!currentPaymentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_payments')
        .select('payment_status, access_granted')
        .eq('id', currentPaymentId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.payment_status === 'approved') {
        onSuccess();
      } else {
        alert('O banco ainda não confirmou o pagamento. Aguarde alguns segundos e tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao verificar status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center p-4 font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-purple mb-4 shadow-lg shadow-brand-pink/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Pagamento Real</h2>
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
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span> <span className="text-brand-pink text-2xl">R$ 17,50</span>
              </div>
            </div>
            <button onClick={() => setMethod('pix')} className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all ${method === 'pix' ? 'border-brand-pink bg-brand-pink/10' : 'border-white/10 bg-white/5'}`}>
              <QrCode className="w-6 h-6 text-emerald-400 mr-4" />
              <div className="text-left">
                <div className="font-bold text-lg">PIX</div>
                <div className="text-sm text-gray-400">Aprovação instantânea</div>
              </div>
            </button>
            <button onClick={handlePixPayment} disabled={!method || loading} className="w-full bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-5 rounded-2xl mt-8 transition-all flex items-center justify-center gap-2 text-lg">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Gerar PIX Real'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            {/* ÁREA DO QR CODE */}
            <div className="bg-white p-4 rounded-3xl mb-6 inline-block shadow-2xl overflow-hidden">
              {pixImage ? (
                <img 
                  src={`data:image/png;base64,${pixImage}`} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 object-contain mix-blend-multiply"
                />
              ) : (
                <QrCode className="w-32 h-32 text-brand-dark" />
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-2">PIX Gerado!</h3>
            <p className="text-gray-400 mb-6 text-sm">Abra o app do seu banco e pague via PIX.</p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <code className="text-xs text-gray-300 truncate mr-4">{pixCode}</code>
              <button onClick={() => { navigator.clipboard.writeText(pixCode); alert('Copiado!'); }} className="text-brand-pink"><Copy className="w-5 h-5" /></button>
            </div>

            {/* AVISO DE ESPERA AUTOMÁTICA */}
            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-400/10 p-4 rounded-2xl animate-pulse mb-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold text-sm">Aguardando confirmação automática...</span>
            </div>
            
            {/* BOTÃO PARA CHECAR MANUALMENTE */}
            <button onClick={checkPaymentStatus} disabled={loading} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Já paguei! Verificar agora
            </button>

          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentPage;